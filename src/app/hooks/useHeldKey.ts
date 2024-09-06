import { createSignal, onCleanup } from "solid-js"

export const useHeldKey = (key: string): () => boolean => {
  const [held, setHeld] = createSignal(false)

  const handleKeydown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isEditable = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    if (isEditable) {
      return
    }

    if (e.key === key) {
      setHeld(true)
    }
  }
  const handleKeyup = (e: KeyboardEvent) => {
    if (e.key === key) {
      setHeld(false)
    }
  }
  document.addEventListener("keydown", handleKeydown)
  document.addEventListener("keyup", handleKeyup)
  onCleanup(() => {
    document.removeEventListener("keydown", handleKeydown)
    document.removeEventListener("keyup", handleKeyup)
  })

  return held
}

export default useHeldKey