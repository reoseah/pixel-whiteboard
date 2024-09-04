import { Command } from "../../../api";
import { ZoomInIcon, ZoomOutIcon } from "../components/icons";

export const zoomLevels = [1, 2, 3, 4, 5, 7, 10, 15, 20, 25, 30, 40, 50, 75, 100]

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

export const ResetZoom: Command = {
  label: "Reset zoom",
  keybinds: [{ key: "0", ctrl: true }],
  execute: app => app.state.setViewportZoom(1)
  // TODO: draw icon
}

export const ZoomIn: Command = {
  label: "Zoom in",
  keybinds: [{ key: "+", ctrl: true }],
  icon: ZoomInIcon,
  execute: app => app.state.setViewportZoom(findNextZoom(app.state.viewportZoom()))
}

export const ZoomOut: Command = {
  label: "Zoom out",
  keybinds: [{ key: "-", ctrl: true }],
  icon: ZoomOutIcon,
  execute: app => app.state.setViewportZoom(findPreviousZoom(app.state.viewportZoom()))
}

// TODO: zoom to fit, zoom to selection