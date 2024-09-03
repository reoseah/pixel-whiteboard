import * as Y from 'yjs'
import { NodeType, RasterAction, Application } from "../../api"
import { Frame } from './components/Frame'
import { Canvas } from './components/Canvas'

export type FrameNode = {
  type: "frame"
  children: [string] | []
  title: string | null
  x: number
  y: number
  width: number
  height: number
}

export const FrameType: NodeType<FrameNode> = {
  render: Frame,
  transformPosition: (node: FrameNode, x: number, y: number) => {
    return {
      x: x - node.x,
      y: y - node.y
    }
  },
  supportsRasterActions: true,
  addRasterAction: (node: FrameNode, nodeId: string, action: RasterAction, app: Application) => {
    const { canvasId, canvas } = getOrCreateChildCanvas(node, nodeId, app)
    CanvasType.addRasterAction!(canvas, canvasId, action, app)
  }
}

const getOrCreateChildCanvas = (node: FrameNode, nodeId: string, app: Application) => {
  if (node.children.length === 0) {
    const canvas: CanvasNode = { type: "canvas", children: [] }
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
      canvas: app.project.nodes[node.children[0]] as CanvasNode
    }
  }
}

export type CanvasNode = {
  type: "canvas"
  children: never[]
}

export const CanvasType: NodeType<CanvasNode> = {
  render: Canvas,
  addRasterAction: (_: CanvasNode, nodeId: string, action: RasterAction, app: Application) => {
    const actions = getOrCreateRasterActions(nodeId, app)
    actions.push([action])
  },
  replaceRasterAction: (_: CanvasNode, nodeId: string, previous: RasterAction, replacement: RasterAction, app: Application) => {
    const actions = getOrCreateRasterActions(nodeId, app)
    const index = actions.toArray().findIndex(a => a === previous)
    if (index !== -1) {
      actions.delete(index)
      actions.insert(index, [replacement])
    }
  },
  onDelete: (_: CanvasNode, nodeId: string, app: Application) => {
    app.ydoc.transact(() => {
      app.ydoc.getMap<Y.Array<RasterAction>>("canvas-actions").delete(nodeId)
    })
  }
}

const getOrCreateRasterActions = (nodeId: string, app: Application) => {
  return app.ydoc.getMap<Y.Array<RasterAction>>("canvas-actions").get(nodeId)
    || app.ydoc.getMap<Y.Array<RasterAction>>("canvas-actions").set(nodeId, new Y.Array<RasterAction>())
}