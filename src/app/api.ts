import { Accessor, Component, Setter } from "solid-js"
import { SetStoreFunction, Store } from "solid-js/store"

export type Application = {
    resources: Resources,
    project: ProjectState,
    state: {
        selectedTool: Accessor<string>,
        setSelectedTool: Setter<string>
    }
}

export type Resources = {
    tools: readonly Tool[],
    commands: readonly Command[]
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
    alt?: true
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
    // TODO on select, on deselect, on workspace click/move/release handlers, etc
}

export type ProjectState = {
    nodes: Store<Record<string, ProjectNode>>,
    setNodes: SetStoreFunction<Record<string, ProjectNode>>,
    selectedNodes: Accessor<string[]>,
    setSelectedNodes: Setter<string[]>
}

export type ProjectNode = { type: string, parents: string[], [data: string]: any }

export type FrameNode = ProjectNode & { type: "frame", parents: never[], title: string | null, x: number, y: number, width: number, height: number };
