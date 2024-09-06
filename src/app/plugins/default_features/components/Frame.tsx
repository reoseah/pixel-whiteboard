import './Frame.css'
import { Application, } from "../../../api"
import { FrameNode } from '../nodes'
import { createSignal, JSX, onMount, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import useClickOutside from '../../../hooks/useClickOutside'

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

const FrameTitle = (props: {
  app: Application,
  nodeId: string,
  node: FrameNode
}) => {
  const style = (): JSX.CSSProperties => props.app.state.tool().interactsWithTitles ? {
    cursor: "pointer",
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
  node: FrameNode
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

  useClickOutside(() => input.closest<HTMLElement>(".frame-title-wrapper") || input, () => {
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