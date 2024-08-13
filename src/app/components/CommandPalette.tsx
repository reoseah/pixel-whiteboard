import "./CommandPalette.css"

import { Accessor, createMemo, createSignal, For, type JSX, onCleanup, onMount, Show } from "solid-js"
import { Dynamic } from "solid-js/web"
import { Application, Command } from "../api"
import { SearchIcon } from "../plugins/default_features/icons"
import { stringifyKeybind } from "../api-utils"

export const CommandPalette = (props: { commands: readonly Command[], app: Application }) => {
    const [query, setQuery] = createSignal("")

    const filteredCommands = createMemo(() => {
        const queryLower = query().toLowerCase()

        return props.commands
            .filter(command => command.label.toLowerCase().includes(queryLower))
            .filter(command => command.isDisabled === undefined || !command.isDisabled(props.app))
    })

    const [ref, setRef] = createSignal<HTMLDivElement>()
    useClickOutside(ref, () => { props.app.state.setSelectedTool("select") })

    const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            props.app.state.setSelectedTool("select")
        }
    }
    onMount(() => document.addEventListener("keydown", handleEscape))
    onCleanup(() => document.removeEventListener("keydown", handleEscape))

    const handleInput: JSX.InputEventHandlerUnion<HTMLInputElement, InputEvent> = (event) => {
        setQuery(event.target.value)
        event.preventDefault()
        event.stopPropagation()
    }

    const handleCommandClick = (command: Command) => {
        props.app.state.setSelectedTool("select")
        command.execute(props.app)
    }

    return (
        <div class="command-palette" ref={setRef}>
            <div class="command-palette-search">
                <SearchIcon />
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
                        <li>
                            <button
                                class="command-palette-button"
                                onClick={() => handleCommandClick(command)}
                            >
                                <div class="command-palette-icon">
                                    <Show when={command.icon}>
                                        <Dynamic component={command.icon} />
                                    </Show>
                                </div>
                                {command.label}
                                <Show when={command.keybinds && command.keybinds[0]}>
                                    <div class="command-palette-keybind">
                                        {stringifyKeybind(command.keybinds![0])}
                                    </div>
                                </Show>
                            </button>
                        </li>
                    )}
                </For>
            </ul>
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
