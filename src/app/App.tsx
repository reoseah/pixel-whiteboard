import './App.css'

import { Component, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Application, Command, Plugin, ProjectNode, ProjectState, Tool } from './api'
import DefaultFeaturesPlugin from './plugins/default_features';
import Toolbar from './components/Toolbar';
import CommandPalette from './components/CommandPalette';
import Viewport from './components/Viewport';

function App() {
  const resources = buildResources([DefaultFeaturesPlugin])
  const project = createProject();

  const [selectedTool, setSelectedTool] = createSignal("select")
  const [selectedToolStore, setSelectedToolStore] = createStore<any>();
  const [selectedToolComponent, setSelectedToolComponent] = createSignal<Component | null>(null)

  const [shiftHeld, setShiftHeld] = createSignal(false)
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Shift") {
      setShiftHeld(true)
    }
  }
  const handleKeyup = (e: KeyboardEvent) => {
    if (e.key === "Shift") {
      setShiftHeld(false)
    }
  }
  document.addEventListener("keydown", handleKeydown)
  document.addEventListener("keyup", handleKeyup)
  onCleanup(() => {
    document.removeEventListener("keydown", handleKeydown)
    document.removeEventListener("keyup", handleKeyup)
  })

  const app: Application = {
    resources,
    project,
    state: {
      selectedTool,
      setSelectedTool,
      selectedToolStore,
      setSelectedToolStore,
      selectedToolComponent,
      setSelectedToolComponent,
      shiftHeld
    }
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
      <Viewport app={app} />
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
  let tools: Record<string, Tool> = {}
  let commands: Command[] = []

  plugins.forEach(plugin => plugin.initialize({
    addTool: tool => tools[tool.id] = tool,
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

  return {
    nodes,
    setNodes,
    selectedNodes,
    setSelectedNodes
  }
}
