import { produce } from "solid-js/store"
import { Command } from "../../../api"
import { DeleteIcon, SelectionWithCrosshairIcon } from "../components/icons"

export const SelectAll: Command = {
  label: "Select all",
  keybinds: [{ key: "A", ctrl: true }],
  icon: SelectionWithCrosshairIcon,
  execute: app => app.project.setSelectedNodes(Object.keys(app.project.nodes))
}

export const InvertSelection: Command = {
  label: "Invert selection",
  keybinds: [{ key: "I", ctrl: true }],
  icon: SelectionWithCrosshairIcon,
  execute: app => {
    const selected = app.project.selectedNodes
    app.project.setSelectedNodes(Object.keys(app.project.nodes).filter(id => !selected().includes(id)))
  }
}

export const DeleteSelected: Command = {
  label: "Delete selected",
  keybinds: [{ key: "Delete" }],
  icon: DeleteIcon,
  execute: app => {
    const selected = app.project.selectedNodes
    app.project.setNodes(produce(draft => {
      let nodesToDelete = selected()

      while (nodesToDelete.length > 0) {
        const id = nodesToDelete.pop()!
        const node = draft[id]

        if (!node) {
          continue
        }

        if (node.type === "frame") {
          nodesToDelete.push(...node.children)
        }
        app.resources.nodes[node.type].onDelete?.(node, id, app)
        delete draft[id]
      }
    }))
    app.project.setSelectedNodes([])
  }
}