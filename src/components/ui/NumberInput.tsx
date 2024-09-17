import './NumberInput.css'
import { Show, JSX, onCleanup } from 'solid-js'

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
  disabled?: boolean
}) => {
  let ref!: HTMLElement

  const handleClickOutside = (event: MouseEvent) => {
    if (!event.composedPath().includes(ref)) {
      ref.querySelector('input')?.blur()
    }
  }
  document.addEventListener('mousedown', handleClickOutside)
  onCleanup(() => {
    document.removeEventListener('mousedown', handleClickOutside)
  })

  return (
    <label
      class={`number-input-container ${props.class ?? ''}`}
      title={props.title}
      ref={el => ref = el}
    >
      <Show when={props.icon}>
        <div class="input-icon">
          {props.icon}
        </div>
      </Show>
      <input
        type="number"
        class="number-input"
        value={props.value}
        min={props.min}
        max={props.max}
        step={props.step}
        size={props.size}
        disabled={props.disabled}
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
        oninput={event => props.onChange(Number((event.target as HTMLInputElement).value))}
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