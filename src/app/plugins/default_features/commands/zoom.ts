import { Command, findNextZoom, findPreviousZoom } from "../../../api";
import { ResetZoomIcon, ZoomInIcon, ZoomOutIcon } from "../../../components/form/icons";

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

export const ResetZoom: Command = {
  label: "Reset zoom",
  keybinds: [{ key: "0", ctrl: true }],
  icon: ResetZoomIcon,
  execute: app => {
    app.state.setViewportZoom(1)
  }
}

// TODO: zoom to fit, zoom to selection