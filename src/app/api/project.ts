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
  parents: string[]
  [data: string]: unknown
}

export type NodeType<T extends ProjectNode> = {
  render: Component<{ node: T, id: string, app: Application }>
}

export type CanvasAction = {
  type: string
  uuid?: string
  [data: string]: any
}

export type CanvasActionType<T extends CanvasAction> = {
  getBounds: (action: T) => { left: number, top: number, right: number, bottom: number }
  draw: (action: T, helper: CanvasHelper) => void
}

export type CanvasHelper = {
  get: (x: number, y: number) => number
  set: (x: number, y: number, rgba: number) => void
}
