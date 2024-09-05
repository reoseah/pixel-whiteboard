import { Accessor, Component, Setter } from "solid-js"
import { SetStoreFunction, Store } from "solid-js/store"
import { Application } from "."

export type ProjectState = {
  nodes: Store<Record<string, ProjectNode>>
  setNodes: SetStoreFunction<Record<string, ProjectNode>>
  selectedNodes: Accessor<string[]>
  setSelectedNodes: Setter<string[]>
}

export type ProjectNode = {
  type: string
  children: string[]
  [data: string]: unknown
}

export type NodeType<T extends ProjectNode> = {
  render: Component<{ node: T, id: string, app: Application }>
  transformPosition?: (node: T, x: number, y: number) => { x: number, y: number }
  supportsRasterActions?: boolean
  addRasterAction?: (node: T, nodeId: string, action: RasterAction, app: Application) => void
  replaceOrAddRasterAction?: (node: T, nodeId: string, previous: RasterAction, replacement: RasterAction, app: Application) => void
  onDelete?: (node: T, nodeId: string, app: Application) => void
}

export type RasterAction = {
  type: string
  uuid?: string
  [data: string]: any
}

export type RasterActionType<T extends RasterAction> = {
  getBounds: (action: T) => { left: number, top: number, right: number, bottom: number }
  draw: (action: T, helper: RasterHelper) => void,
  handleReplacement?: (oldAction: T, newAction: T, helper: RasterHelper) => void
}

export type RasterHelper = {
  get: (x: number, y: number) => number
  set: (x: number, y: number, rgba: number) => void
}
