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