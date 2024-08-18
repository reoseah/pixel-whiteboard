import "./Toolbar.css"

import { createEffect, createSignal, For, JSX, Show } from "solid-js"
import { Dynamic } from "solid-js/web"
import { Tool } from "../api"
import { stringifyKeybind } from "../api-utils"

export function Toolbar(props: {
    tools: Tool[],
    selectedTool: Tool,
    onSelectTool: (id: Tool) => void
}) {
    const handleClick = (tool: Tool) => {
        props.onSelectTool(tool)
    }

    const [refs, setRefs] = createSignal<Record<string, HTMLButtonElement>>({})
    createEffect(() => {
        const selectedToolRef = refs()[props.selectedTool.id]
        if (selectedToolRef) {
            selectedToolRef.focus()
        }
    })

    return (
        <div class="toolbar">
            <h2 class="scr-only">Toolbar</h2>
            <div class="toolbar-layout">
                <For each={Object.values(props.tools)}>
                    {tool => (
                        <ToolbarButton
                            name={tool.id}
                            label={tool.label}
                            keyshortcuts={tool.keybinds && tool.keybinds.map(stringifyKeybind).join(", ")}
                            checked={props.selectedTool === tool}
                            onClick={() => handleClick(tool)}
                            ref={(el) => setRefs({ ...refs(), [tool.id]: el })}
                        >
                            <Dynamic component={tool.icon} selected={props.selectedTool === tool} />
                        </ToolbarButton>
                    )}
                </For>
            </div>
        </div>
    )
}

export default Toolbar

function ToolbarButton(props: {
    label: string,
    name: string,
    checked?: boolean,
    keyshortcuts?: string,
    cornerHint?: string,
    onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>,
    children?: JSX.Element,
    ref?: (el: HTMLButtonElement) => void
}) {
    const title = () => props.keyshortcuts ? `${props.label} — ${props.keyshortcuts}` : props.label

    return (
        <button
            class="toolbar-button"
            title={title()}
            aria-label={props.label}
            aria-keyshortcuts={props.keyshortcuts}
            aria-pressed={props.checked}
            onclick={props.onClick}
            ref={props.ref}
        >
            {props.children}
            <Show when={props.cornerHint}>
                <div class="toolbar-button-hint">
                    {props.cornerHint}
                </div>
            </Show>
        </button>
    )
}
