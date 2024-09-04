import './Canvas.css'
import * as Y from "yjs"
import { Application, RasterAction, RasterHelper } from "../../../api"
import { CanvasNode } from "../nodes"
import { onCleanup, onMount } from "solid-js"
import { actionTypes } from '../actions'

// TODO: don't expose this somehow, maybe pass as parameter wherever it's needed
export const chunkSize = 64

const doRectanglesIntersect = (a: { left: number, top: number, right: number, bottom: number }, b: { left: number, top: number, right: number, bottom: number }) => {
  return a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top
}

export const affectsChunk = (action: RasterAction, column: number, row: number) => {
  const type = actionTypes[action.type]
  const actionBounds = type.getBounds(action)
  const chunkBounds = {
    left: column * chunkSize,
    top: row * chunkSize,
    right: column * chunkSize + chunkSize - 1,
    bottom: row * chunkSize + chunkSize - 1
  }
  return doRectanglesIntersect(actionBounds, chunkBounds)
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
  let contexts = new Map<HTMLCanvasElement, CanvasRenderingContext2D>()

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

  const getContext = (x: number, y: number): CanvasRenderingContext2D => {
    const canvas = getOrCreateCanvas(x, y)
    if (contexts.has(canvas)) {
      return contexts.get(canvas)!
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('could not get canvas context')
    }
    contexts.set(canvas, ctx)
    return ctx
  }

  const rerenderChunks = (positions: Array<{ column: number, row: number }>) => {
    const canModify = (x: number, y: number) => {
      if (!positions) {
        return true
      }
      return positions.some(({ column, row }) => Math.floor(x / chunkSize) === column && Math.floor(y / chunkSize) === row)
    }

    positions.forEach(({ column, row }) => {
      const ctx = getContext(column * chunkSize, row * chunkSize)
      ctx!.clearRect(0, 0, 64, 64)
    })

    const helper: RasterHelper = {
      get: (x: number, y: number) => {
        const ctx = getContext(x, y)
        const localX = ((x % chunkSize) + chunkSize) % chunkSize
        const localY = ((y % chunkSize) + chunkSize) % chunkSize
        const imageData = ctx.getImageData(localX, localY, 1, 1)
        return imageData.data[0] << 24 | imageData.data[1] << 16 | imageData.data[2] << 8 | imageData.data[3]
      },
      set: (x: number, y: number, rgba: number) => {
        if (!canModify(x, y)) {
          return
        }
        const ctx = getContext(x, y)
        const localX = ((x % chunkSize) + chunkSize) % chunkSize
        const localY = ((y % chunkSize) + chunkSize) % chunkSize
        ctx.fillStyle = `rgba(${(rgba >> 24) & 0xff}, ${(rgba >> 16) & 0xff}, ${(rgba >> 8) & 0xff}, ${rgba & 0xff})`
        ctx.fillRect(localX, localY, 1, 1)
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
    const ctx = getContext(x, y)
    const localX = ((x % chunkSize) + chunkSize) % chunkSize
    const localY = ((y % chunkSize) + chunkSize) % chunkSize
    const imageData = ctx.getImageData(localX, localY, 1, 1)

    return imageData.data[0] << 24 | imageData.data[1] << 16 | imageData.data[2] << 8 | imageData.data[3]
  }

  const set = (x: number, y: number, rgba: number) => {
    const ctx = getContext(x, y)
    const localX = ((x % chunkSize) + chunkSize) % chunkSize
    const localY = ((y % chunkSize) + chunkSize) % chunkSize
    ctx.fillStyle = `rgba(${(rgba >> 24) & 0xff}, ${(rgba >> 16) & 0xff}, ${(rgba >> 8) & 0xff}, ${rgba & 0xff})`
    ctx.fillRect(localX, localY, 1, 1)
  }

  const onDataChange = (event: Y.YEvent<Y.Array<RasterAction>>) => {
    // TODO wip 

    // const isReplacementOfLastAction = (): boolean => {
    //   if (event.changes.delta.length <= 1 || event.changes.delta.length > 3) {
    //     return false
    //   }

    //   const lastChange = event.changes.delta.at(-1)!
    //   if (lastChange.insert === undefined || lastChange.insert!.length !== 1) {
    //     return false
    //   }
    //   const secondToLastChange = event.changes.delta.at(-2)!
    //   if (secondToLastChange.delete === undefined || secondToLastChange.delete !== 1) {
    //     return false
    //   }
    //   if (event.changes.delta.length === 3) {
    //     const thirdToLastChange = event.changes.delta.at(0)!
    //     if (thirdToLastChange.retain === undefined) {
    //       return false
    //     }
    //   }
    //   return true
    // }

    // console.log('is replacement of last action', isReplacementOfLastAction())

    // const getChunksAffectedByDeletions = (): Map<number, Set<number>> => {
    //   const chunks = new Map<number, Set<number>>()
    //   event.changes.deleted.forEach((item) => {
    //     item.content.getContent().forEach((action) => {
    //       getAffectedChunks(action).forEach((chunk) => {
    //         const { column, row } = chunk
    //         if (!chunks.has(column)) {
    //           chunks.set(column, new Set<number>())
    //         }
    //         chunks.get(column)!.add(row)
    //       })
    //     })
    //   })
    //   return chunks
    // }

    // console.log('chunks affected by deletions', getChunksAffectedByDeletions())

    const chunksToRerender = new Map<number, Set<number>>()

    event.changes.deleted.forEach((item) => {
      item.content.getContent().forEach((action) => {
        getAffectedChunks(action).forEach((chunk) => {
          const { column, row } = chunk
          if (!chunksToRerender.has(column)) {
            chunksToRerender.set(column, new Set<number>())
          }
          chunksToRerender.get(column)!.add(row)
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

    event.changes.added.forEach((item) => {
      item.content.getContent().forEach((action) => {
        const type = actionTypes[action.type]
        type.draw(action, {
          // TODO: optimize this
          get,
          set
        })
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
      // data-selected={selected()}
      data-node-id={props.id}
    >
    </div>
  )
}