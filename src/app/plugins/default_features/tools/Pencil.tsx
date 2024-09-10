import "./Pencil.css"
import { createSignal, For, Show } from "solid-js"
import { Tool, Application, floorComponents, getNodePosition } from "../../../api"
import { PencilAction } from "../actions"
import { CircleIcon, DropIcon, PencilIcon, SelectionCrosshairIcon, SquareIcon, StrokeWidthIcon } from "../../../components/form/icons"
import SubToolbar from "../../../components/SubToolbar"
import ToggleButton from "../../../components/form/ToggleButton"
import InputGroup from "../../../components/form/InputGroup"
import NumberInput from "../../../components/form/NumberInput"
import { CustomOption, CustomSelect, OptionDivider } from "../../../components/form/CustomSelect"

type DrawingState = {
  nodeId: string,
  action: PencilAction,
}

export type Mode = keyof typeof modeNames

const modeNames = {
  normal: 'Normal',
  darker: 'Darker',
  multiply: 'Multiply',
  lighter: 'Lighter',
  screen: 'Screen',
} as const

const modeGroups = [
  ['normal'],
  ['darker', 'multiply'],
  ['lighter', 'screen'],
] as const

export const Pencil = (): Tool => {
  let app!: Application

  const [currentMousePos, setCurrentMousePos] = createSignal<{ x: number, y: number }>({ x: 0, y: 0 })

  const [drawingState, setDrawingState] = createSignal<DrawingState | null>(null)
  const [autoSelect, setAutoSelect] = createSignal(true)
  const [shape, setShape] = createSignal<'circle' | 'square'>('circle')
  const [size, setSize] = createSignal(1)
  const [mode, setMode] = createSignal<Mode>('normal')
  const [opacity, setOpacity] = createSignal(100)

  const handleMouseDown = (e: MouseEvent) => {
    if (!(e.target as Element)?.closest(".workspace-view")) {
      return
    }
    if (e.button !== 0) {
      return
    }

    e.preventDefault()

    const targetedId = (e.target as Element)?.closest("[data-drawable]")?.getAttribute("data-node-id") ?? null
    if (targetedId) {
      const node = app.project.nodes[targetedId]
      const type = app.resources.nodes[node.type]

      if (type.supportsCanvasActions) {
        const pos = floorComponents(getNodePosition(app, node, e.clientX, e.clientY))
        setCurrentMousePos(pos)
        const action: PencilAction = {
          type: "pencil",
          points: [pos],
          shape: shape(),
          size: size(),
        }
        setDrawingState({ nodeId: targetedId, action })
        type.addCanvasAction!(node, targetedId, action, app)
      }
    }

    // TODO: draw straight lines when shift is pressed
  }

  const handleMouseMove = (e: MouseEvent) => {
    const state = drawingState()
    if (state) {
      const node = app.project.nodes[state.nodeId]
      if (!node) {
        setDrawingState(null)
        return
      }

      let { x: newX, y: newY } = floorComponents(getNodePosition(app, node, e.clientX, e.clientY))
      if (newX === currentMousePos().x && newY === currentMousePos().y) {
        return
      }

      const newAction: PencilAction = {
        ...state.action,
        points: [...state.action.points, { x: newX, y: newY }]
      }
      app.resources.nodes[node.type].replaceCanvasAction!(node, state.nodeId, state.action, newAction, app)

      setCurrentMousePos({ x: newX, y: newY })
      setDrawingState({ ...state, action: newAction })
    }
  }

  const handleMouseUp = () => {
    setDrawingState(null)
  }

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    const newValue = size() - Math.sign(e.deltaY)
    setSize(Math.max(1, Math.min(100, newValue)))
  }

  return {
    id: "pencil",
    label: "Pencil",
    icon: PencilIcon,
    cursor: "crosshair",
    keybinds: [{ key: "P" }],
    onSelect: (a) => {
      app = a
      document.addEventListener("mousedown", handleMouseDown)
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("wheel", handleWheel)

      app.state.setSubToolbar(() => () => {
        return (
          <SubToolbar>
            <ToggleButton
              title="Auto-select element under cursor"
              pressed={autoSelect()}
              onClick={() => setAutoSelect(!autoSelect())}
            >
              <SelectionCrosshairIcon />
            </ToggleButton>

            <InputGroup>
              <ToggleButton
                title="Round brush shape"
                pressed={shape() === 'circle'}
                onClick={() => setShape('circle')}
              >
                <CircleIcon filled={shape() === 'circle'} />
              </ToggleButton>
              <ToggleButton
                title="Square brush shape"
                pressed={shape() === 'square'}
                onClick={() => setShape('square')}
              >
                <SquareIcon filled={shape() === 'square'} />
              </ToggleButton>
            </InputGroup>

            <NumberInput
              value={size()}
              onChange={value => setSize(value)}
              min={1}
              max={100}
              step={1}
              icon={<StrokeWidthIcon />}
              title="Stroke width"
            />

            <InputGroup>
              <CustomSelect
                value={modeNames[mode()]}
                onChange={value => setMode(value as Mode)}
                icon={<DropIcon />}
                class={"w-5.5rem"}
              >
                {(close) => (
                  <For each={modeGroups}>{(group, idx) => (
                    <>
                      <For each={group}>
                        {m => (
                          <CustomOption
                            value={modeNames[m]}
                            selected={m === mode()}
                            onClick={() => {
                              setMode(m)
                              close()
                            }}
                            // TODO: enable once implemented
                            disabled={m !== "normal"}
                            title={m !== "normal" ? "Not implemented yet" : undefined}
                          >
                            {modeNames[m]}
                          </CustomOption>
                        )}
                      </For>
                      <Show when={idx() != modeGroups.length - 1}>
                        <OptionDivider />
                      </Show>
                    </>
                  )}
                  </For>
                )}
              </CustomSelect>
              <NumberInput
                value={opacity()}
                onChange={value => setOpacity(value)}
                title="Not implemented yet"
                min={0}
                max={100}
                step={1}
                size={3}
                unit={'%'}
                class={"w-1.5rem"} />
            </InputGroup>
          </SubToolbar>
        )
      })
    },
    onDeselect: () => {
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("wheel", handleWheel)

      app.state.setSubToolbar(undefined)
    }
  }
}
