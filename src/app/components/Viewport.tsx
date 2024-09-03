import "./Viewport.css"
import { For } from "solid-js"
import { Application } from "../api"
import { Dynamic } from "solid-js/web"

export function Viewport(props: { app: Application }) {
  const frames = () => Object.entries(props.app.project.nodes).filter(([_, node]) => node.type === "frame")

  // const { handlePress } = useToolHandlers(props.app, () => 0, () => 0, () => 1)

  return (
    <div
      class="workspace-view"
    // onmousedown={handlePress}
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
