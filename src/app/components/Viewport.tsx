import "./Viewport.css"
import { createSignal, Show } from "solid-js"
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

  return (
    <div
      class="workspace-view"
      style={{
        cursor: dragging() ? 'grabbing' : props.app.state.spaceHeld() ? 'grab' : 'default'
      }}
      onmousedown={handleMouseDown}
    >
      <div style={{
        transform: `translate(${Math.round(window.innerWidth / 2 + props.app.state.viewportX() * props.app.state.viewportZoom())}px, ${Math.round(window.innerHeight / 2 + props.app.state.viewportY() * props.app.state.viewportZoom())}px)`
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
