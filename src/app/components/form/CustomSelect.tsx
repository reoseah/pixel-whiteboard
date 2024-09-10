import "./CustomSelect.css"
import { createSignal, onCleanup, Show, JSX } from "solid-js"
import { CheckIcon, ChevronDownIcon } from "./icons"

export const CustomSelect = (props: {
  value: string
  onChange: (value: string) => void
  children: JSX.Element | ((close: () => void) => JSX.Element)
  class?: string
  icon?: JSX.Element
}) => {
  const [expanded, setExpanded] = createSignal(false)

  let dropdownRef!: HTMLDivElement
  const handleClickOutside = (event: MouseEvent) => {
    if (expanded() && !dropdownRef.contains(event.target as Node)) {
      setExpanded(false)
    }
  }
  const handleKeyDown = (event: KeyboardEvent) => {
    if (expanded() && event.key === 'Escape') {
      setExpanded(false)
    }
  }

  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
  onCleanup(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <div
      class={`custom-select ${props.class ?? ''}`}
      ref={el => dropdownRef = el}
      aria-expanded={expanded()}
    >
      <div
        class="custom-select-inner"
        onClick={() => {
          setExpanded(!expanded())
        }}
      >
        <Show when={props.icon}>
          <div class="input-icon">
            {props.icon}
          </div>
        </Show>
        <span class="custom-select-value">{props.value}</span>
        <div class="custom-select-chevron">
          <ChevronDownIcon />
        </div>
      </div>
      <Show when={expanded()}>
        <div class="custom-select-options">
          <Show
            when={typeof props.children === 'function'}
            fallback={<>{props.children}</>}
          >
            {(props.children as (close: () => void) => JSX.Element)(() => setExpanded(false))}
          </Show>
        </div>
      </Show>
    </div>
  )
}

export const CustomOption = (props: {
  value: string
  selected: boolean
  onClick: () => void
  children: string
  disabled?: boolean
  title?: string
}) => {
  return (
    <button
      class={`custom-option`}
      onClick={props.onClick}
      disabled={props.disabled}
      title={props.title}
      aria-selected={props.selected}
    >
      <Show when={props.selected}>
        <div class="custom-option-check">
          <CheckIcon />
        </div>
      </Show>
      <div class="custom-option-label">
        {props.children}
      </div>
    </button>
  )
}

export const OptionDivider = () => {
  return (
    <div class="option-divider"></div>
  )
}