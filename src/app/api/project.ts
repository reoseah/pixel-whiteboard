import { Accessor, Component, Setter } from "solid-js"
import { SetStoreFunction, Store } from "solid-js/store"
import { Application } from "."

export type ProjectState = {
  nodes: Store<Record<string, ProjectNode>>
  setNodes: SetStoreFunction<Record<string, ProjectNode>>
  selectedNodes: Accessor<string[]>
  setSelectedNodes: Setter<string[]>
}

export type ProjectNode =
  | FrameNode
  | {
    type: string
    parents: string[]
    [data: string]: unknown
  }

export type FrameNode = {
  type: "frame"
  parents: never[]
  title: string | null
  x: number
  y: number
  width: number
  height: number
}

export type NodeType<T extends ProjectNode> = {
  render: Component<{ node: T, id: string, app: Application }>
}