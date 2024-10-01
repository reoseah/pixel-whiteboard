import { Dynamic } from "solid-js/web"
import Command from "../../../api/command"
import { CurrentTool } from "../../../api/CurrentTool"
import Registry from "../../../api/Registry"

export const createSelectToolCommand = (tool: string): Command => {
    return {
        id: `select_tool.${tool}`,
        icon: () => <Dynamic component={Registry.tools[tool].icon} />,
        label: () => {
            const { tools } = Registry
            return `Select ${tools[tool].label}`
        },
        isDisabled: () => {
            return CurrentTool.id() === tool
        },
        execute: () => {
            CurrentTool.selectId(tool)
        }
    }
}