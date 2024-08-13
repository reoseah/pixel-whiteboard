import { reconcile } from 'solid-js/store'
import { Plugin, ResourceBuilder, Tool } from '../../api'
import { CommandIcon, CursorIcon, FrameIcon } from './icons'

const DefaultFeaturesPlugin: Plugin = {
  id: 'default_features',
  title: 'Default Features',
  initialize(builder: ResourceBuilder) {
    tools.forEach(tool => {
      builder.addTool(tool)
      builder.addCommand({
        label: `Toolbar: ${tool.label}`,
        keybinds: tool.keybinds,
        icon: () => tool.icon({ selected: false }),
        isDisabled: app => {
          return app.state.selectedTool() === tool.id
        },
        execute: app => app.state.setSelectedTool(tool.id)
      })
    })
    builder.addCommand({
      label: "Clear workspace",
      keybinds: [{ key: "Delete", ctrl: true }],
      execute: (app) => {
        if (confirm("Are you sure you want to clear the workspace?")) {
          app.project.setNodes(reconcile({}))
          app.project.setSelectedNodes([])
        }
      }
    })
  }
}

export default DefaultFeaturesPlugin

const frame = (): Tool => {
  return {
    id: "frame",
    label: "Frame",
    icon: FrameIcon,
    keybinds: [{ key: "F" }],
    onPress: (app, x, y) => {
      app.state.setSelectedToolStore(reconcile({ x, y, x2: x, y2: y }))
      app.state.setSelectedToolComponent(() => () => {
        const left = () => Math.min(app.state.selectedToolStore["x"], app.state.selectedToolStore["x2"])
        const top = () => Math.min(app.state.selectedToolStore["y"], app.state.selectedToolStore["y2"])
        const width = () => Math.abs(app.state.selectedToolStore["x2"] - app.state.selectedToolStore["x"])
        const height = () => Math.abs(app.state.selectedToolStore["y2"] - app.state.selectedToolStore["y"])

        return (
          <div style={{
            position: "absolute",
            left: `${left()}px`,
            top: `${top()}px`,
            width: `${width()}px`,
            height: `${height()}px`,
            outline: "1px solid lime",
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

const tools: Tool[] = [
  {
    id: "select",
    label: "Select\u2009/\u2009Move",
    icon: props => (<CursorIcon filled={props.selected} />),
    keybinds: [{ key: "V" }],
  },
  frame(),
  {
    id: "actions",
    label: "Actions",
    icon: CommandIcon,
    keybinds: [{ key: "K", ctrl: true }],
  }
]
