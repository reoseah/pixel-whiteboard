import { Accessor, onCleanup, onMount } from "solid-js"

export const useClickOutside = (ref: Accessor<HTMLElement | undefined>, callback: (e: Event) => void) => {
  const handleClick = (event: Event) => {
    const element = ref()
    if (!element || element.contains(event.target as Node)) {
      return
    }

    callback(event)
  }
  document.addEventListener('click', handleClick)
  onCleanup(() => document.removeEventListener('click', handleClick))
}

export default useClickOutside