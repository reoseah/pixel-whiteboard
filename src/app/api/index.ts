import { Accessor, Component, Setter } from "solid-js"
import { SetStoreFunction, Store } from "solid-js/store"
import { Tool } from './tool'
import { Keybind } from "./keybind"
import { NodeType, ProjectNode, ProjectState } from "./project"
import * as Y from "yjs"

export * from './tool'
export * from './keybind'
export * from './project'
export * from './util'

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
    viewportX: Accessor<number>
    setViewportX: Setter<number>
    viewportY: Accessor<number>
    setViewportY: Setter<number>
    viewportZoom: Accessor<number>
    setViewportZoom: Setter<number>
    titleBeingEdited: Accessor<string | null>
    setTitleBeingEdited: Setter<string | null>
    ctrlHeld: Accessor<boolean>
    shiftHeld: Accessor<boolean>
    spaceHeld: Accessor<boolean>
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

export const toViewportX = (app: Application, clientX: number) => Math.round((clientX - window.innerWidth / 2) / app.state.viewportZoom() - app.state.viewportX() - .5)
export const toViewportY = (app: Application, clientY: number) => Math.round((clientY - window.innerHeight / 2) / app.state.viewportZoom() - app.state.viewportY() - .5)

export const toNodePosition = (app: Application, node: ProjectNode, clientX: number, clientY: number) => {
  const nodeType = app.resources.nodeTypes[node.type]
  return nodeType.transformPosition!(node, toViewportX(app, clientX), toViewportY(app, clientY))
}