import "./Viewport.css"
import { createMemo, createSignal, For, Show } from "solid-js"
import { Application, getMaxX, getMaxY, getMinX, getMinY, Selection } from "../api"
import { Dynamic } from "solid-js/web"
import { Entries } from "@solid-primitives/keyed"

export function Viewport(props: { app: Application }) {
  const [dragging, setDragging] = createSignal(false)

  const [innerWidth, setInnerWidth] = createSignal(window.innerWidth)
  const [innerHeight, setInnerHeight] = createSignal(window.innerHeight)

  window.addEventListener("resize", () => {
    setInnerWidth(window.innerWidth)
    setInnerHeight(window.innerHeight)
  })

  const translateX = createMemo(() => Math.round(innerWidth() / 2 + props.app.state.viewportX() * props.app.state.viewportZoom()))
  const translateY = createMemo(() => Math.round(innerHeight() / 2 + props.app.state.viewportY() * props.app.state.viewportZoom()))

  const gridOffsetX = createMemo(() => translateX() % props.app.state.viewportZoom());
  const gridOffsetY = createMemo(() => translateY() % props.app.state.viewportZoom());

  const handleMouseDown = (e: MouseEvent) => {
    if (!props.app.state.spaceHeld() && e.button !== 1) {
      return
    }
    e.preventDefault()
    // prevent selected tool from handling the click
    e.stopImmediatePropagation()

    setDragging(true)

    let lastX = e.clientX
    let lastY = e.clientY

    const handleMouseMove = (event: MouseEvent) => {
      props.app.state.setViewportX(props.app.state.viewportX() + (event.clientX - lastX) / props.app.state.viewportZoom())
      props.app.state.setViewportY(props.app.state.viewportY() + (event.clientY - lastY) / props.app.state.viewportZoom())
      lastX = event.clientX
      lastY = event.clientY
    }

    const handleMouseUp = () => {
      setDragging(false)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }

  // `transition: transform 0.Xs` won't work here
  // can't animate the background grid pattern
  // animating only the contents make them look like they're lagging
  // so we're not using transitions at all
  return (
    <div
      class="viewport"
      data-active-tool={props.app.state.tool().id}
      style={{
        cursor: dragging() ? 'grabbing' : props.app.state.spaceHeld() ? 'grab' : (props.app.state.tool().cursor ?? 'default'),
      }}
      onmousedown={handleMouseDown}
    >
      <svg
        width={innerWidth()}
        height={innerHeight()}
        class="pixel-grid"
        classList={{
          "display-none": props.app.state.viewportZoom() < 10,
        }}
      >
        <defs>
          <pattern
            id="pixel-grid-pattern"
            width={props.app.state.viewportZoom()}
            height={props.app.state.viewportZoom()}
            patternUnits="userSpaceOnUse"
          >
            <rect width="1" height="1" fill="#505050" />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#pixel-grid-pattern)"
          transform={`translate(${gridOffsetX()} ${gridOffsetY()})`}
        />
      </svg>

      <div style={{
        transform: `translate(${translateX()}px, ${translateY()}px)`
      }}>
        <For each={props.app.project.topLevelNodes()}>
          {(nodeId) => {
            const node = () => props.app.project.nodes[nodeId]

            return (
              <Show when={props.app.resources.nodes[node().type].render}>
                <Dynamic component={props.app.resources.nodes[node().type].render} app={props.app} node={node()} id={nodeId} />
              </Show>
            )
          }}
        </For>
        <Show when={props.app.state.selection().length}>
          {(_) => {
            const minX = () => Math.min(...props.app.state.selection().map(getMinX))
            const minY = () => Math.min(...props.app.state.selection().map(getMinY))
            const maxX = () => Math.max(...props.app.state.selection().map(getMaxX))
            const maxY = () => Math.max(...props.app.state.selection().map(getMaxY))

            return (
              <svg
                width={(maxX() - minX()) * props.app.state.viewportZoom() + 1}
                height={(maxY() - minY()) * props.app.state.viewportZoom() + 1}
                fill="none"
                style={{
                  position: "absolute",
                  left: `${minX() * props.app.state.viewportZoom()}px`,
                  top: `${minY() * props.app.state.viewportZoom()}px`,
                  "pointer-events": "none",
                }}
              >
                <For each={props.app.state.selection()}>
                  {(selection) => (
                    <Show when={selection.type === "rectangle"}>
                      <rect
                        // @ts-ignore
                        x={(selection.x - minX()) * props.app.state.viewportZoom() + .5}
                        // @ts-ignore
                        y={(selection.y - minY()) * props.app.state.viewportZoom() + .5}
                        // @ts-ignore
                        width={selection.width * props.app.state.viewportZoom()}
                        // @ts-ignore
                        height={selection.height * props.app.state.viewportZoom()}
                        stroke="white"
                        stroke-width="1"
                        stroke-dasharray="3 3"
                        stroke-dashoffset="0"
                      >
                        <animate attributeName="stroke-dashoffset" from="0" to="6" dur=".5s" repeatCount="indefinite" />
                      </rect>
                    </Show>
                  )}
                </For>
              </svg>
            )
          }}
        </Show>
        <Entries of={props.app.state.viewportElements}>
          {(_, element) => (
            <Dynamic component={element()} app={props.app} />
          )}
        </Entries>
      </div>
    </div>
  )
}

export default Viewport
