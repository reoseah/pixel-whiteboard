import "./Toolbar.css"

import { For, JSX, Show } from "solid-js"
import { Dynamic } from "solid-js/web"
import { AppState } from "../App"
import { stringifyKeybind } from "../keybind"

export function Toolbar(props: {
    app: AppState
}) {
    const handleClick = (id: string) => {
        props.app.setSelectedTool(id)
    }

    return (
        <div class="toolbar">
            <h2 class="scr-only">Toolbar</h2>
            <div class="toolbar-layout">
                <For each={props.app.tools()}>
                    {(tool) => (
                        <ToolbarButton
                            name={tool.id}
                            label={tool.label}
                            keyshortcuts={tool.keybinds && tool.keybinds.map(stringifyKeybind).join(", ")}
                            checked={props.app.selectedTool === tool.id}
                            onClick={() => handleClick(tool.id)}
                        >
                            <Dynamic component={tool.icon} selected={props.app.selectedTool === tool.id} />
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
    children?: JSX.Element
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
