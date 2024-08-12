import './App.css'

import { createSignal, For, onCleanup, onMount, Show } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Application, Command, FrameNode, Plugin, ProjectNode, ProjectState, Tool } from './api'
import Toolbar from './components/Toolbar';
import CommandPalette from './components/CommandPalette';
import DefaultFeaturesPlugin from './plugins/default_features';

function App() {
  const resources = buildResources([DefaultFeaturesPlugin])

  const [selectedTool, setSelectedTool] = createSignal("select")

  const project = createProject();

  const app: Application = {
    resources,
    state: {
      selectedTool,
      setSelectedTool
    },
    project
  }

  const handleKeybinds = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isEditable = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    if (isEditable) {
      return
    }

    for (const command of resources.commands) {
      for (const keybind of command.keybinds ?? []) {
        if (e.key.toLowerCase() === keybind.key.toLowerCase()
          && Boolean(keybind.shift) === e.shiftKey
          && Boolean(keybind.ctrl) === e.ctrlKey
          && Boolean(keybind.alt) === e.altKey) {
          command.execute(app)
          e.preventDefault()
          return
        }
      }
    }
  }
  onMount(() => document.addEventListener("keydown", handleKeybinds))
  onCleanup(() => document.removeEventListener("keydown", handleKeybinds))

  return (
    <>
      <WorkspaceView app={project} />
      <div class="ui-layer">
        <div class="ui-top">
          <Toolbar tools={resources.tools} selectedTool={selectedTool()} onSelectTool={setSelectedTool} />
          <Show when={selectedTool() === "actions"}>
            <CommandPalette commands={resources.commands} app={app} />
          </Show>
        </div>
      </div>
    </>
  )
}

export default App

function buildResources(plugins: Plugin[]) {
  let tools: Tool[] = []
  let commands: Command[] = []

  plugins.forEach(plugin => plugin.initialize({
    addTool: tool => tools.push(tool),
    addCommand: command => commands.push(command)
  }))

  return {
    tools: Object.freeze(tools),
    commands: Object.freeze(commands)
  }
}

const createProject = (): ProjectState => {
  const [nodes, setNodes] = createStore<Record<string, ProjectNode>>({})
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
  setSelectedNodes(["test"])

  return {
    nodes,
    setNodes,
    selectedNodes,
    setSelectedNodes
  }
}

function WorkspaceView(props: { app: ProjectState }) {
  const frames = () => Object.entries(props.app.nodes).filter(([_, node]) => node.type === "frame")

  return (
    <div class="workspace-view">
      <For each={frames()}>
        {([nodeId, frame]) => (
          <FrameView
            frame={frame as FrameNode}
            selected={props.app.selectedNodes().includes(nodeId)}
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

