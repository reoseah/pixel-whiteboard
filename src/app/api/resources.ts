import { Component } from "solid-js";
import { Application, Keybind, NodeType, NodeData, CanvasAction } from ".";

export type Resources = {
  readonly tools: Readonly<Record<string, Tool>>
  readonly commands: readonly Command[]
  readonly nodes: Readonly<Record<string, NodeType>>
  readonly actions: Readonly<Record<string, CanvasAction>>
}

export type Plugin = {
  id: string
  title: string
  initialize: (registry: ResourceBuilder) => void
}

export type ResourceBuilder = {
  addTool: (tool: Tool) => void
  addCommand: (command: Command) => void
  addNodeType: <T extends NodeData>(type: string, nodeType: NodeType<T>) => void
  addActionType: (type: string, action: CanvasAction) => void
}

export type Tool = {
  id: string
  label: string
  icon: Component<{ selected: boolean }>
  keybinds: Keybind[],
  interactsWithTitles?: boolean
  cursor?: string
  onSelect?: (app: Application, previousTool: Tool) => void
  onDeselect?: (app: Application) => void,
}

export type Command = {
  label: string
  icon?: Component
  keybinds?: Keybind[]
  isDisabled?: (app: Application) => boolean
  execute: (app: Application) => void
  // keywords?: string[]
}