import "./Pencil.css"
import { Tool, Application, floorComponents, getNodePosition, NodeType } from "../../../api"
import { PencilAction } from "../actions"
import { PencilIcon } from "../components/icons"
import { createSignal } from "solid-js"

export const Pencil = (): Tool => {
  let app!: Application

  const [toolState, setToolState] = createSignal<"idle" | "drawing">("idle")
  const [currentMousePos, setCurrentMousePos] = createSignal<{ x: number, y: number }>({ x: 0, y: 0 })
  let nodeId: string | null = null
  let nodeType: NodeType | null = null
  let action: PencilAction | null = null

  const handleMouseDown = (e: MouseEvent) => {
    if (!(e.target as Element)?.closest(".workspace-view")) {
      return;
    }

    e.preventDefault()

    const targetedId = (e.target as Element)?.closest("[data-drawable]")?.getAttribute("data-node-id") ?? null
    if (targetedId) {
      const node = app.project.nodes[targetedId]
      const type = app.resources.nodes[node.type]

      if (type.supportsCanvasActions) {
        nodeId = targetedId
        nodeType = type
        const pos = floorComponents(getNodePosition(app, node, e.clientX, e.clientY))
        setCurrentMousePos(pos)
        action = {
          type: "pencil",
          points: [pos]
        }
        type.addCanvasAction!(node, targetedId, action, app)
        setToolState("drawing")
      }
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (toolState() === "drawing") {
      const node = app.project.nodes[nodeId!]
      if (!node) {
        setToolState("idle")
        nodeId = null
        return
      }

      let { x: newX, y: newY } = floorComponents(getNodePosition(app, node, e.clientX, e.clientY))
      if (newX === currentMousePos().x && newY === currentMousePos().y) {
        return
      }

      const newAction: PencilAction = {
        ...action!,
        points: [...action!.points, { x: newX, y: newY }]
      }
      nodeType!.replaceOrAddCanvasAction!(node, nodeId!, action!, newAction, app)

      setCurrentMousePos({ x: newX, y: newY })
      action = newAction
    }
  }

  const handleMouseUp = () => {
    setToolState("idle")
    nodeId = null
    nodeType = null
    action = null
  }

  return {
    id: "pencil",
    label: "Pencil",
    icon: PencilIcon,
    cursor: "crosshair",
    keybinds: [{ key: "P" }],
    onSelect: (ap) => {
      app = ap
      document.addEventListener("mousedown", handleMouseDown)
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    onDeselect: () => {
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }
}
