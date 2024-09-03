import { CanvasActionType } from "../../api";

export type PencilAction = {
  type: "pencil"
  uuid: string
  points: Array<{ x: number, y: number }>
}

export const getUniquePoints = (points: Array<{ column: number, row: number }>): Array<{ column: number, row: number }> => {
  return points.filter((point, index, self) =>
    index === self.findIndex((p) => p.column === point.column && p.row === point.row)
  );
};

export const PencilActionType: CanvasActionType<PencilAction> = {
  getBounds: (action) => {
    const left = Math.min(...action.points.map((point) => point.x))
    const top = Math.min(...action.points.map((point) => point.y))
    const right = Math.max(...action.points.map((point) => point.x))
    const bottom = Math.max(...action.points.map((point) => point.y))
    return { left, top, right, bottom }
  },
  draw: (action, helper) => {
    // TODO: implement a better drawing algorithm
    action.points.forEach((point) => {
      helper.set(point.x, point.y, 0xffffffff)
    })
  }
}

// TODO: make it a resource added through plugins
export const actionTypes: Record<string, CanvasActionType<any>> = {
  'pencil': PencilActionType
}