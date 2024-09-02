import { CanvasActionType, chunkSize, NodeType } from "../../api"
import { Frame } from './components/Frame'
import { Canvas } from './components/Canvas'

export type FrameNode = {
  type: "frame"
  parents: [string] | []
  title: string | null
  x: number
  y: number
  width: number
  height: number
}

export const FrameType: NodeType<FrameNode> = {
  render: Frame
}

export type CanvasNode = {
  type: "canvas"
  parents: never[]
  // each canvas has a Y.Array with its data stored separately
  // in Y.Doc using the same uuid as the node
}

export const CanvasType: NodeType<CanvasNode> = {
  render: Canvas
}