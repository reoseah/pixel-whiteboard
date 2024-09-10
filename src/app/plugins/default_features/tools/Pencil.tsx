import "./Pencil.css"
import { createSignal } from "solid-js"
import { Tool, Application, floorComponents, getNodePosition } from "../../../api"
import { PencilAction } from "../actions"
import { CircleIcon, PencilIcon, SelectionCrosshairIcon, SquareIcon, StrokeWidthIcon } from "../components/icons"
import SubToolbar from "../../../components/SubToolbar"
import ToggleButton from "../../../components/ToggleButton"
import InputGroup from "../../../components/InputGroup"
import { NumberInput } from "../../../components/NumberInput"

type DrawingState = {
  nodeId: string,
  action: PencilAction,
}

export const Pencil = (): Tool => {
  let app!: Application

  const [currentMousePos, setCurrentMousePos] = createSignal<{ x: number, y: number }>({ x: 0, y: 0 })

  const [drawingState, setDrawingState] = createSignal<DrawingState | null>(null)
  const [autoSelect, setAutoSelect] = createSignal(true)
  const [shape, setShape] = createSignal<'circle' | 'square'>('circle')
  const [size, setSize] = createSignal(1)

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
          points: [pos]
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

      app.state.setSubToolbar(() => () => {
        return (
          <SubToolbar>
            <ToggleButton
              tooltip="Auto-select element beneath cursor"
              pressed={autoSelect()}
              onClick={() => setAutoSelect(!autoSelect())}
            >
              <SelectionCrosshairIcon />
            </ToggleButton>

            <InputGroup>
              <ToggleButton
                tooltip="Round brush shape"
                pressed={shape() === 'circle'}
                onClick={() => setShape('circle')}
              >
                <CircleIcon filled={shape() === 'circle'} />
              </ToggleButton>
              <ToggleButton
                tooltip="Square brush shape"
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
              tooltip="Stroke width"
            />
          </SubToolbar>
        )
      })
    },
    onDeselect: () => {
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)

      app.state.setSubToolbar(undefined)
    }
  }
}
