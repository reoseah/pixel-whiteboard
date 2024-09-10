import "./ToggleButton.css"
import { JSXElement } from "solid-js"

export const ToggleButton = (props: {
  pressed: boolean
  onClick?: (event: MouseEvent) => void
  children: JSXElement
  class?: string
  disabled?: boolean
  tooltip?: string
  ref?: (el: HTMLButtonElement) => void
}) => {
  return (
    <button
      type="button"
      class={`toggle-button ${props.class ?? ''}`}
      disabled={props.disabled}
      title={props.tooltip}
      aria-pressed={props.pressed}
      onClick={props.onClick}
      ref={props.ref}
    >
      {props.children}
    </button>
  )
}

export default ToggleButton