import { Accessor, Setter } from "solid-js"
import { SetStoreFunction, Store } from "solid-js/store"

export type ProjectState = {
  nodes: Store<Record<string, ProjectNode>>
  setNodes: SetStoreFunction<Record<string, ProjectNode>>
  selectedNodes: Accessor<string[]>
  setSelectedNodes: Setter<string[]>
}

export type ProjectNode = {
  type: string,
  parents: string[],
  [data: string]: any
}

export type FrameNode = ProjectNode & {
  type: "frame",
  parents: never[],
  title: string | null,
  x: number,
  y: number,
  width: number,
  height: number
}

// export type NodeType = {
// 
// }