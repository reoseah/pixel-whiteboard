import { Component } from "solid-js";
import { Application, Keybind } from ".";

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
  onSelect?: (app: Application, prev: Tool | null) => void,
  onDeselect?: (app: Application) => void,
}