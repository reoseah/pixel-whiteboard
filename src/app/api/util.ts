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

export const getCanvasX = (app: Application, clientX: number) => Math.round((clientX - window.innerWidth / 2) / app.state.viewportZoom() - app.state.viewportX() - .5)
export const getCanvasY = (app: Application, clientY: number) => Math.round((clientY - window.innerHeight / 2) / app.state.viewportZoom() - app.state.viewportY() - .5)

export const getNodePosition = (app: Application, node: NodeData, clientX: number, clientY: number) => {
  const canvasX = getCanvasX(app, clientX)
  const canvasY = getCanvasY(app, clientY)

  const nodeType = app.resources.nodes[node.type]

  if (nodeType.transformPosition) {
    return nodeType.transformPosition(node, canvasX, canvasY)
  }

  return { x: canvasX, y: canvasY }
}