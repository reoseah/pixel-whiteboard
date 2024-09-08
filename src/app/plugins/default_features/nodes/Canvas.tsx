import './Canvas.css'
import * as Y from "yjs"
import { createEffect, onCleanup, onMount } from "solid-js"
import { Application, NodeType, CanvasActionData, VirtualCanvas } from "../../../api"
import { actionTypes } from '../actions'

export type Canvas = {
    type: "canvas"
    children: never[]
}

export const CanvasType: NodeType<Canvas> = {
    render: props => CanvasComponent(props),
    addCanvasAction: (_: Canvas, nodeId: string, action: CanvasActionData, app: Application) => {
        const actions = getOrCreateRasterActions(nodeId, app)
        actions.push([action])
    },
    replaceOrAddCanvasAction: (_: Canvas, nodeId: string, previous: CanvasActionData, replacement: CanvasActionData, app: Application) => {
        const actions = getOrCreateRasterActions(nodeId, app)
        if (actions.get(actions.length - 1) === previous) {
            app.ydoc.transact(() => {
                actions.delete(actions.length - 1)
                actions.push([replacement])
            })
        } else {
            actions.push([replacement])
        }
    },
    onDelete: (_: Canvas, nodeId: string, app: Application) => {
        app.ydoc.transact(() => {
            app.ydoc.getMap<Y.Array<CanvasActionData>>("canvas-actions").delete(nodeId)
        })
    }
}

const getOrCreateRasterActions = (nodeId: string, app: Application) => {
    return app.ydoc.getMap<Y.Array<CanvasActionData>>("canvas-actions").get(nodeId)
        || app.ydoc.getMap<Y.Array<CanvasActionData>>("canvas-actions").set(nodeId, new Y.Array<CanvasActionData>())
}

const tileSize = 32

export const CanvasComponent = (props: {
    app: Application,
    id: string,
    node: Canvas
}) => {
    const actions = getOrCreateRasterActions(props.id, props.app)

    let containerRef!: HTMLDivElement
    let canvasRefs = new Map<number, Map<number, HTMLCanvasElement>>()
    let contexts = new Map<HTMLCanvasElement, CanvasRenderingContext2D>()

    createEffect(() => {
        const zoom = props.app.state.viewportZoom()
        canvasRefs.forEach((rows, column) => {
            rows.forEach((canvas, row) => {
                canvas.style.left = `${column * tileSize * zoom}px`
                canvas.style.top = `${row * tileSize * zoom}px`
                canvas.style.width = `${tileSize * zoom}px`
                canvas.style.height = `${tileSize * zoom}px`
            })
        })
    })

    const rerenderChunks = (positions: Map<number, Set<number>>) => {
        const helper = new VirtualCanvasImpl(tileSize, containerRef, canvasRefs, contexts, props.app, positions, "whitelist")

        positions.forEach((rows, column) => {
            rows.forEach((row) => {
                helper.getOrCreateContext(column * tileSize, row * tileSize)
                    .clearRect(0, 0, 64, 64)
            })
        })

        actions.forEach((action) => {
            const type = actionTypes[action.type]

            positions.forEach((rows, column) => {
                rows.forEach((row) => {
                    if (affectsChunk(action, column, row)) {
                        type.draw(action, helper)
                    }
                })
            })
        })
    }

    const onDataChange = (event: Y.YEvent<Y.Array<CanvasActionData>>) => {
        if (isReplacementOfLastElement(event)) {
            const oldAction = event.changes.deleted.values().next().value.content.getContent()[0]
            const newAction = event.changes.added.values().next().value.content.getContent()[0]

            const type = actionTypes[newAction.type]
            if (type.handleReplacement) {
                const helper = new VirtualCanvasImpl(tileSize, containerRef, canvasRefs, contexts, props.app)
                type.handleReplacement(oldAction, newAction, helper)
                return
            }
        }

        const deletionAffectedChunks = getChunksAffectedByDeletions(event)
        if (deletionAffectedChunks.size !== 0) {
            rerenderChunks(deletionAffectedChunks)
        }

        const additionsHelper = new VirtualCanvasImpl(tileSize, containerRef, canvasRefs, contexts, props.app, deletionAffectedChunks, "blacklist")

        event.changes.added.forEach((item) => {
            item.content.getContent().forEach((action) => {
                const type = actionTypes[action.type]
                type.draw(action, additionsHelper)
            })
        })
    }
    onMount(() => {
        actions.observe(onDataChange)
    })
    onCleanup(() => {
        actions.unobserve(onDataChange)
    })

    return (
        <div
            ref={containerRef}
            class="canvas-container"
            data-selected={props.app.project.selectedNodes().includes(props.id)}
            data-node-id={props.id}
        >
        </div>
    )
}

class VirtualCanvasImpl implements VirtualCanvas {
    public allowList: { type: "blacklist" | "whitelist", positions: Map<number, Set<number>> } | null

    constructor(
        public readonly tileSize: number,
        private containerRef: HTMLDivElement,
        private canvasRefs: Map<number, Map<number, HTMLCanvasElement>>,
        private contexts: Map<HTMLCanvasElement, CanvasRenderingContext2D>,
        private app: Application,
        private chunks?: Map<number, Set<number>>,
        private chunkMode?: "blacklist" | "whitelist"
    ) {
        if (chunkMode) {
            this.allowList = {
                type: chunkMode,
                positions: chunks!
            }
        } else {
            this.allowList = null
        }
    }

