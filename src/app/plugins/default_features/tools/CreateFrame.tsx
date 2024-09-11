import "./CreateFrame.css"
import { createSignal, batch } from "solid-js"
import { Tool, Application, getCanvasX, getCanvasY } from "../../../api"
import { FrameIcon } from "../../../components/form/icons"

export const CreateFrame = (): Tool => {
  const [x1, setX1] = createSignal(0)
  const [y1, setY1] = createSignal(0)
  const [x2, setX2] = createSignal(0)
  const [y2, setY2] = createSignal(0)

  const left = () => Math.min(x1(), x2())
  const top = () => Math.min(y1(), y2())
  const width = () => Math.abs(x2() - x1())
  const height = () => Math.abs(y2() - y1())

  const createMouseDown = (app: Application) => (e: MouseEvent) => {
    if (!(e.target as Element)?.closest(".viewport")) {
      return
    }
    if (e.button !== 0) {
      return
    }

    e.preventDefault()

    batch(() => {
      const x = Math.round(getCanvasX(app, e.clientX))
      const y = Math.round(getCanvasY(app, e.clientY))
      setX1(x)
      setX2(x)
      setY1(y)
      setY2(y)
      app.project.setSelectedNodes([])
      app.state.setViewportElements({
        "frame-preview": () => {

          // TODO: insert a in-progress frame node to document
          return (
            <div
              class="frame-preview"
              style={{
                left: `${left() * app.state.viewportZoom()}px`,
                top: `${top() * app.state.viewportZoom()}px`,
                width: `${width() * app.state.viewportZoom()}px`,
                height: `${height() * app.state.viewportZoom()}px`,
              }}>
              <div
                class="frame-preview-dimensions"
                style={{
                  left: `calc(${width() * app.state.viewportZoom()}px + .5rem)`,
                  top: `calc(${height() * app.state.viewportZoom()}px + .5rem)`,
                }}>
                {width()} × {height()}
              </div>
            </div>
          )
        }
      })
    })

    const handleMove = (e: MouseEvent) => {
      setX2(Math.round(getCanvasX(app, e.clientX)))
      setY2(Math.round(getCanvasY(app, e.clientY)))
    }

    const handleRelease = (e: MouseEvent) => {
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseup", handleRelease)

      const x = Math.round(getCanvasX(app, e.clientX))
      const y = Math.round(getCanvasY(app, e.clientY))

      const width = Math.abs(x - x1())
      const height = Math.abs(y - y1())

      const left = Math.min(x1(), x)
      const top = Math.min(y1(), y)

      const id = crypto.randomUUID()

      batch(() => {
        setX1(0)
        setY1(0)
        setX2(0)
        setY2(0)

        app.state.setViewportElements({
          "frame-preview": undefined
        })
        if (width !== 0 && height !== 0) {
          app.project.setNodes(id,
            {
              type: "frame",
              children: [],
              title: "Frame",
              x: left,
              y: top,
              width,
              height,
            }
          )
          app.project.setSelectedNodes([id])
        }
        // TODO: add an option to maintain selected tool instead of switching to select
        app.state.selectTool(app.resources.tools.select)
      })

    }

    document.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseup", handleRelease)
  }

  let handleMouseDown: ((e: MouseEvent) => void) | undefined

  return {
    id: "frame",
    label: "Frame",
    icon: FrameIcon,
    keybinds: [{ key: "F" }],
    cursor: "crosshair",
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
