import { Application, toNodePosition, Tool, toViewportX, toViewportY } from "../../api"
import { CommandIcon, CursorIcon, FrameIcon, PencilIcon } from "./components/icons"
import CommandPalette from "./components/CommandPalette"
import { batch, createSignal } from "solid-js"
import { PencilAction } from "./actions"

export const Select = (): Tool => {
  const toggleSelection = (app: Application, nodeId: string) => {
    const shift = app.state.shiftHeld()
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
  }

  const createMouseDown = (app: Application) => (e: MouseEvent) => {
    console.log('select', e)

    if (!(e.target as Element)?.closest(".workspace-view")) {
      return;
    }

    e.preventDefault()

    const nodeId = (e.target as Element)?.closest("[data-node-id]")?.getAttribute("data-node-id") ?? null
    if (nodeId) {
      const isTitle = (e.target as Element)?.hasAttribute("data-node-title")

      if (isTitle) {
        toggleSelection(app, nodeId)
      } else {
        // TODO: implement drag to move
        toggleSelection(app, nodeId)
      }
    } else {
      // TODO: implement drag to select
      if (!app.state.shiftHeld()) {
        app.project.setSelectedNodes([])
      }
    }
  }

  let handleMouseDown: ((e: MouseEvent) => void) | undefined

  return {
    id: "select",
    label: "Select\u2009/\u2009Move",
    icon: props => (<CursorIcon filled={props.selected} />),
    keybinds: [{ key: "V" }],
    interactsWithTitles: true,
    onSelect: (app) => {
      handleMouseDown = createMouseDown(app)
      document.addEventListener("mousedown", handleMouseDown)
    },
    onDeselect: () => {
      document.removeEventListener("mousedown", handleMouseDown!)
      handleMouseDown = undefined
    }
  }
}

export const Frame = (): Tool => {
  const [x1, setX1] = createSignal(0)
  const [y1, setY1] = createSignal(0)
  const [x2, setX2] = createSignal(0)
  const [y2, setY2] = createSignal(0)

  const createMouseDown = (app: Application) => (e: MouseEvent) => {
    if (!(e.target as Element)?.closest(".workspace-view")) {
      return;
    }

    e.preventDefault()

    batch(() => {
      app.project.setSelectedNodes([])
      setX1(e.clientX)
      setY1(e.clientY)
      setX2(e.clientX)
      setY2(e.clientY)
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

    const handleMove = (e: MouseEvent) => {
      setX2(e.clientX)
      setY2(e.clientY)
    }

    const handleRelease = (e: MouseEvent) => {
      const left = Math.min(x1(), e.clientX)
      const top = Math.min(y1(), e.clientY)
      const width = Math.abs(e.clientX - x1())
      const height = Math.abs(e.clientY - y1())

      const id = crypto.randomUUID()

      batch(() => {
        setX1(0)
        setY1(0)
        setX2(0)
        setY2(0)

        app.project.setNodes(id,
          {
            type: "frame",
            children: [],
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
        // TODO: add an option to maintain selected tool instead of switching to select
        app.state.selectTool(app.resources.tools.select)
      })

      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseup", handleRelease)
    }

    document.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseup", handleRelease)
  }

  let handleMouseDown: ((e: MouseEvent) => void) | undefined

  return {
    id: "frame",
    label: "Frame",
    icon: FrameIcon,
    keybinds: [{ key: "F" }],
    onSelect: (app) => {
      handleMouseDown = createMouseDown(app)
      document.addEventListener("mousedown", handleMouseDown)
    },
    onDeselect: () => {
      document.removeEventListener("mousedown", handleMouseDown!)
      handleMouseDown = undefined
    }
  }
}

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

export const Pencil = (): Tool => {
  const createMouseDown = (app: Application) => (e: MouseEvent) => {
    if (!(e.target as Element)?.closest(".workspace-view")) {
      return;
    }

    e.preventDefault()

    const nodeId = (e.target as Element)?.closest("[data-drawable]")?.getAttribute("data-node-id") ?? null
    if (nodeId) {
      const node = app.project.nodes[nodeId]
      if (!node) {
        console.log("Node not found", nodeId)
        return
      }
      const nodeType = app.resources.nodeTypes[node.type]

      if (nodeType.supportsRasterActions) {
        let { x, y } = toNodePosition(app, node, e.clientX, e.clientY)
        let action: PencilAction = {
          type: "pencil",
          points: [{ x, y }]
        }
        nodeType.addRasterAction!(node, nodeId, action, app)

        const handleMouseMove = (e: MouseEvent) => {
          const node = app.project.nodes[nodeId]
          if (!node) {
            handleMouseUp()
            return
          }

          const { x: newX, y: newY } = toNodePosition(app, node, e.clientX, e.clientY)
          if (newX === x && newY === y) {
            return
          }

          const newAction = {
            ...action,
            points: [...action.points, { x: newX, y: newY }]
          }
          // TODO: use once pencil action handles replacement effectively,
          // currently action deletion triggers complete rerenders
          nodeType.replaceOrAddRasterAction!(node, nodeId, action, newAction, app)
          // nodeType.addRasterAction!(node, nodeId, action1, app)

          x = newX
          y = newY
          action = newAction
        }

        const handleMouseUp = () => {
          document.removeEventListener("mousemove", handleMouseMove)
          document.removeEventListener("mouseup", handleMouseUp)
        }

        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
      }
    }
    // TODO: implement drawing on whiteboard
  }

  let handleMouseDown: ((e: MouseEvent) => void) | undefined

  return {
    id: "pencil",
    label: "Pencil",
    icon: PencilIcon,
    keybinds: [{ key: "P" }],
    onSelect: (app) => {
      handleMouseDown = createMouseDown(app)
      document.addEventListener("mousedown", handleMouseDown)
    },
    onDeselect: () => {
      document.removeEventListener("mousedown", handleMouseDown!)
      handleMouseDown = undefined
    }
  }
}