import { batch, createSignal } from "solid-js"
import { Application, getCanvasX, getCanvasY, isViewportClick, Tool } from "../../../api"
import { SelectionIcon } from "../../../components/icons"

export const RectangleSelection = (): Tool => {
  let app!: Application
  let state: "idle" | "selecting" = "idle"

  const [initialMousePos, setInitialMousePos] = createSignal({ x: 0, y: 0 })
  const [currentMousePos, setCurrentMousePos] = createSignal({ x: 0, y: 0 })

  const left = () => Math.min(initialMousePos().x, currentMousePos().x)
  const top = () => Math.min(initialMousePos().y, currentMousePos().y)
  const width = () => Math.abs(currentMousePos().x - initialMousePos().x)
  const height = () => Math.abs(currentMousePos().y - initialMousePos().y)

  const handleMouseDown = (e: MouseEvent) => {
    if (!isViewportClick(e)) {
      return
    }

    e.preventDefault()

    state = "selecting"
    const x = Math.round(getCanvasX(app, e.clientX))
    const y = Math.round(getCanvasY(app, e.clientY))

    batch(() => {
      setInitialMousePos({ x, y })
      setCurrentMousePos({ x, y })
      app.state.setViewportElements("selection_box", () => () => {
        return (
          <svg
            style={{
              position: "absolute",
              top: `${top() * app.state.viewportZoom()}px`,
              left: `${left() * app.state.viewportZoom()}px`,
              "pointer-events": "none",
              "shape-rendering": "crispEdges",
              "z-index": 50
            }}
            width={width() * app.state.viewportZoom() + 1}
            height={height() * app.state.viewportZoom() + 1}
            fill="none"
          >
            <rect
              x={.5}
              y={.5}
              width={width() * app.state.viewportZoom()}
              height={height() * app.state.viewportZoom()}
              stroke="white"
              stroke-width="1"
              stroke-dasharray="3 3"
              stroke-dashoffset="0" >
              <animate attributeName="stroke-dashoffset" from="0" to="6" dur=".5s" repeatCount="indefinite" />
            </rect>
            <rect
              x={.5}
              y={.5}
              width={width() * app.state.viewportZoom()}
              height={height() * app.state.viewportZoom()}
              stroke="black"
              stroke-width="1"
              stroke-dasharray="3 3"
              stroke-dashoffset="3" >
              <animate attributeName="stroke-dashoffset" from="3" to="9" dur=".5s" repeatCount="indefinite" />
            </rect>
          </svg>
        )
      })
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (state === "selecting") {
      const x = Math.round(getCanvasX(app, e.clientX))
      const y = Math.round(getCanvasY(app, e.clientY))
      setCurrentMousePos({ x, y })
    }
  }

  const handleMouseUp = (e: MouseEvent) => {
    if (!isViewportClick(e)) {
      return
    }
    if (state === "selecting") {
      state = "idle"
      app.state.setViewportElements({ "selection_box": undefined })
      if (width() > 0 && height() > 0) {
        app.state.setSelection([{
          type: 'rectangle',
          x: left(),
          y: top(),
          width: width(),
          height: height()
        }])
      } else {
        app.state.setSelection([])
      }
    }
  }

  return {
    id: "rectangle_selection",
    label: "Rectangle Selection",
    icon: SelectionIcon,
    cursor: "crosshair",
    keybinds: [{ key: "R" }],
    onSelect: (a) => {
      app = a
      document.addEventListener("mousedown", handleMouseDown)
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    onDeselect: () => {
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }
}