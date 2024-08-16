import { Accessor, Component, Setter } from "solid-js"
import { SetStoreFunction, Store } from "solid-js/store"

export type Application = {
  resources: Resources,
  project: ProjectState,
  state: {
    selectedTool: Accessor<Tool>,
    setSelectedTool: (tool: Tool) => void,
    selectedToolStore: Store<any>,
    setSelectedToolStore: SetStoreFunction<any>
    selectedToolComponent: Accessor<Component | null>,
    setSelectedToolComponent: Setter<Component | null>,
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

export type Tool = {
  id: string,
  label: string,
  icon: Component<{ selected: boolean }>,
  keybinds: Keybind[],
  /** 
   * Return true if the tool should be able to click on the frame titles.
   * 
   * I.e., if false, the titles with have "pointer-events: none" and clicks
   * will go through them to the element behind or the workspace.
   */
  interactsWithTitles?: boolean,
  onPress?: (app: Application, x: number, y: number, nodeId: string | null, isTitle?: boolean) => boolean | void,
  onMove?: (app: Application, x: number, y: number, prevX: number, prevY: number) => void,
  onRelease?: (app: Application, x: number, y: number, prevX: number, prevY: number) => void,
  // onCancel?: (app: Application) => void,
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
