import { Tool } from "../../../api"
import CommandPalette from "../components/CommandPalette"
import { CommandIcon } from "../components/icons"

export const Actions = (): Tool => {
  return {
    id: "actions",
    label: "Actions",
    icon: CommandIcon,
    keybinds: [{ key: "K", ctrl: true }],
    onSelect: (app, previousTool) => {
      app.state.setSubToolbar(() => CommandPalette(previousTool ?? app.resources.tools.select))
    },
    onDeselect: (app) => {
      app.state.setSubToolbar(undefined)
    }
  }
}