import { Application, NodeData } from ".";

export const zoomLevels = [1, 2, 3, 4, 5, 7, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150]

export const findPreviousZoom = (current: number): number => {
  let nextZoom = current

  for (let i = zoomLevels.length - 1; i >= 0; i--) {
    if (zoomLevels[i] < current) {
      nextZoom = zoomLevels[i]
      break;
    }
  }

  return nextZoom
}

export const findNextZoom = (current: number): number => {
  let nextZoom = current

  for (let i = 0; i < zoomLevels.length; i++) {
    if (zoomLevels[i] > current) {
      nextZoom = zoomLevels[i]
      break;
    }
  }

  return nextZoom
}

export const getCanvasX = (app: Application, clientX: number) => (clientX - window.innerWidth / 2) / app.state.viewportZoom() - app.state.viewportX()
export const getCanvasY = (app: Application, clientY: number) => (clientY - window.innerHeight / 2) / app.state.viewportZoom() - app.state.viewportY()

export const getNodePosition = (app: Application, node: NodeData, clientX: number, clientY: number) => {
  const canvasX = getCanvasX(app, clientX)
  const canvasY = getCanvasY(app, clientY)

  const nodeType = app.resources.nodes[node.type]

  if (nodeType.transformPosition) {
    return nodeType.transformPosition(node, canvasX, canvasY)
  }

  return { x: canvasX, y: canvasY }
}

export const floorComponents = (point: { x: number, y: number }) => {
  return { x: Math.floor(point.x), y: Math.floor(point.y) }
}

export const roundComponents = (point: { x: number, y: number }) => {
  return { x: Math.round(point.x), y: Math.round(point.y) }
}

export const containsRectangle = (bounds: { x: number, y: number, width: number, height: number }, rect: { x: number, y: number, width: number, height: number }) => {
  return bounds.x <= rect.x 
    && bounds.y <= rect.y 
    && bounds.x + bounds.width >= rect.x + rect.width 
    && bounds.y + bounds.height >= rect.y + rect.height
}