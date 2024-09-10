import { CanvasAction, getPointsOnPath } from "../../../api"

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
      for (let x = Math.round(action.points[0].x - action.size / 2); x < action.points[0].x + action.size / 2; x++) {
        for (let y = Math.round(action.points[0].y - action.size / 2); y < action.points[0].y + action.size / 2; y++) {
          helper.set(x, y, 0xffffffff)
        }
      }
      return
    }

    const { shape, size } = action

    const visited = new Map<number, Set<number>>()
    getPointsOnPath(action.points, interval).forEach((point) => {
      for (let x = Math.round(point.x - size / 2); x < point.x + size / 2; x++) {
        for (let y = Math.round(point.y - size / 2); y < point.y + size / 2; y++) {
          const filled = shape === "circle" && Math.hypot(x - point.x, y - point.y) < size / 2 || shape === "square"
          if (filled) {
            if (!visited.has(x)) {
              visited.set(x, new Set())
            } else if (visited.get(x)!.has(y)) {
              continue
            }
            helper.set(x, y, 0xffffffff)
            visited.get(x)!.add(y)
          }
        }
      }
    })
  },
  handleReplacement: (oldAction, newAction, helper) => {
    if (newAction.points.length === oldAction.points.length + 1) {
      const prev = newAction.points[newAction.points.length - 2]
      const last = newAction.points[newAction.points.length - 1]

      const visited = new Map<number, Set<number>>()
      getPointsOnPath([prev, last], interval).forEach((point) => {
        for (let x = Math.round(point.x - newAction.size / 2); x < point.x + newAction.size / 2; x++) {
          for (let y = Math.round(point.y - newAction.size / 2); y < point.y + newAction.size / 2; y++) {
            const filled = newAction.shape === "circle" && Math.hypot(x - point.x, y - point.y) < newAction.size / 2 || newAction.shape === "square"
            if (filled) {
              if (!visited.has(x)) {
                visited.set(x, new Set())
              } else if (visited.get(x)!.has(y)) {
                continue
              }
              helper.set(x, y, 0xffffffff)
              visited.get(x)!.add(y)
            }
          }
        }
      })
      return
    }
  }
}