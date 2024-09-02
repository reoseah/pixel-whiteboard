import './Frame.css'
import { Application, FrameNode } from "../../../api"

export const Frame = (props: {
  app: Application,
  id: string,
  node: FrameNode
}) => {
  const selected = () => props.app.project.selectedNodes().includes(props.id)

  return (
    <div
      class="frame"
      data-selected={selected()}
      data-node-id={props.id}
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
        {...props.app.state.tool()?.interactsWithTitles ? {
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
    </div>
  )
}