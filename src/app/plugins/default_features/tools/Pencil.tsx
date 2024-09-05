import { Tool, Application, toNodePosition } from "../../../api";
import { PencilAction } from "../actions";
import { PencilIcon } from "../components/icons";

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
          nodeType.replaceOrAddRasterAction!(node, nodeId, action, newAction, app)

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