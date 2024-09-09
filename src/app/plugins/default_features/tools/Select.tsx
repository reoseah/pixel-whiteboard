import './Select.css'
import { Tool, Application, getCanvasX, getCanvasY, containsRectangle } from "../../../api"
import { CursorIcon } from "../components/icons"
import { batch, createSignal } from "solid-js"

export const Select = (): Tool => {
  let app!: Application

  let clickTime = 0
  const [toolState, setToolState] = createSignal<"idle" | "move" | "selection_box" /* | "resize" */>("idle")
  const [initialMousePos, setInitialMousePos] = createSignal({ x: 0, y: 0 })
  const [currentMousePos, setCurrentMousePos] = createSignal({ x: 0, y: 0 })

  const getNodesInSelection = () => {
    const selectionBox = {
      x: Math.min(initialMousePos().x, currentMousePos().x),
      y: Math.min(initialMousePos().y, currentMousePos().y),
      width: Math.abs(currentMousePos().x - initialMousePos().x),
      height: Math.abs(currentMousePos().y - initialMousePos().y)
    }

    let selectedNodes: string[] = []
    Object.entries(app.project.nodes).forEach(([id, node]) => {
      const type = app.resources.nodes[node.type]
      if (type.getBounds) {
        const bounds = type.getBounds(node)
        if (containsRectangle(selectionBox, bounds)) {
          selectedNodes.push(id)
        }
      }
    })
    return selectedNodes
  }

  const handleMouseDown = (e: MouseEvent) => {
    if (!(e.target as Element)?.closest(".workspace-view")) {
      return;
    }
    if (e.button !== 0) {
      return
    }
    const target = e.target as HTMLElement
    const isEditable = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
    if (isEditable) {
      return
    }

    e.preventDefault()

    const nodeId = (e.target as Element)?.closest("[data-selectable][data-node-id]")?.getAttribute("data-node-id") ?? null
    if (nodeId) {
      const isTitle = (e.target as Element)?.hasAttribute("data-frame-title")
      if (isTitle) {
        if (Date.now() - clickTime < 300) {
          app.state.setTitleBeingEdited(nodeId)
        } else {
          clickTime = Date.now()
        }
      }
      let selection!: string[]
      const shift = app.state.shiftHeld()
      if (shift) {
        const currentSelection = app.project.selectedNodes()
        if (currentSelection.includes(nodeId)) {
          selection = currentSelection.filter(id => id !== nodeId)
        } else {
          selection = [...currentSelection, nodeId]
        }
      } else {
        selection = [nodeId]
      }
      batch(() => {
        app.project.setSelectedNodes(selection)
        if (selection.length > 0) {
          setCurrentMousePos({ x: getCanvasX(app, e.clientX), y: getCanvasY(app, e.clientY) })
          setToolState("move")
        }
      })
    } else {
      const x = getCanvasX(app, e.clientX)
      const y = getCanvasY(app, e.clientY)

      batch(() => {
        setToolState("selection_box")
        setInitialMousePos({ x, y })
        setCurrentMousePos({ x, y })
        app.project.setSelectedNodes([])
        app.state.setViewportElements("selection_box", () => () => {
          const left = () => Math.min(initialMousePos().x, currentMousePos().x)
          const top = () => Math.min(initialMousePos().y, currentMousePos().y)
          const width = () => Math.abs(currentMousePos().x - initialMousePos().x)
          const height = () => Math.abs(currentMousePos().y - initialMousePos().y)

          return (
            <div
              style={{
                left: `${left() * app.state.viewportZoom()}px`,
                top: `${top() * app.state.viewportZoom()}px`,
                width: `${width() * app.state.viewportZoom()}px`,
                height: `${height() * app.state.viewportZoom()}px`,
              }}
              class="selection-box"
            ></div>
          )
        })
      })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    switch (toolState()) {
      case "idle": {
        const nodeId = (e.target as Element)?.closest("[data-selectable][data-node-id]")?.getAttribute("data-node-id") ?? null
        if (nodeId) {
          app.state.setHighlightedNodes([nodeId])
        } else {
          app.state.setHighlightedNodes([])
        }
        break
      }
      case "move": {
        // TODO: helper lines when aligning with other nodes

        const x = getCanvasX(app, e.clientX)
        const y = getCanvasY(app, e.clientY)

        const dx = x - currentMousePos().x
        const dy = y - currentMousePos().y
        console.log(dx, dy)
        setCurrentMousePos({ x, y })

        const selectedNodes = app.project.selectedNodes()
        selectedNodes.forEach(id => {
          const node = app.project.nodes[id]
          const type = app.resources.nodes[node.type]
          if (type.move) {
            app.project.setNodes({ [id]: type.move(node, dx, dy) })
          }
        })

        break
      }
      case "selection_box": {
        const selectedNodes = getNodesInSelection()

        app.state.setHighlightedNodes(selectedNodes)
        setCurrentMousePos({ x: getCanvasX(app, e.clientX), y: getCanvasY(app, e.clientY) })

        break
      }
    }
  }

  const handleMouseUp = (e: MouseEvent) => {
    if (toolState() === "move") {
      const selectedNodes = app.project.selectedNodes()
      batch(() => {
        selectedNodes.forEach(id => {
          const node = app.project.nodes[id]
          const type = app.resources.nodes[node.type]
          if (type.onFinishedMoving) {
            app.project.setNodes({ [id]: type.onFinishedMoving(node) })
          }
        })
      })
    } else if (toolState() === "selection_box") {
      const selectedNodes = getNodesInSelection()

      batch(() => {
        app.state.setHighlightedNodes([])
        app.project.setSelectedNodes(selectedNodes)
        app.state.setViewportElements({ "selection_box": undefined })
      })
    }

    setToolState("idle")
  }

  return {
    id: "select",
    label: "Select\u2009/\u2009Move",
    icon: props => (<CursorIcon filled={props.selected} />),
    keybinds: [{ key: "V" }],
    interactsWithTitles: true,
    onSelect: (a) => {
      app = a
      document.addEventListener("mousedown", handleMouseDown)
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    onDeselect: (app) => {
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)

      setToolState("idle")
      app.state.setHighlightedNodes([])
      app.state.setViewportElements({ "selection_box": undefined })
    }
  }
}