import { Tool, Application } from "../../../api"
import { CursorIcon } from "../components/icons"

export const Select = (): Tool => {
  let titleClickTime = 0

  const toggleSelection = (app: Application, nodeId: string) => {
    const shift = app.state.shiftHeld()
    const selected = app.project.selectedNodes()
    if (shift) {
      if (selected.includes(nodeId)) {
        app.project.setSelectedNodes(selected.filter(id => id !== nodeId))
      } else {
        app.project.setSelectedNodes([...selected, nodeId])
      }
    } else {
      app.project.setSelectedNodes([nodeId])
    }
  }

  const createMouseDown = (app: Application) => (e: MouseEvent) => {
    if (!(e.target as Element)?.closest(".workspace-view")) {
      return;
    }
    if (e.button !== 0) {
      return
    }
    const target = e.target as HTMLElement;
    const isEditable = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    if (isEditable) {
      return
    }

    e.preventDefault()

    const nodeId = (e.target as Element)?.closest("[data-selectable][data-node-id]")?.getAttribute("data-node-id") ?? null
    if (nodeId) {
      const isTitle = (e.target as Element)?.hasAttribute("data-frame-title")

      if (isTitle) {
        if (Date.now() - titleClickTime < 300) {
          app.state.setTitleBeingEdited(nodeId)
        } else {
          toggleSelection(app, nodeId)
          titleClickTime = Date.now()
        }
      } else {
        // TODO: implement drag to move
        toggleSelection(app, nodeId)
      }
    } else {
      // TODO: implement drag to select
      if (!app.state.shiftHeld()) {
        app.project.setSelectedNodes([])
      }
    }
  }

  let handleMouseDown: ((e: MouseEvent) => void) | undefined

  return {
    id: "select",
    label: "Select\u2009/\u2009Move",
    icon: props => (<CursorIcon filled={props.selected} />),
    keybinds: [{ key: "V" }],
    interactsWithTitles: true,
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
