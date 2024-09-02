import './App.css'

import { Component, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Application, Command, Plugin, ProjectNode, ProjectState, Resources, Tool } from './api'
import DefaultFeaturesPlugin from './plugins/default_features';
import Toolbar from './components/Toolbar';
import Viewport from './components/Viewport';
import { Dynamic } from 'solid-js/web';

function App() {
  const resources = useResources([DefaultFeaturesPlugin])
  const project = useProject();

  const [toolId, setToolId] = createSignal("select")
  const tool = () => resources.tools[toolId()] ?? resources.tools["select"]
  const selectTool = (value: Tool) => {
    const prev = tool();
    prev.onDeselect?.(app)
    value.onSelect?.(app, prev)
    setToolId(value.id)
  }

  const [subToolbar, setSubToolbar] = createSignal<Component<{ app: Application }> | undefined>()
  const [viewportElements, setViewportElements] = createStore<Record<string, Component<{ app: Application }>>>()

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
      tool,
      selectTool,
      subToolbar,
      setSubToolbar,
      viewportElements,
      setViewportElements,
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
        <div class="top-center-layout">
          <Toolbar tools={Object.values(resources.tools)} selectedTool={tool()} onSelectTool={selectTool} />
          <Show when={subToolbar()}>
            <Dynamic component={subToolbar()!} app={app} />
          </Show>
        </div>
      </div>
    </>
  )
}

export default App

function useResources(plugins: Plugin[]): Resources {
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

const useProject = (): ProjectState => {
  const [nodes, setNodes] = createStore<Record<string, ProjectNode>>({})
  const [selectedNodes, setSelectedNodes] = createSignal<string[]>([])

  return {
    nodes,
    setNodes,
    selectedNodes,
    setSelectedNodes
  }
}
