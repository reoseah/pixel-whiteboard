import './Frame.css'
import { Application, } from "../../../api"
import { FrameNode } from '../nodes'
import { Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'

export const Frame = (props: {
  app: Application,
  id: string,
  node: FrameNode
}) => {
  const selected = () => props.app.project.selectedNodes().includes(props.id)
  const child = () => props.node.children[0] ? props.app.project.nodes[props.node.children[0]] : undefined

  return (
    <div
      class="frame"
      data-selected={selected()}
      data-node-id={props.id}
      data-drawable
      style={{
        left: `${props.node.x}px`,
        top: `${props.node.y}px`,
        width: `${props.node.width}px`,
        height: `${props.node.height}px`,
      }}
    >
      <div
        class="frame-title"
        data-node-title
        {...props.app.state.tool().interactsWithTitles ? {
          style: {
            cursor: "pointer",
            "pointer-events": "auto"
          },
        } : {
          style: {
            "pointer-events": "none"
          }
        }}
      >
        {props.node.title ?? "Frame"}
      </div>
      <Show when={child()}>
        <div class="frame-children">
          <Dynamic
            component={props.app.resources.nodeTypes[child()!.type].render}
            id={props.node.children[0]!}
            node={child()}
            app={props.app}
          />
        </div>
      </Show>
    </div>
  )
}