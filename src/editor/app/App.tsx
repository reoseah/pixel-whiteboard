import { Component, createEffect, createSignal, For, JSX, Show } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { Dynamic } from 'solid-js/web';
import { CommandIcon, CursorIcon, FrameIcon } from '../icons-16px';
import { CommandPalette } from '../command/CommandPalette';
import './App.css'
import Command from '../command/command';

function App() {
  const app = createAppState();

  return (
    <>
      <WorkspaceView app={app} />
      <div class="ui-layer">
        <div class="ui-top">
          <Toolbar app={app} />
          <Show when={app.selectedTool === "actions"}>
            <CommandPalette commands={builtin_commands} app={app} />
          </Show>
        </div>
      </div>
    </>
  )
}

export type AppNode = { type: string, parents: string[], [data: string]: any }

export type FrameNode = AppNode & { type: "frame", parents: never[], title: string | null, x: number, y: number, width: number, height: number };

export type AppState = ReturnType<typeof createAppState>

export const createAppState = () => {
  const [nodes, setNodes] = createStore<Record<string, AppNode>>({})

  const [selectedNodes, setSelectedNodes] = createSignal<string[]>([])

  // TODO remove, just for testing
  setNodes({
    "test": {
      type: "frame",
      parents: [],
      title: "Frame",
      x: 100,
      y: 100,
      width: 200,
      height: 200
    }
  })
  // setSelectedNodes(["test"])

  const [tools, setTools] = createSignal(builtin_tools);
  const [selectedTool, setSelectedTool] = createSignal("select")

  createEffect(() => {
    const handleKeybinds = (e: KeyboardEvent) => {
      for (const tool of tools()) {
        for (const keybind of tool.keybinds) {
          if (e.key === keybind.key
            && Boolean(keybind.shift) === e.shiftKey
            && Boolean(keybind.ctrl) === e.ctrlKey
            && Boolean(keybind.alt) === e.altKey) {
              
            setSelectedTool(tool.id)
            e.preventDefault();
            return;
          }
        }
      }
    }
    document.addEventListener("keydown", handleKeybinds)
    return () => document.removeEventListener("keydown", handleKeybinds)
  })

  return {
    nodes,
    setNodes,
    get selectedNodes() { return selectedNodes() },
    setSelectedNodes,
    get selectedTool() { return selectedTool() },
    setSelectedTool,
    tools
  }
}

export type Keybind = {
  key: string,
  shift?: true,
  ctrl?: true,
  alt?: true
}

export const builtin_commands: Command[] = [
  {
    label: "Test command",
    icon: CursorIcon,
    execute: () => console.log("Test command executed")
  },
  {
    label: "Clear workspace",
    execute: (app) => app.setNodes(reconcile({}))
  }
]

export type Tool = {
  id: string,
  label: string,
  icon: Component<{ selected: boolean }>,
  keybinds: Keybind[],
  keyshortcuts: string
  // TODO on select, on deselect, on workspace click/move/release handlers, etc
}

const builtin_tools: Tool[] = [
  {
    id: "select",
    label: "Select&thinsp;/&thinsp;Move",
    icon: (props) => (<CursorIcon filled={props.selected} />),
    keybinds: [{ key: "V" }],
    keyshortcuts: "V"
  },
  {
    id: "frame",
    label: "Frame",
    icon: FrameIcon,
    keybinds: [{ key: "F" }],
    keyshortcuts: "F"
  },
  {
    id: "actions",
    label: "Actions",
    icon: CommandIcon,
    keybinds: [{ key: "K", ctrl: true }],
    keyshortcuts: "Ctrl+K"
  }
]


function WorkspaceView(props: { app: AppState }) {
  const frames = () => Object.entries(props.app.nodes).filter(([_, node]) => node.type === "frame")

  return (
    <div class="workspace-view">
      <For each={frames()}>
        {([nodeId, frame]) => (
          <FrameView
            frame={frame as FrameNode}
            selected={props.app.selectedNodes.includes(nodeId)}
            onSelect={() => props.app.setSelectedNodes([nodeId])}
          />
        )}
      </For>
    </div>
  )
}

function FrameView(props: { frame: FrameNode, selected?: boolean, onSelect?: () => void }) {
  return (
    <div
      class="frame-view"
      data-selected={props.selected}
      style={{
        left: `${props.frame.x}px`,
        top: `${props.frame.y}px`,
        width: `${props.frame.width}px`,
        height: `${props.frame.height}px`
      }}
    >
      <div
        class="frame-view-title"
        onClick={props.onSelect}
      >
        {props.frame.title ?? "Frame"}
      </div>
    </div>
  )
}

function Toolbar(props: {
  app: AppState
}) {

  const handleClick = (id: string) => {
    props.app.setSelectedTool(id)
  }

  return (
    <div class="toolbar">
      <h2 class="scr-only">Toolbar</h2>
      <div class="toolbar-content">
        <For each={builtin_tools}>
          {(tool) => (
            <ToolbarIcon
              name={tool.id}
              label={tool.label}
              keyshortcuts={tool.keyshortcuts}
              checked={props.app.selectedTool === tool.id}
              onClick={() => handleClick(tool.id)}
            >
              <Dynamic component={tool.icon} selected={props.app.selectedTool === tool.id} />
            </ToolbarIcon>
          )}
        </For>
      </div>
    </div>
  )
}

function ToolbarIcon(props: {
  label: string,
  name: string,
  checked?: boolean,
  keyshortcuts?: string,
  cornerHint?: string,
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>,
  children?: JSX.Element
}) {
  const title = () => props.keyshortcuts ? `${props.label} — ${props.keyshortcuts}` : props.label

  return (
    <button
      class="toolbar-icon"
      type="button"
      title={title()}
      aria-label={props.label}
      aria-keyshortcuts={props.keyshortcuts}
      aria-pressed={props.checked}
      onClick={props.onClick}
    >
      <div class="toolbar-icon-content">
        {props.children}
      </div>
      <Show when={props.cornerHint}>
        <div class="toolbar-icon-hint">
          {props.cornerHint}
        </div>
      </Show>
    </button>
  )
}

export default App
