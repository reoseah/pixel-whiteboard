import { Tool } from "../../api"
import { CommandIcon, CursorIcon, FrameIcon } from "./components/icons"
import CommandPalette from "./components/CommandPalette"
import { batch, createSignal } from "solid-js"

export const select = (): Tool => {
  return {
    id: "select",
    label: "Select\u2009/\u2009Move",
    icon: props => (<CursorIcon filled={props.selected} />),
    keybinds: [{ key: "V" }],
    interactsWithTitles: true,
    onPress: (app, _x, _y, nodeId, _isTitle) => {
      console.log("select", nodeId)
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
  const [x1, setX1] = createSignal(0)
  const [y1, setY1] = createSignal(0)
  const [x2, setX2] = createSignal(0)
  const [y2, setY2] = createSignal(0)

  return {
    id: "frame",
    label: "Frame",
    icon: FrameIcon,
    keybinds: [{ key: "F" }],
    onPress: (app, x, y) => {
      batch(() => {
        app.project.setSelectedNodes([])
        setX1(x)
        setY1(y)
        setX2(x)
        setY2(y)
        app.state.setViewportElements("frame-preview", () => () => {
          const left = () => Math.min(x1(), x2())
          const top = () => Math.min(y1(), y2())
          const width = () => Math.abs(x2() - x1())
          const height = () => Math.abs(y2() - y1())

          // TODO: insert a in-progress frame node to document
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
      })
      return true
    },
    onMove: (_, x, y) => {
      setX2(x)
      setY2(y)
    },
    onRelease: (app, x, y) => {
      const left = Math.min(x1(), x)
      const top = Math.min(y1(), y)
      const width = Math.abs(x - x1())
      const height = Math.abs(y - y1())

      const id = `frame-${Date.now()}`

      batch(() => {
        setX1(0)
        setY1(0)
        setX2(0)
        setY2(0)

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
        app.state.setViewportElements({
          "frame-preview": undefined
        })
        app.state.selectTool(app.resources.tools.select)
      })
    }
  }
}

export const actions = (): Tool => {
  let prevTool: Tool | null

  return {
    id: "actions",
    label: "Actions",
    icon: CommandIcon,
    keybinds: [{ key: "K", ctrl: true }],
    onSelect: (app, prev) => {
      prevTool = prev

      app.state.setSubToolbar(() => CommandPalette(prevTool ?? app.resources.tools.select))
    },
    onDeselect: (app) => {
      app.state.setSubToolbar(undefined)
    }
  }
}