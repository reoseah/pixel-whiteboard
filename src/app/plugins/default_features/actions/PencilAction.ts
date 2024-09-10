import { CanvasAction, getPointsOnPath, VirtualCanvas } from "../../../api"

export type PencilAction = {
  type: "pencil"
  points: Array<{ x: number, y: number }>
  shape: "circle" | "square"
  size: number
}

const interval = 1 // TODO: Make this configurable by the user

export const PencilActionType: CanvasAction<PencilAction> = {
  getBounds: (action) => {
    const left = Math.min(...action.points.map((point) => point.x))
    const top = Math.min(...action.points.map((point) => point.y))
    const right = Math.max(...action.points.map((point) => point.x))
    const bottom = Math.max(...action.points.map((point) => point.y))
    return { left, top, right, bottom }
  },
  draw: (action, helper) => {
    if (action.points.length === 1) {
      const { x, y } = action.points[0]

      const visited = new Map<number, Set<number>>()
      drawShape(action.shape, action.size, x, y, visited)
      visited.forEach((set, x) => {
        set.forEach((y) => {
          helper.set(x, y, 0xffffffff)
        })
      })
      return
    }

    const { shape, size } = action

    const visited = new Map<number, Set<number>>()
    getPointsOnPath(action.points, interval).forEach((point) => {
      drawShape(shape, size, point.x, point.y, visited)
    })
    visited.forEach((set, x) => {
      set.forEach((y) => {
        helper.set(x, y, 0xffffffff)
      })
    })
  },
  handleReplacement: (oldAction, newAction, helper) => {
    if (newAction.points.length === oldAction.points.length + 1) {
      const prev = newAction.points[newAction.points.length - 2]
      const last = newAction.points[newAction.points.length - 1]

      const visited = new Map<number, Set<number>>()
      getPointsOnPath([prev, last], interval).forEach((point) => {
        drawShape(newAction.shape, newAction.size, point.x, point.y, visited)
      })
      visited.forEach((set, x) => {
        set.forEach((y) => {
          helper.set(x, y, 0xffffffff)
        })
      })
      return true
    }
    return false
  }
}

const drawShape = (shape: "circle" | "square", size: number, x: number, y: number, visited: Map<number, Set<number>>) => {
  const minX = x - Math.floor(size / 2)
  const minY = y - Math.floor(size / 2)
  const maxX = x + Math.ceil(size / 2)
  const maxY = y + Math.ceil(size / 2)

  const cx = (size % 2 === 0) ? x - 0.5 : x
  const cy = (size % 2 === 0) ? y - 0.5 : y

  for (let ix = minX; ix < maxX; ix++) {
    for (let iy = minY; iy < maxY; iy++) {
      if (shape === "circle") {
        if (Math.hypot(ix - cx, iy - cy) > size / 2) {
          continue
        }
      }
      if (!visited.has(ix)) {
        visited.set(ix, new Set())
      } else if (visited.get(ix)!.has(iy)) {
        continue
      }
      // canvas.set(ix, iy, 0xffffffff)
      visited.get(ix)!.add(iy)
    }
  }
}