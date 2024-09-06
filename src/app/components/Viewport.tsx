import "./Viewport.css"
import { createMemo, createSignal, Show } from "solid-js"
import { Application } from "../api"
import { Dynamic } from "solid-js/web"
import { Entries } from "@solid-primitives/keyed"
import { FrameNode, FrameType } from "../plugins/default_features/nodes"

export function Viewport(props: { app: Application }) {
  const [dragging, setDragging] = createSignal(false)

  const handleMouseDown = (e: MouseEvent) => {
    if (!props.app.state.spaceHeld() && e.button !== 1) {
      return
    }
    e.preventDefault()
    // prevent selected tool from handling the click
    e.stopImmediatePropagation()

    setDragging(true)

    let lastX = e.clientX
    let lastY = e.clientY

    const handleMouseMove = (event: MouseEvent) => {
      props.app.state.setViewportX(props.app.state.viewportX() + (event.clientX - lastX) / props.app.state.viewportZoom())
      props.app.state.setViewportY(props.app.state.viewportY() + (event.clientY - lastY) / props.app.state.viewportZoom())
      lastX = event.clientX
      lastY = event.clientY
    }

    const handleMouseUp = () => {
      setDragging(false)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }

  const [innerWidth, setInnerWidth] = createSignal(window.innerWidth)
  const [innerHeight, setInnerHeight] = createSignal(window.innerHeight)

  window.addEventListener("resize", () => {
    setInnerWidth(window.innerWidth)
    setInnerHeight(window.innerHeight)
  })

  const translateX = createMemo(() => Math.round(innerWidth() / 2 + props.app.state.viewportX() * props.app.state.viewportZoom()))
  const translateY = createMemo(() => Math.round(innerHeight() / 2 + props.app.state.viewportY() * props.app.state.viewportZoom()))

  return (
    <div
      class="workspace-view"
      style={{
        cursor: dragging() ? 'grabbing' : props.app.state.spaceHeld() ? 'grab' : 'default'
      }}
      onmousedown={handleMouseDown}
    >
      <Show when={props.app.state.viewportZoom() >= 10}>
        <svg
          width={innerWidth()}
          height={innerHeight()}
          style={{
            position: "absolute",
            "z-index": -1,
          }}
        >
          <defs>
            <pattern
              id="pixelCornersGrid"
              width={props.app.state.viewportZoom()}
              height={props.app.state.viewportZoom()}
              patternUnits="userSpaceOnUse"
            >
              <rect width="1" height="1" fill="#505050" />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#pixelCornersGrid)"
            transform={`translate(${translateX() - Math.floor(translateX() / props.app.state.viewportZoom()) * props.app.state.viewportZoom() - 1
              } ${translateY() - Math.floor(translateY() / props.app.state.viewportZoom()) * props.app.state.viewportZoom() - 1
              })`}
          />
        </svg>
      </Show>

      <div style={{
        transform: `translate(${translateX()}px, ${translateY()}px)`
      }}>
        <Entries of={props.app.project.nodes}>
          {(nodeId, node) => (
            <Show when={node().type === "frame"}>
              <FrameType.render app={props.app} node={node() as FrameNode} id={nodeId} />
            </Show>
          )}
        </Entries>
        <Entries of={props.app.state.viewportElements}>
          {(_, element) => (
            <Dynamic component={element()} app={props.app} />
          )}
        </Entries>
      </div>
    </div>
  )
}

export default Viewport
