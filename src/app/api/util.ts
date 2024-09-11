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

export type Point = {
  x: number
  y: number
}

export const getNodePosition = (app: Application, node: NodeData, clientX: number, clientY: number): Point => {
  const canvasX = getCanvasX(app, clientX)
  const canvasY = getCanvasY(app, clientY)

  const nodeType = app.resources.nodes[node.type]

  if (nodeType.transformPosition) {
    return nodeType.transformPosition(node, canvasX, canvasY)
  }

  return { x: canvasX, y: canvasY }
}

export const floorComponents = (point: Point): Point => {
  return { x: Math.floor(point.x), y: Math.floor(point.y) }
}

export const roundComponents = (point: Point): Point => {
  return { x: Math.round(point.x), y: Math.round(point.y) }
}

export const getPointsOnPath = (path: Point[], interval: number = 1): Point[] => {
  const result: Point[] = []
  if (interval === 1) {
    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i]
      const next = path[i + 1]

      let x = current.x
      let y = current.y
      const endX = next.x
      const endY = next.y

      const dx = Math.abs(endX - x)
      const dy = Math.abs(endY - y)
      const signX = x < endX ? 1 : -1
      const signY = y < endY ? 1 : -1
      let error = dx - dy

      while (true) {
        result.push({ x: x, y: y })

        if (x === endX && y === endY) {
          break
        }
        const error2 = 2 * error

        if (error2 > -dy) {
          error -= dy
          x += signX
        }

        if (error2 < dx) {
          error += dx
          y += signY
        }
      }
    }
  } else {
    let leftover = 0
    for (let i = 0; i < path.length - 1; i++) {
      const current = path[i]
      const next = path[i + 1]

      const dx = next.x - current.x
      const dy = next.y - current.y
      const segmentLength = Math.sqrt(dx * dx + dy * dy)

      let distance = leftover

      while (distance + interval < segmentLength) {
        const ratio = (distance + interval) / segmentLength

        result.push({
          x: current.x + dx * ratio,
          y: current.y + dy * ratio
        })

        distance += interval
      }

      leftover = segmentLength - distance
    }
  }

  return result
}

export const containsRectangle = (bounds: { x: number, y: number, width: number, height: number }, rect: { x: number, y: number, width: number, height: number }) => {
  return bounds.x <= rect.x
    && bounds.y <= rect.y
    && bounds.x + bounds.width >= rect.x + rect.width
    && bounds.y + bounds.height >= rect.y + rect.height
}

export const isViewportClick = (e: MouseEvent): boolean => {
  if (!(e.target as Element)?.closest(".viewport")) {
    return false
  }
  if (e.button !== 0) {
    return false
  }
  const target = e.target as HTMLElement
  const isEditable = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
  if (isEditable) {
    return false
  }
  return true
}
