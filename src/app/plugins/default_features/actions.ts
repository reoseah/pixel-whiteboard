import { CanvasActionType, chunkSize } from "../../api";

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
  affectsChunk: (action, column, row) => {
    return action.points.some((point) => {
      return Math.floor(point.x / chunkSize) === Math.floor(column) &&
        Math.floor(point.y / chunkSize) === Math.floor(row)
    })
  },
  getAffectedChunks: (action) => {
    return getUniquePoints(action.points.map((point) => {
      return {
        column: Math.floor(point.x / chunkSize),
        row: Math.floor(point.y / chunkSize)
      }
    }))
  },
  draw: (action, helper) => {
    // TODO: implement a better drawing algorithm
    action.points.forEach((point) => {
      helper.set(point.x, point.y, 0xffffffff)
    })
  }
}

// TODO: make a resource added through plugins
export const actionTypes: Record<string, CanvasActionType<any>> = {
  pencil: PencilActionType
}