import "./CommandPalette.css"

import { createMemo, createSignal, For, type JSX, onCleanup, Show } from "solid-js"
import { Dynamic } from "solid-js/web"
import { Application, Command, stringifyKeybind, Tool } from "../../../api"
import useClickOutside from "../../../hooks/useClickOutside"
import { CommandIcon, SearchIcon } from "../../../components/icons"

export const CommandPalette = (): Tool => {
  return {
    id: "actions",
    label: "Actions",
    icon: CommandIcon,
    keybinds: [{ key: "K", ctrl: true }],
    onSelect: (app, previousTool) => {
      app.state.setSubToolbar(() => CommandPaletteComponent(previousTool ?? app.resources.tools.select))
    },
    onDeselect: (app) => {
      app.state.setSubToolbar(undefined)
    }
  }
}

export const CommandPaletteComponent = (previousTool: Tool) => (props: { app: Application }) => {
  const [query, setQuery] = createSignal("")

  const filteredCommands = createMemo(() => {
    const queryLower = query().toLowerCase()

    return props.app.resources.commands
      .filter(command => command.label.toLowerCase().includes(queryLower))
      .filter(command => command.isDisabled === undefined || !command.isDisabled(props.app))
  })

  const [wrapper, setWrapper] = createSignal<HTMLDivElement>()
  useClickOutside(wrapper, () => { props.app.state.selectTool(previousTool) })

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      props.app.state.selectTool(previousTool)
    }
    // TODO: handle arrow keys to navigate the list
  }
  document.addEventListener("keydown", handleKeyDown)
  onCleanup(() => document.removeEventListener("keydown", handleKeyDown))

  const handleInput: JSX.InputEventHandlerUnion<HTMLInputElement, InputEvent> = (event) => {
    setQuery(event.target.value)
    event.preventDefault()
    event.stopPropagation()
  }

  const handleCommandClick = (command: Command) => {
    props.app.state.selectTool(previousTool)
    command.execute(props.app)
  }

  return (
    <div class="command-palette" ref={setWrapper}>
      <div class="command-palette-search">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search"
          maxlength="150"
          spellcheck={false}
          ref={el => requestAnimationFrame(() => el.focus())}
          onInput={handleInput}
          id="command-palette-search"
          autocomplete="off"
        />
      </div>
      <Show
        when={filteredCommands().length}
        fallback={<p class="command-palette-no-results">No results found</p>}
      >
        <h2 class="command-palette-heading">Actions</h2>
        <ul class="command-palette-entries">
          <For each={filteredCommands()}>
            {command => (
              <li>
                <button
                  class="command-palette-button"
                  onClick={() => handleCommandClick(command)}
                >
                  <div class="command-icon">
                    <Show when={command.icon}>
                      <Dynamic component={command.icon} />
                    </Show>
                  </div>
                  <span class="command-description">{command.label}</span>
                  <Show when={command.keybinds && command.keybinds[0]}>
                    <kbd class="command-keybind">
                      {stringifyKeybind(command.keybinds![0])}
                    </kbd>
                  </Show>
                </button>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  )
}