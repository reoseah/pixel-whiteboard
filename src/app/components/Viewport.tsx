import "./Viewport.css"
import { For } from "solid-js"
import { Application } from "../api"
import { Dynamic } from "solid-js/web"

export function Viewport(props: { app: Application }) {
  const frames = () => Object.entries(props.app.project.nodes).filter(([_, node]) => node.type === "frame")

  const handlePress = (e: MouseEvent) => {
    const tool = props.app.state.tool();

    if (tool && tool.onPress) {
      e.preventDefault()

      console.log(e.target, (e.target as Element)?.closest("[data-node-id]"));

      const nodeId = (e.target as Element)?.closest("[data-node-id]")?.getAttribute("data-node-id") ?? null
      const isTitle = (e.target as Element)?.hasAttribute("data-node-title") ?? false
      const shouldTrack = tool.onPress(props.app, e.clientX, e.clientY, nodeId, isTitle)

      if (shouldTrack) {
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
        {([nodeId, frame]) => {
          const type = props.app.resources.nodeTypes[frame.type]

          return (
            <Dynamic component={type.render} app={props.app} node={frame} id={nodeId} />
          )
        }}
      </For>
      <For each={Object.entries(props.app.state.viewportElements)}>
        {([_, element]) => (
          <Dynamic component={element} app={props.app} />
        )}
      </For>
    </div>
  )
}

export default Viewport
