import './Frame.css'
import * as Y from 'yjs'
import { Application, RasterAction } from "../../../api"
import { CanvasNode, FrameNode } from '../nodes'
import { Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'

// export const useToolHandlers = (
//   app: Application,
//   actions: () => Y.Array<RasterAction>,
//   left: () => number,
//   top: () => number,
//   zoom: () => number
// ): {
//   handlePress: (e: MouseEvent) => void
// } => {
//   const transformX = (x: number) => x / zoom() - left()
//   const transformY = (y: number) => y / zoom() - top()

//   const handlePress = (e: MouseEvent) => {
//     const tool = app.state.tool();

//     if (tool && tool.onPress) {
//       e.preventDefault()

//       const nodeId = (e.target as Element)?.closest("[data-node-id]")?.getAttribute("data-node-id") ?? null

//       let x = transformX(e.clientX)
//       let y = transformY(e.clientY)

//       let action: RasterAction | undefined

//       const result = tool.onPress(app, x, y, nodeId)
//       if (result && result.action) {
//         actions().push([result.action])
//         action = result.action
//       }

//       const handleMove = (e: MouseEvent) => {
//         e.preventDefault()

//         const prevX = x
//         const prevY = y
//         x = transformX(e.clientX)
//         y = transformY(e.clientY)

//         tool.onMove?.(app, x, y, prevX, prevY)
//       }
//       const handleRelease = (e: MouseEvent) => {
//         e.preventDefault()

//         const prevX = x
//         const prevY = y
//         x = transformX(e.clientX)
//         y = transformY(e.clientY)

//         tool.onRelease?.(app, x, y, prevX, prevY)

//         document.removeEventListener("mousemove", handleMove)
//         document.removeEventListener("mouseup", handleRelease)
//       }

//       document.addEventListener("mousemove", handleMove)
//       document.addEventListener("mouseup", handleRelease)
//     }
//   }

//   return {
//     handlePress
//   }
// }

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