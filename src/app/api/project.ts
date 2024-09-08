import { Accessor, Component, Setter } from "solid-js"
import { SetStoreFunction, Store } from "solid-js/store"
import { Application, CanvasActionData } from "."

export type ProjectState = {
  nodes: Store<Record<string, NodeData>>
  setNodes: SetStoreFunction<Record<string, NodeData>>
  selectedNodes: Accessor<string[]>
  setSelectedNodes: Setter<string[]>
}

export type NodeData = {
  type: string
  children: string[]
  [data: string]: unknown
}

export type NodeType<T extends NodeData> = {
  render: Component<{ node: T, id: string, app: Application }>
  transformPosition?: (node: T, x: number, y: number) => { x: number, y: number }
  supportsCanvasActions?: boolean
  addCanvasAction?: (node: T, id: string, action: CanvasActionData, app: Application) => void
  replaceOrAddCanvasAction?: (node: T, id: string, previous: CanvasActionData, replacement: CanvasActionData, app: Application) => void
  onDelete?: (node: T, id: string, app: Application) => void
}