import { Accessor, Component, Setter } from "solid-js"
import { SetStoreFunction, Store } from "solid-js/store"
import { Tool } from './tool'

export * from './tool'

// TODO: split into multiple files (resources.ts, project_state.ts, misc/keybind.ts, etc)

export type Application = {
  resources: Resources,
  project: ProjectState,
  state: {
    selectedTool: Accessor<Tool>,
    setSelectedTool: (tool: Tool) => void,
    selectedToolStore: Store<any>,
    setSelectedToolStore: SetStoreFunction<any>
    selectedToolComponent: Accessor<Component<{ app: Application }> | null>,
    setSelectedToolComponent: Setter<Component<{ app: Application }> | null>,
    selectedToolExtraToolbar: Accessor<Component<{ app: Application }> | null>,
    setSelectedToolExtraToolbar: Setter<Component<{ app: Application }> | null>,
    shiftHeld: Accessor<boolean>,
  }
}

export type Resources = {
  tools: Record<string, Tool>,
  commands: readonly Command[],
  // nodeTypes: Record<string, NodeType>
}

export type Plugin = {
  id: string,
  title: string,
  initialize: (registry: ResourceBuilder) => void
}

export type ResourceBuilder = {
  addTool: (tool: Tool) => void,
  addCommand: (command: Command) => void
}

export type Keybind = {
  key: string,
  shift?: true,
  ctrl?: true,
  alt?: true,
  // TODO: MacOS support
}

export type Command = {
  label: string,
  icon?: Component,
  keybinds?: Keybind[],
  isDisabled?: (app: Application) => boolean,
  execute: (app: Application) => void,
  // keywords?: string[],
}

// export type NodeType = {
// 
// }

export type ProjectState = {
  nodes: Store<Record<string, ProjectNode>>,
  setNodes: SetStoreFunction<Record<string, ProjectNode>>,
  selectedNodes: Accessor<string[]>,
  setSelectedNodes: Setter<string[]>
}

export type ProjectNode = { type: string, parents: string[], [data: string]: any }

export type FrameNode = ProjectNode & { type: "frame", parents: never[], title: string | null, x: number, y: number, width: number, height: number };
