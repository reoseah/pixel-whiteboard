import "./Viewport.css"
import { For } from "solid-js"
import { Application } from "../api"
import { Dynamic } from "solid-js/web"

export const useTool = (
  app: Application,
  left: () => number,
  top: () => number,
  zoom: () => number
): {
  handlePress: (e: MouseEvent) => void
} => {
  // TODO: take position and zoom signals as parameters

  const transformX = (x: number) => x / zoom() - left()
  const transformY = (y: number) => y / zoom() - top()

  const handlePress = (e: MouseEvent) => {
    const tool = app.state.tool();

    if (tool && tool.onPress) {
      e.preventDefault()

      const nodeId = (e.target as Element)?.closest("[data-node-id]")?.getAttribute("data-node-id") ?? null
      const isTitle = (e.target as Element)?.hasAttribute("data-node-title") ?? false

      let x = transformX(e.clientX)
      let y = transformY(e.clientY)
      const shouldTrack = tool.onPress(app, x, y, nodeId, isTitle)

      if (shouldTrack) {
        const handleMove = (e: MouseEvent) => {
          e.preventDefault()

          const prevX = x
          const prevY = y
          x = transformX(e.clientX)
          y = transformY(e.clientY)

          tool.onMove?.(app, x, y, prevX, prevY)
        }
        const handleRelease = (e: MouseEvent) => {
          e.preventDefault()

          const prevX = x
          const prevY = y
          x = transformX(e.clientX)
          y = transformY(e.clientY)

          tool.onRelease?.(app, x, y, prevX, prevY)

          document.removeEventListener("mousemove", handleMove)
          document.removeEventListener("mouseup", handleRelease)
        }

        document.addEventListener("mousemove", handleMove)
        document.addEventListener("mouseup", handleRelease)
      }
    }
  }

  return {
    handlePress
  }
}

export function Viewport(props: { app: Application }) {
  const frames = () => Object.entries(props.app.project.nodes).filter(([_, node]) => node.type === "frame")

  const { handlePress } = useTool(props.app, () => 0, () => 0, () => 1)

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
