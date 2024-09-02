import './frame.css'
import { FrameNode, NodeType } from "../../../api"

export const FrameType: NodeType<FrameNode> = {
  render: (props) => {
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
        data-element-title
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
}