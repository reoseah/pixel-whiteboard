import { CanvasAction } from "../../api";

export type PencilAction = {
  type: "pencil"
  points: Array<{ x: number, y: number }>
}

export const getUniquePoints = (points: Array<{ column: number, row: number }>): Array<{ column: number, row: number }> => {
  return points.filter((point, index, self) =>
    index === self.findIndex((p) => p.column === point.column && p.row === point.row)
  )
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

    let prev = action.points[0]
    for (let i = 1; i < action.points.length; i++) {
      const point = action.points[i]
      drawPixelLine(prev.x, prev.y, point.x, point.y, (x, y) => {
        helper.set(x, y, 0xffffffff)
      })
      prev = point
    }
  },
  handleReplacement: (oldAction, newAction, helper) => {
    if (newAction.points.length === oldAction.points.length + 1) {
      const prev = newAction.points[newAction.points.length - 2]
      const last = newAction.points[newAction.points.length - 1]
      drawPixelLine(prev.x, prev.y, last.x, last.y, (x, y) => {
        helper.set(x, y, 0xffffffff)
      })
      return
    }
  }
}

export function drawPixelLine(startX: number, startY: number, endX: number, endY: number, drawPixel: (x: number, y: number) => void) {
  const deltaX = Math.abs(endX - startX)
  const deltaY = Math.abs(endY - startY)
  const signX = startX < endX ? 1 : -1
  const signY = startY < endY ? 1 : -1
  let error = deltaX - deltaY

  while (true) {
    drawPixel(startX, startY)

    if (startX === endX && startY === endY) {
      break
    }
    const error2 = 2 * error

    if (error2 > -deltaY) {
      error -= deltaY
      startX += signX
    }

    if (error2 < deltaX) {
      error += deltaX
      startY += signY
    }
  }
}

// TODO: make it a resource added through plugins
export const actionTypes: Record<string, CanvasAction<any>> = {
  'pencil': PencilActionType
}