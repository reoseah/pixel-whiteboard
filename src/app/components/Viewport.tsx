import "./Viewport.css"

import { For, Show } from "solid-js"
import { Application, FrameNode } from "../api"
import { Dynamic } from "solid-js/web"

export function Viewport(props: { app: Application }) {
  const frames = () => Object.entries(props.app.project.nodes).filter(([_, node]) => node.type === "frame")

  const handlePress = (e: MouseEvent) => {
    const toolId = props.app.state.selectedTool()
    const tool = props.app.resources.tools[toolId];
    if (tool && tool.onPress) {
      e.preventDefault()
      let shouldTrack = tool.onPress(props.app, e.clientX, e.clientY)

      if (shouldTrack !== false) {
        let prevX = e.clientX
        let prevY = e.clientY

        const handleMove = (e: MouseEvent) => {
          e.preventDefault()

          tool.onMove?.(props.app, e.clientX, e.clientY, prevX, prevY)
          prevX = e.clientX
          prevY = e.clientY
        }
        const handleRelease = (e: MouseEvent) => {
          e.preventDefault()

          tool.onRelease?.(props.app, e.clientX, e.clientY, prevX, prevY)
          document.removeEventListener("mousemove", handleMove)
          document.removeEventListener("mouseup", handleRelease)
        }

        document.addEventListener("mousemove", handleMove)
        document.addEventListener("mouseup", handleRelease)
      }
    }
  }

  return (
    <div
      class="workspace-view"
      onmousedown={handlePress}
    >
      <For each={frames()}>
        {/* TODO test code, use node types to render their corresponding nodes */}
        {([nodeId, frame]) => (
          <FrameView
            frame={frame as FrameNode}
            selected={props.app.project.selectedNodes().includes(nodeId)}
            onSelect={() => props.app.project.setSelectedNodes([nodeId])}
          />
        )}
      </For>
      <Show when={props.app.state.selectedToolComponent()}>
        <Dynamic component={props.app.state.selectedToolComponent()!} />
      </Show>
    </div>
  )
}

export default Viewport

function FrameView(props: { frame: FrameNode, selected?: boolean, onSelect?: () => void }) {
  return (
    <div
      class="frame-view"
      data-selected={props.selected}
      style={{
        left: `${props.frame.x}px`,
        top: `${props.frame.y}px`,
        width: `${props.frame.width}px`,
        height: `${props.frame.height}px`
      }}
    >
      <div
        class="frame-view-title"
        onClick={props.onSelect}
      >
        {props.frame.title ?? "Frame"}
      </div>
    </div>
  )
}

