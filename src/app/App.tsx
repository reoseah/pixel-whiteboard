import './App.css'

import { Component, createMemo, createSignal, onCleanup, Show } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Dynamic } from 'solid-js/web';
import * as Y from "yjs"
import { IndexeddbPersistence } from 'y-indexeddb';
import { Application, Command, findNextZoom, findPreviousZoom, NodeType, Plugin, NodeData, ProjectState, Resources, Tool, CanvasAction } from './api'
import DefaultFeaturesPlugin from './plugins/default_features';
import Toolbar from './components/Toolbar';
import Viewport from './components/Viewport';
import useHeldKey from './hooks/useHeldKey';

function App() {
  const resources = useResources([DefaultFeaturesPlugin])
  const project = useProject()

  const [selectedNodes, setSelectedNodes] = createSignal<string[]>([])

  const [toolId, setToolId] = createSignal("select")
  const tool = () => resources.tools[toolId()] ?? resources.tools["select"]
  const selectTool = (next: Tool) => {
    if (toolId() === next.id) {
      return
    }
    const prev = tool();
    prev.onDeselect?.(app)
    next.onSelect?.(app, prev)
    setToolId(next.id)
  }

  const [subToolbar, setSubToolbar] = createSignal<Component<{ app: Application }> | undefined>()
  const [viewportElements, setViewportElements] = createStore<Record<string, Component<{ app: Application }>>>()

  const [viewportX, setViewportX] = createSignal(0)
  const [viewportY, setViewportY] = createSignal(0)
  const [viewportZoom, setViewportZoom] = createSignal(10)

  const ctrlHeld = useHeldKey("Control")
  const shiftHeld = useHeldKey("Shift")
  const spaceHeld = useHeldKey(" ")

  const [titleBeingEdited, setTitleBeingEdited] = createSignal<string | null>(null)
  const [highlightedNodes, setHighlightedNodes] = createSignal<string[]>([])

  const ydoc = new Y.Doc()
  new IndexeddbPersistence('pixel-art-editor', ydoc)

  const app: Application = {
    resources,
    project,
    state: {
      selectedNodes,
      setSelectedNodes,
      tool,
      selectTool,
      subToolbar,
      setSubToolbar,
      viewportElements,
      setViewportElements,
      viewportX,
      setViewportX,
      viewportY,
      setViewportY,
      viewportZoom,
      setViewportZoom,
      titleBeingEdited,
      setTitleBeingEdited,
      highlightedNodes,
      setHighlightedNodes,
      ctrlHeld,
      shiftHeld,
      spaceHeld
    },
    ydoc
  }

  tool().onSelect?.(app, null!)

  useCommandKeybinds(app)
  useZoomWithMouseWheel(app)

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
  let nodeTypes: Record<string, NodeType> = {}
  let actions: Record<string, CanvasAction> = {}

  plugins.forEach(plugin => plugin.initialize({
    addTool: tool => tools[tool.id] = tool,
    addCommand: command => commands.push(command),
    addNodeType: (type, nodeType) => nodeTypes[type] = nodeType,
    addActionType: (type, action) => actions[type] = action
  }))

  return {
    tools: Object.freeze(tools),
    commands: Object.freeze(commands),
    nodes: Object.freeze(nodeTypes),
    actions: Object.freeze(actions)
  }
}

const useProject = (): ProjectState => {
  const [nodes, setNodes] = createStore<Record<string, NodeData>>({
    whiteboard: {
      type: "whiteboard",
      children: []
    }
  })
  const topLevelNodes = createMemo(() => {
    const children = new Set<string>()
    for (const node of Object.values(nodes)) {
      for (const child of node.children) {
        children.add(child)
      }
    }
    const topLevelNodes = []
    for (const nodeId in nodes) {
      if (!children.has(nodeId)) {
        topLevelNodes.push(nodeId)
      }
    }
    return topLevelNodes
  })

  return {
    nodes,
    setNodes,
    topLevelNodes
  }
}

const useCommandKeybinds = (app: Application) => {
  const handleKeydown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isEditable = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    if (isEditable) {
      return
    }

    for (const command of app.resources.commands) {
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
  document.addEventListener("keydown", handleKeydown)
  onCleanup(() => document.removeEventListener("keydown", handleKeydown))
}

const useZoomWithMouseWheel = (app: Application) => {
  const handler = (event: WheelEvent) => {
    if (!app.state.ctrlHeld()) {
      return
    }
    event.preventDefault();

    const currentZoom = app.state.viewportZoom();
    let newZoom: number;

    if (event.deltaY < 0) {
      newZoom = findNextZoom(currentZoom)
    } else {
      newZoom = findPreviousZoom(currentZoom)
    }

    app.state.setViewportZoom(newZoom)
  }

  document.addEventListener("wheel", handler, { passive: false })
  onCleanup(() => document.removeEventListener("wheel", handler))
}
