import "./CommandPalette.css"

import { Accessor, createMemo, createSignal, For, type JSX, onCleanup, onMount, Show } from "solid-js"
import { Dynamic } from "solid-js/web"
import { Application, Command, stringifyKeybind, Tool } from "../../../api"
import { SearchIcon } from "./icons"

export const CommandPalette = (previousTool: Tool) => (props: { app: Application }) => {
  const [query, setQuery] = createSignal("")

  const filteredCommands = createMemo(() => {
    const queryLower = query().toLowerCase()

    return props.app.resources.commands
      .filter(command => command.label.toLowerCase().includes(queryLower))
      .filter(command => command.isDisabled === undefined || !command.isDisabled(props.app))
  })

  const [wrapper, setWrapper] = createSignal<HTMLDivElement>()
  useClickOutside(wrapper, () => { props.app.state.selectTool(previousTool) })

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      props.app.state.selectTool(previousTool)
    }
  }
  document.addEventListener("keydown", handleEscape)
  onCleanup(() => document.removeEventListener("keydown", handleEscape))

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
        />
      </div>
      <Show when={filteredCommands().length}>
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

export default CommandPalette

const useClickOutside = (ref: Accessor<HTMLElement | undefined>, callback: (e: Event) => void) => {
  const handleClick = (event: Event) => {
    const element = ref()
    if (!element || element.contains(event.target as Node)) {
      return
    }

    callback(event)
  }
  onMount(() => document.addEventListener('click', handleClick))
  onCleanup(() => document.removeEventListener('click', handleClick))
}