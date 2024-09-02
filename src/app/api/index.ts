import { Accessor, Component, Setter } from "solid-js"
import { SetStoreFunction, Store } from "solid-js/store"
import { Tool } from './tool'
import { Keybind } from "./keybind"
import { NodeType, ProjectNode, ProjectState } from "./project"
import * as Y from "yjs"

export * from './tool'
export * from './keybind'
export * from './project'

export type Application = {
  resources: Resources
  project: ProjectState
  state: {
    tool: Accessor<Tool>
    selectTool: (tool: Tool) => void
    subToolbar: Accessor<Component<{ app: Application }> | undefined>
    setSubToolbar: Setter<Component<{ app: Application }> | undefined>
    viewportElements: Store<Record<string, Component<{ app: Application }>>>
    setViewportElements: SetStoreFunction<Record<string, Component<{ app: Application }>>>
    shiftHeld: Accessor<boolean>
  }
  ydoc: Y.Doc
}

export type Resources = {
  tools: Readonly<Record<string, Tool>>
  commands: readonly Command[]
  nodeTypes: Readonly<Record<string, NodeType<any>>>
}

export type Plugin = {
  id: string
  title: string
  initialize: (registry: ResourceBuilder) => void
  // TODO: allow declaring dependencies on other plugins
}

export type ResourceBuilder = {
  addTool: (tool: Tool) => void
  addCommand: (command: Command) => void
  addNodeType: <T extends ProjectNode>(type: string, nodeType: NodeType<T>) => void
}

export type Command = {
  label: string
  icon?: Component
  keybinds?: Keybind[]
  isDisabled?: (app: Application) => boolean
  execute: (app: Application) => void
  // keywords?: string[]
}
