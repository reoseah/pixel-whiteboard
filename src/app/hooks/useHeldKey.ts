import { createSignal, onCleanup } from "solid-js"

export const useHeldKey = (key: string): () => boolean => {
  const [held, setHeld] = createSignal(false)
  
  const handleKeydown = (e: KeyboardEvent) => {
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