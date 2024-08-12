import { Component } from "solid-js"
import Keybind from "../keybind"
import { CommandIcon, CursorIcon, FrameIcon } from "../icons-16px"

export type Tool = {
    id: string,
    label: string,
    icon: Component<{ selected: boolean }>,
    keybinds: Keybind[],
    // TODO on select, on deselect, on workspace click/move/release handlers, etc
}

export const BUILTIN_TOOLS: Tool[] = [
    {
        id: "select",
        label: "Select\u2009/\u2009Move",
        icon: props => (<CursorIcon filled={props.selected} />),
        keybinds: [{ key: "V" }],
    },
    {
        id: "frame",
        label: "Frame",
        icon: FrameIcon,
        keybinds: [{ key: "F" }],
    },
    {
        id: "actions",
        label: "Actions",
        icon: CommandIcon,
        keybinds: [{ key: "K", ctrl: true }],
    }
]
