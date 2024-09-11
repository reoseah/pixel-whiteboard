import './Frame.css'
import { createSignal, JSX, onMount, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import useClickOutside from '../../../hooks/useClickOutside'
import { Application, NodeType, CanvasActionData } from "../../../api"
import { Canvas, CanvasType } from "../nodes"

export type Frame = {
  type: "frame"
  children: [string] | []
  title: string | null
  x: number
  y: number
  width: number
  height: number
}

export const FrameType: NodeType<Frame> = {
  render: props => FrameComponent(props),
  transformPosition: (node: Frame, x: number, y: number) => {
    return {
      x: x - node.x,
      y: y - node.y
    }
  },
  getBounds: (node: Frame) => {
    return {
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height
    }
  },
  move: (node: Frame, dx: number, dy: number) => {
    return {
      ...node,
      x: node.x + dx,
      y: node.y + dy
    }
  },
  onFinishedMoving: (node: Frame) => {
    return {
      ...node,
      x: Math.round(node.x),
      y: Math.round(node.y)
    }
  },
  supportsCanvasActions: true,
  addCanvasAction: (node: Frame, nodeId: string, action: CanvasActionData, app: Application) => {
    const { canvasId, canvas } = getOrCreateChildCanvas(node, nodeId, app)
    CanvasType.addCanvasAction!(canvas, canvasId, action, app)
  },
  replaceCanvasAction: (node: Frame, nodeId: string, previous: CanvasActionData, replacement: CanvasActionData, app: Application) => {
    const { canvasId, canvas } = getOrCreateChildCanvas(node, nodeId, app)
    CanvasType.replaceCanvasAction!(canvas, canvasId, previous, replacement, app)
  }
}

const getOrCreateChildCanvas = (node: Frame, nodeId: string, app: Application) => {
  if (node.children.length === 0) {
    const canvas: Canvas = { type: "canvas", children: [] }
    const canvasId = crypto.randomUUID()

    app.project.setNodes({
      [canvasId]: canvas,
      [nodeId]: { ...node, children: [canvasId] }
    })

    return {
      canvasId,
      canvas
    }
  } else {
    return {
      canvasId: node.children[0],
      // TODO: check if the node is a canvas
      canvas: app.project.nodes[node.children[0]] as Canvas
    }
  }
}

export const FrameComponent = (props: {
  app: Application,
  id: string,
  node: Frame
}) => {
  const selected = () => props.app.state.selectedNodes().includes(props.id)
  const child = () => props.node.children[0] ? props.app.project.nodes[props.node.children[0]] : undefined

  return (
    <div
      class="frame"
      data-selected={selected()}
      data-highlighted={props.app.state.highlightedNodes().includes(props.id)}
      data-node-id={props.id}
      data-drawable
      data-selectable
      style={{
        left: `${props.node.x * props.app.state.viewportZoom()}px`,
        top: `${props.node.y * props.app.state.viewportZoom()}px`,
        width: `${props.node.width * props.app.state.viewportZoom()}px`,
        height: `${props.node.height * props.app.state.viewportZoom()}px`,
      }}
    >
      <Show
        when={props.app.state.titleBeingEdited() === props.id}
        fallback={<FrameTitle app={props.app} nodeId={props.id} node={props.node} />}
      >
        <FrameTitleEditor app={props.app} nodeId={props.id} node={props.node} />
      </Show>
      <Show when={child()}>
        <div class="frame-children">
          <Dynamic
            component={props.app.resources.nodes[child()!.type].render}
            id={props.node.children[0]!}
            node={child()}
            app={props.app}
          />
        </div>
      </Show>
    </div>
  )
}

const FrameTitle = (props: {
  app: Application,
  nodeId: string,
  node: Frame
}) => {
  const style = (): JSX.CSSProperties => props.app.state.tool().interactsWithTitles ? {
    "pointer-events": "auto"
  } : {
    "pointer-events": "none"
  }

  return (
    <div
      class="frame-title"
      style={style()}
      data-frame-title
    >
      {props.node.title ?? "Frame"}
    </div>
  )
}

const FrameTitleEditor = (props: {
  app: Application,
  nodeId: string,
  node: Frame
}) => {
  const [value, setValue] = createSignal(props.node.title ?? "Frame")
  let input!: HTMLInputElement
  let widthHelper!: HTMLSpanElement

  const updateTitle = () => {
    props.app.project.setNodes(props.nodeId, {
      ...props.node,
      title: value().trim() || null
    })
    props.app.state.setTitleBeingEdited(null)
  }

  onMount(() => {
    input.focus()
    input.select()
    updateWidth()
  })

  useClickOutside(() => input, () => {
    updateTitle()
  })

  const updateWidth = () => {
    widthHelper.innerText = value()
    input.style.width = `${widthHelper.offsetWidth}px`
  }

  return (
    <>
      <span
        ref={el => widthHelper = el}
        style={{
          visibility: "hidden",
          position: "absolute",
          "white-space": "pre",
          "font-size": ".75rem",
        }}
      ></span>
      <input
        type="text"
        class="frame-title-editor"
        value={value()}
        oninput={(e) => {
          setValue(e.currentTarget.value)
          updateWidth()
        }}
        autocomplete='off'
        onchange={updateTitle}
        onblur={updateTitle}
        onkeydown={(e) => {
          if (e.key === "Enter") updateTitle()
          if (e.key === "Escape") {
            setValue(props.node.title ?? "Frame")
            props.app.state.setTitleBeingEdited(null)
          }
        }}
        ref={el => input = el}
      />
    </>
  )
}