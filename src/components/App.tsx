import { Component, createEffect, createMemo, createSignal, For, JSX, Show } from 'solid-js'
import './App.css'
import { createStore } from 'solid-js/store'
import { Command, Cursor, Frame, Search } from './icons-16px';
import { Dynamic } from 'solid-js/web';

function App() {
  const app = createAppState();

  return (
    <>
      <WorkspaceView app={app} />
      <div class="ui-layer">
        <div class="ui-top">
          <Toolbar app={app} />
          <Show when={app.selectedTool === "actions"}>
            <CommandPalette commands={global_commands} app={app} />
          </Show>
        </div>
      </div>
    </>
  )
}

type Node = { type: string, parents: string[], [data: string]: any }

type FrameNode = Node & { type: "frame", parents: never[], title: string | null, x: number, y: number, width: number, height: number };

type Command = {
  label: string,
  icon?: Component,
  // keywords?: string[],
  execute: (app: AppState) => void
}

const global_commands: Command[] = [
  {
    label: "Test command",
    icon: Cursor,
    execute: () => console.log("Test command executed")
  },
  {
    label: "Clear workspace",
    execute: (app) => app.setNodes({})
  }
]

type AppState = ReturnType<typeof createAppState>

const createAppState = () => {
  const [nodes, setNodes] = createStore<Record<string, Node>>({})

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


  const [selectedTool, setSelectedTool] = createSignal(ToolbarToolId.Select)

  return {
    nodes,
    setNodes,
    get selectedNodes() { return selectedNodes() },
    setSelectedNodes,
    get selectedTool() { return selectedTool() },
    setSelectedTool,
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

enum ToolbarToolId {
  Select = "select",
  Frame = "frame",
  Actions = "actions"
}

function Toolbar(props: {
  app: AppState
}) {

  const handleClick = (tool: ToolbarToolId) => {
    props.app.setSelectedTool(tool)
  }

  return (
    <div class="toolbar">
      <h2 class="scr-only">Toolbar</h2>
      <div class="toolbar-content">
        <ToolbarIcon
          label="Select&thinsp;/&thinsp;Move"
          name="toolbar"
          keyshortcuts="V"
          // cornerHint="V"
          checked={props.app.selectedTool === ToolbarToolId.Select}
          onClick={() => handleClick(ToolbarToolId.Select)}
        >
          <Cursor filled={props.app.selectedTool === ToolbarToolId.Select} />
        </ToolbarIcon>
        <ToolbarIcon
          label="Frame"
          name="toolbar"
          keyshortcuts="F"
          // cornerHint="F"
          checked={props.app.selectedTool === ToolbarToolId.Frame}
          onClick={() => handleClick(ToolbarToolId.Frame)}
        >
          <Frame />
        </ToolbarIcon>

        <ToolbarIcon
          label="Actions"
          name="actions"
          keyshortcuts="Ctrl+K"
          checked={props.app.selectedTool === ToolbarToolId.Actions}
          onClick={() => handleClick(ToolbarToolId.Actions)}
        >
          <Command />
        </ToolbarIcon>
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

const CommandPalette = (props: { commands: Command[], app: AppState }) => {
  const [query, setQuery] = createSignal("")

  const filteredCommands = createMemo(() => {
    const queryLower = query().toLowerCase()
    return props.commands.filter(command => command.label.toLowerCase().includes(queryLower))
  })

  const handleInput = (event: Event) => {
    const input = event.target as HTMLInputElement
    setQuery(input.value)
  }

  const handleCommandClick = (command: Command) => {
    command.execute(props.app)
  }

  return (
    <div class="command-palette">
      <div class="command-palette-search">
        <Search />
        <input
          type="text"
          class="command-palette-input"
          placeholder="Search"
          maxlength="150"
          spellcheck={false}
          ref={el => requestAnimationFrame(() => el.focus())}
          onInput={handleInput}
          id="command-palette-search"
        />
      </div>
      <h2 class="command-palette-heading">Actions</h2>
      <ul class="command-palette-list">
        <For each={filteredCommands()}>
          {command => (
            <li
              class="command-palette-item"
              onClick={() => handleCommandClick(command)}
            >
              <div class="command-palette-icon">
                <Show when={command.icon}>
                  <Dynamic component={command.icon} />
                </Show>
              </div>
              {command.label}
            </li>
          )}
        </For>
      </ul>
    </div>
  )
}

export default App
