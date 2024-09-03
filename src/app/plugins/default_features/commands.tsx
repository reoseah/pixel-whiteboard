import { produce } from "solid-js/store"
import { Command, Tool } from "../../api"
import { AddSelectionIcon, DeleteIcon } from "./components/icons"
import { CanvasNode, FrameNode } from "./nodes"

export const SelectAll: Command = {
  label: "Select all",
  keybinds: [{ key: "A", ctrl: true }],
  icon: AddSelectionIcon,
  execute: app => app.project.setSelectedNodes(Object.keys(app.project.nodes))
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

        if (node.type === "frame") {
          nodesToDelete.push(...node.children)
        }
        app.resources.nodeTypes[node.type].onDelete?.(node, id, app)
        delete draft[id]
      }
    }))
    app.project.setSelectedNodes([])
  }
}

export const createSelectToolCommand = (tool: Tool): Command => ({
  label: `Toolbar: ${tool.label}`,
  keybinds: tool.keybinds,
  icon: () => tool.icon({ selected: false }),
  isDisabled: app => app.state.tool() === tool,
  execute: app => app.state.selectTool(tool)
})

// TODO: remove this, 
export const canvasTest: Command = {
  label: "Canvas test",
  execute: app => {
    const canvasNode: CanvasNode = {
      type: "canvas",
      children: []
    }
    const canvasId = crypto.randomUUID()

    const frameNode: FrameNode = {
      type: "frame",
      children: [canvasId],
      title: "Canvas test",
      x: 100,
      y: 100,
      width: 200,
      height: 200,
    }
    const frameId = crypto.randomUUID()

    app.project.setNodes({
      [canvasId]: canvasNode,
      [frameId]: frameNode
    })
  }
}