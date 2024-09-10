import { Dynamic, Show } from "solid-js/web"
import { Application, CanvasActionData, NodeType } from "../../../api"
import { Canvas, CanvasType } from "./Canvas"

export type Whiteboard = {
  type: "whiteboard",
  children: [string] | []
}

export const WhiteboardType: NodeType<Whiteboard> = {
  render: props => {
    // should always be a virtual canvas
    const child = () => props.node.children[0] ? props.app.project.nodes[props.node.children[0]] : undefined
    const selected = () => props.app.project.selectedNodes().includes(props.id)
    

    return (
      <div
        class="whiteboard"
        data-selected={selected()}
        data-highlighted={props.app.state.highlightedNodes().includes(props.id)}
        data-node-id={props.id}
        data-drawable
      >
        <Show when={child()}>
          <Dynamic
            component={props.app.resources.nodes[child()!.type].render}
            id={props.node.children[0]!}
            node={child()}
            app={props.app}
          />
        </Show>
      </div>
    )
  },
  getBounds: () => {
    return { x: -Infinity, y: -Infinity, width: Infinity, height: Infinity }
  },
  supportsCanvasActions: true,
  addCanvasAction: (node: Whiteboard, nodeId: string, action: CanvasActionData, app: Application) => {
    const { canvasId, canvas } = getOrCreateChildCanvas(node, nodeId, app)
    CanvasType.addCanvasAction!(canvas, canvasId, action, app)
  },
  replaceCanvasAction: (node: Whiteboard, nodeId: string, previous: CanvasActionData, replacement: CanvasActionData, app: Application) => {
    const { canvasId, canvas } = getOrCreateChildCanvas(node, nodeId, app)
    CanvasType.replaceCanvasAction!(canvas, canvasId, previous, replacement, app)
  }
}

const getOrCreateChildCanvas = (node: Whiteboard, nodeId: string, app: Application) => {
  if (node.children.length === 0) {
    const canvas: Canvas = { type: "canvas", children: [] }
    const canvasId = crypto.randomUUID()

    app.project.setNodes({
      [canvasId]: canvas,
      [nodeId]: { ...node, children: [canvasId] }
    })

    return {
      canvasId,
      canvas
    }
  } else {
    return {
      canvasId: node.children[0],
      // TODO: check if the node is a canvas
      canvas: app.project.nodes[node.children[0]] as Canvas
    }
  }
}