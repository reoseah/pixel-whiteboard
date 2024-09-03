import './Canvas.css'
import * as Y from "yjs"
import { Application, RasterAction, RasterHelper } from "../../../api"
import { CanvasNode } from "../nodes"
import { onCleanup, onMount } from "solid-js"
import { actionTypes } from '../actions'

// TODO: don't expose this somehow, maybe pass as parameter wherever it's needed
export const chunkSize = 16

export const affectsChunk = (action: RasterAction, column: number, row: number) => {
  const type = actionTypes[action.type]
  const { top, left, bottom, right } = type.getBounds(action)
  return left <= column * chunkSize && column * chunkSize <= right && top <= row * chunkSize && row * chunkSize <= bottom
}

export const getAffectedChunks = (action: RasterAction) => {
  const type = actionTypes[action.type]
  const { top, left, bottom, right } = type.getBounds(action)
  const chunks = []
  for (let x = left; x <= right; x += chunkSize) {
    for (let y = top; y <= bottom; y += chunkSize) {
      chunks.push({ column: Math.floor(x / chunkSize), row: Math.floor(y / chunkSize) })
    }
  }
  return chunks
}

export const Canvas = (props: {
  app: Application,
  id: string,
  node: CanvasNode
}) => {
  if (!props.app.ydoc.getMap("canvas-actions").get(props.id)) {
    props.app.ydoc.transact(() => {
      props.app.ydoc.getMap<Y.Array<RasterAction>>("canvas-actions").set(props.id, new Y.Array<RasterAction>())
    })
  }
  const actions = props.app.ydoc.getMap<Y.Array<RasterAction>>("canvas-actions").get(props.id)!

  let containerRef!: HTMLDivElement
  let canvasRefs = new Map<`${number},${number}`, HTMLCanvasElement>()

  const getOrCreateCanvas = (x: number, y: number): HTMLCanvasElement => {
    const column = Math.floor(x / chunkSize)
    const row = Math.floor(y / chunkSize)

    const id = `${column},${row}` as `${number},${number}`

    const existing = canvasRefs.get(id)
    if (existing) {
      return existing
    }

    const canvas = document.createElement('canvas')
    canvas.className = 'canvas-chunk'
    canvas.width = chunkSize
    canvas.height = chunkSize
    canvas.style.left = `${column * chunkSize}px`
    canvas.style.top = `${row * chunkSize}px`

    containerRef.appendChild(canvas)
    canvasRefs.set(id, canvas)

    return canvas
  }

  const rerenderChunks = (positions: Array<{ column: number, row: number }>) => {
    console.log('rerendering chunks', positions)

    const canModify = (x: number, y: number) => {
      if (!positions) {
        return true
      }
      return positions.some(({ column, row }) => Math.floor(x / chunkSize) === column && Math.floor(y / chunkSize) === row)
    }

    const ctxs = new Map<HTMLCanvasElement, CanvasRenderingContext2D>()
    positions.forEach(({ column, row }) => {
      const canvas = getOrCreateCanvas(column * 64, row * 64)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.error('could not get canvas context')
        return
      }
      ctx!.clearRect(0, 0, 64, 64)
      ctxs.set(canvas, ctx)
    })

    const helper: RasterHelper = {
      get: (x: number, y: number) => {
        const canvas = getOrCreateCanvas(x, y)
        const ctx = ctxs.get(canvas)
        if (!canvas || !ctx) {
          return 0
        }
        const imageData = ctx.getImageData(x % 64, y % 64, 1, 1)
        return imageData.data[0] << 24 | imageData.data[1] << 16 | imageData.data[2] << 8 | imageData.data[3]
      },
      set: (x: number, y: number, rgba: number) => {
        if (!canModify(x, y)) {
          return
        }
        const canvas = getOrCreateCanvas(x, y)
        const ctx = ctxs.get(canvas)!
        ctx.fillStyle = `rgba(${(rgba >> 24) & 0xff}, ${(rgba >> 16) & 0xff}, ${(rgba >> 8) & 0xff}, ${rgba & 0xff})`
        ctx.fillRect(x % 64, y % 64, 1, 1)
      }
    }

    actions.forEach((action) => {
      const type = actionTypes[action.type]
      if (positions.some(({ column, row }) => affectsChunk(action, column, row))) {
        type.draw(action, helper)
      }
    })
  }

  const get = (x: number, y: number) => {
    const chunkX = Math.floor(x / chunkSize)
    const chunkY = Math.floor(y / chunkSize)
    const chunkId = `${chunkX},${chunkY}` as `${number},${number}`
    const canvas = canvasRefs.get(chunkId)
    if (!canvas) {
      return 0
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return 0
    }
    const imageData = ctx.getImageData(x % chunkSize, y % chunkSize, 1, 1)
    return imageData.data[0] << 24 | imageData.data[1] << 16 | imageData.data[2] << 8 | imageData.data[3]
  }

  const set = (x: number, y: number, rgba: number) => {
    const chunkX = Math.floor(x / chunkSize)
    const chunkY = Math.floor(y / chunkSize)
    const canvas = getOrCreateCanvas(chunkX * chunkSize, chunkY * chunkSize)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }
    ctx.fillStyle = `rgba(${(rgba >> 24) & 0xff}, ${(rgba >> 16) & 0xff}, ${(rgba >> 8) & 0xff}, ${rgba & 0xff})`
    ctx.fillRect(x % chunkSize, y % chunkSize, 1, 1)
  }

  const onDataChange = (event: Y.YEvent<Y.Array<RasterAction>>) => {
    const chunksToRerender = new Map<number, Set<number>>()

    const addedUuids = new Set<string>()

    event.changes.added.forEach((item) => {
      item.content.getContent().forEach((action) => {
        addedUuids.add(action.uuid)
        const type = actionTypes[action.type]
        type.draw(action, {
          // TODO: optimize this
          get,
          set
        })
      })
    })

    event.changes.deleted.forEach((item) => {
      item.content.getContent().forEach((action) => {
        getAffectedChunks(action).forEach((chunk) => {
          if (!addedUuids.has(action.uuid)) {
            const { column, row } = chunk
            if (!chunksToRerender.has(column)) {
              chunksToRerender.set(column, new Set<number>())
            }
            chunksToRerender.get(column)!.add(row)
          }
        })
      })
    })

    if (chunksToRerender.size !== 0) {
      const chunks = Array.from(chunksToRerender.entries()).map(([column, rows]) => {
        return Array.from(rows).map((row) => {
          return { column, row }
        })
      }).flat()
      rerenderChunks(chunks)
    }
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
      // data-selected={selected()}
      data-node-id={props.id}
    >
    </div>
  )
}