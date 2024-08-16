import { produce } from "solid-js/store";
import { Command } from "../../api";
import defaultTools from "./tools";
import { AddSelectionIcon, DeleteIcon } from "./components/icons";

export const selectAll: Command = {
  label: "Select all",
  keybinds: [{ key: "A", ctrl: true }],
  icon: AddSelectionIcon,
  execute: app => app.project.setSelectedNodes(Object.keys(app.project.nodes))
}

export const deleteSelected: Command = {
  label: "Delete selected",
  keybinds: [{ key: "Delete" }],
  icon: DeleteIcon,
  execute: app => {
    const selected = app.project.selectedNodes
    app.project.setNodes(produce(draft => {
      for (const id of selected()) {
        delete draft[id]
      }
    }))
    app.project.setSelectedNodes([])
  }
}

export const defaultCommands: Command[] = [
  ...defaultTools.map<Command>(tool => ({
    label: `Toolbar: ${tool.label}`,
    keybinds: tool.keybinds,
    icon: () => tool.icon({ selected: false }),
    isDisabled: app => app.state.selectedTool() === tool,
    execute: app => app.state.setSelectedTool(tool)
  })),
  selectAll,
  deleteSelected
]

export default defaultCommands