    public hasCanvas(column: number, row: number): boolean {
        return this.canvasRefs.has(column) && this.canvasRefs.get(column)!.has(row)
    }

    public getOrCreateCanvas(column: number, row: number): HTMLCanvasElement {
        const existing = this.canvasRefs.get(column)?.get(row)
        if (existing) {
            return existing
        }

        const canvas = document.createElement('canvas')
        canvas.className = 'canvas-chunk'
        canvas.width = tileSize
        canvas.height = tileSize
        canvas.style.left = `${column * tileSize * this.app.state.viewportZoom()}px`
        canvas.style.top = `${row * tileSize * this.app.state.viewportZoom()}px`
        canvas.style.width = `${tileSize * this.app.state.viewportZoom()}px`
        canvas.style.height = `${tileSize * this.app.state.viewportZoom()}px`

        this.containerRef.appendChild(canvas)
        if (!this.canvasRefs.has(column)) {
            this.canvasRefs.set(column, new Map())
        }
        this.canvasRefs.get(column)!.set(row, canvas)

        return canvas
    }

    public getOrCreateContext(column: number, row: number): CanvasRenderingContext2D {
        const canvas = this.getOrCreateCanvas(column, row)
        if (this.contexts.has(canvas)) {
            return this.contexts.get(canvas)!
        }
        const ctx = canvas.getContext('2d')
        if (!ctx) {
            throw new Error('could not get canvas context')
        }
        this.contexts.set(canvas, ctx)
        return ctx
    }

    public get(x: number, y: number): number {
        const ctx = this.getOrCreateContext(Math.floor(x / tileSize), Math.floor(y / tileSize))
        const localX = ((x % tileSize) + tileSize) % tileSize
        const localY = ((y % tileSize) + tileSize) % tileSize
        const imageData = ctx.getImageData(localX, localY, 1, 1)
        return imageData.data[0] << 24 | imageData.data[1] << 16 | imageData.data[2] << 8 | imageData.data[3]
    }

    public set(x: number, y: number, rgba: number): void {
        if (this.chunks) {
            if (this.chunkMode === "blacklist" && containsPoint(x, y, this.chunks, tileSize)
                || this.chunkMode === "whitelist" && !containsPoint(x, y, this.chunks, tileSize)) {
                return
            }
        }
        const ctx = this.getOrCreateContext(Math.floor(x / tileSize), Math.floor(y / tileSize))
        const localX = ((x % tileSize) + tileSize) % tileSize
        const localY = ((y % tileSize) + tileSize) % tileSize
        ctx.fillStyle = `rgba(${(rgba >> 24) & 0xff}, ${(rgba >> 16) & 0xff}, ${(rgba >> 8) & 0xff}, ${rgba & 0xff})`
        ctx.fillRect(localX, localY, 1, 1)
    }
}

export const affectsChunk = (action: CanvasActionData, column: number, row: number) => {
    const type = actionTypes[action.type]
    const actionBounds = type.getBounds(action)
    const chunkBounds = {
        left: column * tileSize,
        top: row * tileSize,
        right: column * tileSize + tileSize - 1,
        bottom: row * tileSize + tileSize - 1
    }
    return doRectanglesIntersect(actionBounds, chunkBounds)
}

const doRectanglesIntersect = (a: { left: number, top: number, right: number, bottom: number }, b: { left: number, top: number, right: number, bottom: number }) => {
    return a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top
}

export const getAffectedChunks = (action: CanvasActionData) => {
    const type = actionTypes[action.type]
    const { top, left, bottom, right } = type.getBounds(action)
    const chunks = []
    for (let x = left; x <= right; x += tileSize) {
        for (let y = top; y <= bottom; y += tileSize) {
            chunks.push({ column: Math.floor(x / tileSize), row: Math.floor(y / tileSize) })
        }
    }
    return chunks
}

const isReplacementOfLastElement = (event: Y.YEvent<Y.Array<any>>): boolean => {
    if (event.changes.delta.length <= 1 || event.changes.delta.length > 3) {
        return false
    }

    const lastChange = event.changes.delta.at(-1)!
    if (lastChange.insert === undefined || lastChange.insert!.length !== 1) {
        return false
    }
    const secondToLastChange = event.changes.delta.at(-2)!
    if (secondToLastChange.delete === undefined || secondToLastChange.delete !== 1) {
        return false
    }
    if (event.changes.delta.length === 3) {
        const thirdToLastChange = event.changes.delta.at(0)!
        if (thirdToLastChange.retain === undefined) {
            return false
        }
    }
    return true
}

const getChunksAffectedByDeletions = (event: Y.YEvent<Y.Array<CanvasActionData>>): Map<number, Set<number>> => {
    const chunks = new Map<number, Set<number>>()
    event.changes.deleted.forEach((item) => {
        item.content.getContent().forEach((action) => {
            getAffectedChunks(action).forEach((chunk) => {
                const { column, row } = chunk
                if (!chunks.has(column)) {
                    chunks.set(column, new Set<number>())
                }
                chunks.get(column)!.add(row)
            })
        })
    })
    return chunks
}

const containsPoint = (x: number, y: number, chunks: Map<number, Set<number>>, chunkSize: number) => {
    const column = Math.floor(x / chunkSize)
    const row = Math.floor(y / chunkSize)
    return chunks.has(column) && chunks.get(column)!.has(row)
}
