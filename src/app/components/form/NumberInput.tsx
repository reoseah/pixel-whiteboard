import './NumberInput.css'
import { Show, JSX } from 'solid-js'

export const NumberInput = (props: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  size?: number
  class?: string
  icon?: JSX.Element
  unit?: JSX.Element
  title?: string
}) => {
  return (
    <label
      class="number-input-container"
      title={props.title}
    >
      <Show when={props.icon}>
        <div class="input-icon">
          {props.icon}
        </div>
      </Show>
      <input
        type="number"
        class={`number-input ${props.class ?? ''}`}
        value={props.value}
        min={props.min}
        max={props.max}
        step={props.step}
        size={props.size}
        onclick={event => (event.target as HTMLInputElement).select()}
        onkeydown={event => {
          if (event.key === 'Enter' || event.key === 'Escape') {
            (event.target as HTMLInputElement).blur();
          }
        }}
        onfocus={event => {
          const handleClickOutside = (event: MouseEvent) => {
            if (!event.composedPath().includes(event.target!)) {
              (event.target as HTMLInputElement).blur();
            }
          }
          document.addEventListener('click', handleClickOutside)
          event.target?.addEventListener('blur', () => {
            document.removeEventListener('click', handleClickOutside)
          }, { once: true })
        }}
        onchange={event => props.onChange(Number((event.target as HTMLInputElement).value))}
      />
      <Show when={props.unit}>
        <div class="number-input-unit">
          {props.unit}
        </div>
      </Show>
    </label>
  )
}

export default NumberInput