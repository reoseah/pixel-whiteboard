import "./Viewport.css"
import { Show } from "solid-js"
import { Application } from "../api"
import { Dynamic } from "solid-js/web"
import { Entries } from "@solid-primitives/keyed"
import { FrameNode, FrameType } from "../plugins/default_features/nodes"

export function Viewport(props: { app: Application }) {
  return (
    <div class="workspace-view">
      <Entries of={props.app.project.nodes}>
        {(nodeId, node) => (
          <Show when={node().type === "frame"}>
            <FrameType.render app={props.app} node={node() as FrameNode} id={nodeId} />
          </Show>
        )}
      </Entries>
      <Entries of={props.app.state.viewportElements}>
        {([_, element]) => (
          <Dynamic component={element} app={props.app} />
        )}
      </Entries>
    </div>
  )
}

export default Viewport
