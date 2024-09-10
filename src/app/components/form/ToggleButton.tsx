import "./ToggleButton.css"
import { JSXElement } from "solid-js"

export const ToggleButton = (props: {
  pressed: boolean
  onClick?: (event: MouseEvent) => void
  children: JSXElement
  class?: string
  disabled?: boolean
  title?: string
  ref?: (el: HTMLButtonElement) => void
}) => {
  return (
    <button
      type="button"
      class={`toggle-button ${props.class ?? ''}`}
      disabled={props.disabled}
      title={props.title}
      aria-pressed={props.pressed}
      onclick={props.onClick}
      ref={props.ref}
    >
      {props.children}
    </button>
  )
}

export default ToggleButton