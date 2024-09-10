import { CanvasAction, getPointsOnPath } from "../../../api"

export type PencilAction = {
  type: "pencil"
  points: Array<{ x: number, y: number }>
}

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
      const point = action.points[0]
      helper.set(point.x, point.y, 0xffffffff)
      return
    }

    getPointsOnPath(action.points, 1).forEach((point) => {
      helper.set(point.x, point.y, 0xffffffff)
    })
  },
  handleReplacement: (oldAction, newAction, helper) => {
    if (newAction.points.length === oldAction.points.length + 1) {
      const prev = newAction.points[newAction.points.length - 2]
      const last = newAction.points[newAction.points.length - 1]

      getPointsOnPath([prev, last], 1).forEach((point) => {
        helper.set(point.x, point.y, 0xffffffff)
      })
      return
    }
  }
}

export const getUniquePoints = (points: Array<{ column: number, row: number }>): Array<{ column: number, row: number }> => {
  return points.filter((point, index, self) =>
    index === self.findIndex((p) => p.column === point.column && p.row === point.row)
  )
}
