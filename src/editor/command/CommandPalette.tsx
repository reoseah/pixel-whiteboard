import { Accessor, createEffect, createMemo, createSignal, For, JSX, onCleanup, Show } from "solid-js"
import { Dynamic } from "solid-js/web"
import { SearchIcon } from "../icons-16px"
import { AppState } from "../app/App"

import "./CommandPalette.css"
import Command from "./command"

export const CommandPalette = (props: { commands: Command[], app: AppState }) => {
    const [query, setQuery] = createSignal("")

    const filteredCommands = createMemo(() => {
        const queryLower = query().toLowerCase()
        return props.commands.filter(command => command.label.toLowerCase().includes(queryLower))
    })

    const [ref, setRef] = createSignal<HTMLDivElement>()
    useClickOutside(ref, () => { props.app.setSelectedTool("select") })

    createEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                props.app.setSelectedTool("select")
            }
        }
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape)
        }
    })

    const handleInput: JSX.InputEventHandlerUnion<HTMLInputElement, InputEvent> = (event) => {
        setQuery(event.target.value)
    }

    const handleCommandClick = (command: Command) => {
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
                        <li
                            class="command-palette-item"
                            onClick={() => handleCommandClick(command)}
                        >
                            <button>
                                <div class="command-palette-icon">
                                    <Show when={command.icon}>
                                        <Dynamic component={command.icon} />
                                    </Show>
                                </div>
                                {command.label}
                            </button>
                        </li>
                    )}
                </For>
            </ul>
        </div>
    )
}


const useClickOutside = (ref: Accessor<HTMLElement | undefined>, callback: (e: Event) => void) => {
    createEffect(() => {
        const listener = (event: Event) => {
            const element = ref()
            if (!element || element.contains(event.target as Node)) {
                return
            }

            callback(event)
        }
        document.addEventListener('click', listener)

        onCleanup(() => document.removeEventListener('click', listener))
    })
}
