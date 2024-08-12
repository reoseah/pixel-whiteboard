import './App.css'

import { createMemo, createSignal, For, onCleanup, onMount, Show } from 'solid-js'
import { createStore } from 'solid-js/store'
import Toolbar from './tool/Toolbar';
import CommandPalette from './command/CommandPalette';
import { buildCommands } from './command/command';
import { BUILTIN_TOOLS } from './tool/tool';

function App() {
  const app = createAppState();

  const handleKeybinds = (e: KeyboardEvent) => {
    for (const command of app.commands()) {
      for (const keybind of command.keybinds ?? []) {
        if (e.key.toLowerCase() === keybind.key.toLowerCase()
          && Boolean(keybind.shift) === e.shiftKey
          && Boolean(keybind.ctrl) === e.ctrlKey
          && Boolean(keybind.alt) === e.altKey) {
          command.execute(app)
          e.preventDefault();
          return;
        }
      }
    }
  }
  onMount(() => document.addEventListener("keydown", handleKeybinds))
  onCleanup(() => document.removeEventListener("keydown", handleKeybinds))

  return (
    <>
      <WorkspaceView app={app} />
      <div class="ui-layer">
        <div class="ui-top">
          <Toolbar app={app} />
          <Show when={app.selectedTool === "actions"}>
            <CommandPalette commands={app.commands()} app={app} />
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

  const [tools, setTools] = createSignal(BUILTIN_TOOLS);
  const [selectedTool, setSelectedTool] = createSignal("select")

  const commands = createMemo(() => buildCommands())

  return {
    nodes,
    setNodes,
    get selectedNodes() { return selectedNodes() },
    setSelectedNodes,
    get selectedTool() { return selectedTool() },
    setSelectedTool,
    tools,
    commands
  }
}

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

export default App
