import { reconcile } from "solid-js/store"
import { Tool } from "../../api"
import { CommandIcon, CursorIcon, FrameIcon } from "./components/icons"

export const select = (): Tool => {
  return {
    id: "select",
    label: "Select\u2009/\u2009Move",
    icon: props => (<CursorIcon filled={props.selected} />),
    keybinds: [{ key: "V" }],
    onTitleClick: (app, nodeId) => {
      const shift = app.state.shiftHeld()
      if (shift) {
        const selected = app.project.selectedNodes()
        if (selected.includes(nodeId)) {
          app.project.setSelectedNodes(selected.filter(id => id !== nodeId))
        } else {
          app.project.setSelectedNodes([...selected, nodeId])
        }
      } else {
        app.project.setSelectedNodes([nodeId])
      }
    },
    onPress: (app, x, y, nodeId) => {
      const shift = app.state.shiftHeld()
      if (nodeId) {
        const selected = app.project.selectedNodes()
        if (shift) {
          if (selected.includes(nodeId)) {
            app.project.setSelectedNodes(selected.filter(id => id !== nodeId))
          } else {
            app.project.setSelectedNodes([...selected, nodeId])
          }
        } else {
          app.project.setSelectedNodes([nodeId])
        }
      } else if (!shift) {
        app.project.setSelectedNodes([])
      }

      return false

      // TODO: click and drag on empty space to select multiple nodes in rectangle,
      //       click and drag on a node to move it
    }
  }
}

export const frame = (): Tool => {
  return {
    id: "frame",
    label: "Frame",
    icon: FrameIcon,
    keybinds: [{ key: "F" }],
    onPress: (app, x, y) => {
      app.project.setSelectedNodes([])
      app.state.setSelectedToolStore(reconcile({ x, y, x2: x, y2: y }))
      app.state.setSelectedToolComponent(() => () => {
        const left = () => Math.min(app.state.selectedToolStore["x"], app.state.selectedToolStore["x2"])
        const top = () => Math.min(app.state.selectedToolStore["y"], app.state.selectedToolStore["y2"])
        const width = () => Math.abs(app.state.selectedToolStore["x2"] - app.state.selectedToolStore["x"])
        const height = () => Math.abs(app.state.selectedToolStore["y2"] - app.state.selectedToolStore["y"])

        // TODO: insert a in-progress frame node
        return (
          <div style={{
            position: "absolute",
            left: `${left()}px`,
            top: `${top()}px`,
            width: `${width()}px`,
            height: `${height()}px`,
            outline: "1px solid var(--primary-400)",
          }} />
        )
      })
      return true
    },
    onMove: (app, x, y) => {
      app.state.setSelectedToolStore('x2', x)
      app.state.setSelectedToolStore('y2', y)
    },
    onRelease: (app, x, y) => {
      const left = Math.min(app.state.selectedToolStore["x"], x)
      const top = Math.min(app.state.selectedToolStore["y"], y)
      const width = Math.abs(app.state.selectedToolStore["x"] - x)
      const height = Math.abs(app.state.selectedToolStore["y"] - y)

      const id = `frame-${Date.now()}`
      app.project.setNodes(id,
        {
          type: "frame",
          parents: [],
          title: "Frame",
          x: left,
          y: top,
          width,
          height,
        }
      )
      app.project.setSelectedNodes([id])
      app.state.setSelectedToolStore(reconcile({}))
      app.state.setSelectedToolComponent(null)
      app.state.setSelectedTool("select")
    }
  }
}

export const actions: Tool = {
  id: "actions",
  label: "Actions",
  icon: CommandIcon,
  keybinds: [{ key: "K", ctrl: true }],
};

export const defaultTools: Tool[] = [
  select(),
  frame(),
  actions
]

export default defaultTools