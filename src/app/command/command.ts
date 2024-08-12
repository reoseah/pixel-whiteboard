import { Component } from "solid-js"
import { AppState } from "../App"
import { Keybind } from "../keybind";
import { reconcile } from "solid-js/store";
import { BUILTIN_TOOLS } from "../tool/tool";

export type Command = {
    label: string,
    icon?: Component,
    keybinds?: Keybind[],
    isDisabled?: (app: AppState) => boolean,
    execute: (app: AppState) => void,
    // keywords?: string[],
}

export default Command

export function buildCommands(): Command[] {
    const commands: Command[] = [
        {
            label: "Test command",
            execute: () => alert("Test command executed")
        },
        {
            label: "Clear workspace",
            keybinds: [{ key: "Delete", ctrl: true }],
            execute: (app) => {
                if (confirm("Are you sure you want to clear the workspace?")) {
                    app.setNodes(reconcile({}))
                    app.setSelectedNodes([])
                }
            }
        }
    ]

    for (let tool of BUILTIN_TOOLS) {
        commands.push({
            label: `Toolbar: ${tool.label}`,
            keybinds: tool.keybinds,
            icon: () => tool.icon({ selected: false }),
            isDisabled: (app) => app.selectedTool === tool.id,
            execute: (app) => app.setSelectedTool(tool.id)
        })
    }

    return commands
}
