import { Command, Tool } from "../../../api"

export * from './node_operations'
export * from './zoom'

export const createSelectToolCommand = (tool: Tool): Command => ({
  label: `Toolbar: ${tool.label}`,
  keybinds: tool.keybinds,
  icon: () => tool.icon({ selected: false }),
  isDisabled: app => app.state.tool() === tool,
  execute: app => app.state.selectTool(tool)
})