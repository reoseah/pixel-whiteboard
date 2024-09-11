import { Accessor, Component, Setter } from "solid-js"
import { SetStoreFunction, Store } from "solid-js/store"
import * as Y from "yjs"
import { Resources, Tool } from './resources'
import { ProjectState as Project } from "./project"

export * from './resources'
export * from './keybind'
export * from './project'
export * from './canvas_action'
export * from './util'

export type Application = {
  resources: Resources
  project: Project
  state: {
    selectedNodes: Accessor<string[]>
    setSelectedNodes: Setter<string[]>

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

    highlightedNodes: Accessor<string[]>
    setHighlightedNodes: Setter<string[]>

    selection: Accessor<Selection[]>
    setSelection: Setter<Selection[]>

    ctrlHeld: Accessor<boolean>
    shiftHeld: Accessor<boolean>
    spaceHeld: Accessor<boolean>
  }
  ydoc: Y.Doc
}

export type Selection =
  | { type: "rectangle", x: number, y: number, width: number, height: number }