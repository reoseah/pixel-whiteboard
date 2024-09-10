export type CanvasActionData = {
  type: string
  uuid?: string
  [data: string]: any
}

export type CanvasAction<T extends CanvasActionData> = {
  getBounds: (action: T) => { left: number, top: number, right: number, bottom: number }
  draw: (action: T, helper: VirtualCanvas) => void,
  handleReplacement?: (oldAction: T, newAction: T, helper: VirtualCanvas) => void
}

export type VirtualCanvas = {
  readonly tileSize: number
  readonly allowList: null | {
    type: "blacklist" | "whitelist"
    positions: Map<number, Set<number>>
  }
  hasCanvas: (column: number, row: number) => boolean
  getOrCreateCanvas: (column: number, row: number) => HTMLCanvasElement
  getOrCreateContext: (column: number, row: number) => CanvasRenderingContext2D

  get: (x: number, y: number) => number
  set: (x: number, y: number, rgba: number) => void
}
