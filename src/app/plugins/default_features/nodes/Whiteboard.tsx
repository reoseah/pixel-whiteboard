import { NodeType } from "../../../api"

export type Whiteboard = {
  type: "whiteboard",
  children: [string]
}

export const WhiteboardType = (): NodeType<Whiteboard> => {

  return {
    render: props => {
      // should always be a virtual canvas
      const child = () => props.node.children[0] ? props.app.project.nodes[props.node.children[0]] : undefined

      return (
        <div
          class="whiteboard"
        >
        </div>
      )
    }
  }
}