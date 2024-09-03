import { Component } from "solid-js";
import { Application, Keybind } from ".";

export type Tool = {
  id: string
  label: string
  icon: Component<{ selected: boolean }>
  keybinds: Keybind[],
  interactsWithTitles?: boolean
  onSelect?: (app: Application, previousTool: Tool) => void
  onDeselect?: (app: Application) => void,
}