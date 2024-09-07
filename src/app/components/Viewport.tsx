import "./Viewport.css"
import { createMemo, createSignal, Show } from "solid-js"
import { Application } from "../api"
import { Dynamic } from "solid-js/web"
import { Entries } from "@solid-primitives/keyed"

export function Viewport(props: { app: Application }) {
  const [dragging, setDragging] = createSignal(false)

  const [innerWidth, setInnerWidth] = createSignal(window.innerWidth)
  const [innerHeight, setInnerHeight] = createSignal(window.innerHeight)

  window.addEventListener("resize", () => {
    setInnerWidth(window.innerWidth)
    setInnerHeight(window.innerHeight)
  })

  const translateX = createMemo(() => Math.round(innerWidth() / 2 + props.app.state.viewportX() * props.app.state.viewportZoom()))
  const translateY = createMemo(() => Math.round(innerHeight() / 2 + props.app.state.viewportY() * props.app.state.viewportZoom()))

  const gridOffsetX = createMemo(() => translateX() % props.app.state.viewportZoom());
  const gridOffsetY = createMemo(() => translateY() % props.app.state.viewportZoom());

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

  // `transition: transform 0.Xs` won't work here
  // can't animate the background grid pattern
  // animating only the contents make them look like they're lagging
  // so we're not using transitions at all
  return (
    <div
      class="workspace-view"
      style={{
        cursor: dragging() ? 'grabbing' : props.app.state.spaceHeld() ? 'grab' : 'default'
      }}
      onmousedown={handleMouseDown}
    >
      <svg
        width={innerWidth()}
        height={innerHeight()}
        style={{
          display: props.app.state.viewportZoom() >= 10 ? "block" : "none",
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
          transform={`translate(${gridOffsetX()} ${gridOffsetY()})`}
        />
      </svg>

      <div style={{
        transform: `translate(${translateX()}px, ${translateY()}px)`
      }}>
        <Entries of={props.app.project.nodes}>
          {(nodeId, node) => (
            <Show when={node().type === "frame"}>
              <Dynamic component={props.app.resources.nodeTypes["frame"].render} app={props.app} node={node()} id={nodeId} />
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
