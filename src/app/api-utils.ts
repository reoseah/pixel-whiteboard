import { Keybind } from "./api";

export function stringifyKeybind(keybind: Keybind) {
    return `${keybind.ctrl ? "Ctrl+" : ""}${keybind.alt ? "Alt+" : ""}${keybind.shift ? "Shift+" : ""}${keybind.key}`
}
