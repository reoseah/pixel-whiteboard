export type Keybind = {
  key: string
  shift?: true
  ctrl?: true
  alt?: true
  // TODO: add support for macOS keys
}

export function stringifyKeybind(keybind: Keybind) {
  return `${keybind.ctrl ? "Ctrl+" : ""}${keybind.alt ? "Alt+" : ""}${keybind.shift ? "Shift+" : ""}${keybind.key}`
}