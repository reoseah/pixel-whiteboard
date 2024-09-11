import { Show } from "solid-js"

export function CursorIcon(props: {
  filled?: boolean
}) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={props.filled ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
      <path d="M7.5 7.5L6.36924 13.1538C6.26869 13.6566 5.56675 13.7003 5.40461 13.2138L1.5 1.5L13.2138 5.40461C13.7003 5.56675 13.6566 6.26869 13.1538 6.36924L7.5 7.5ZM7.5 7.5L12.5 12.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}

export function FrameIcon() {
  return (
    <svg class="changing-svg-fix" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.5 4.5H14.5M0.5 12.5H14.5M3.5 15.5V1.5M11.5 1.5V15.5" stroke="currentColor" stroke-linecap="round" />
    </svg>
  )
}

export function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.5 3.5L1.5 10.5L0.5 15.5L5.5 14.5L12.5 7.5M8.5 3.5L10.2929 1.70711C10.6834 1.31658 11.3166 1.31658 11.7071 1.70711L14.2929 4.29289C14.6834 4.68342 14.6834 5.31658 14.2929 5.70711L12.5 7.5M8.5 3.5L12.5 7.5" stroke="currentColor" stroke-linejoin="round" />
    </svg>
  )
}

export function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" />
      <path d="M11.25 11.25L15.5 15.5" stroke="currentColor" stroke-linecap="round" />
    </svg>
  )
}

export function CommandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 3.5L7.5 8.5L2.5 13.5M7.5 13.5H14.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}

export function SelectionIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 4.5V2.5H3.5M6.5 2.5H8.5M11.5 2.5H13.5V4.5M13.5 7.5V9.5M13.5 12.5V14.5H11.5M8.5 14.5H6.5M3.5 14.5H1.5V12.5M1.5 9.5V7.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}

// export function SelectionCrosshairIcon() {
//   return (
//     <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
//       <circle cx="7.5" cy="7.5" r="0.5" fill="currentColor" />
//       <path d="M0.5 3.5V0.5H3.5M6.5 0.5H8.5M11.5 0.5H14.5V3.5M14.5 6.5V8.5M14.5 11.5V14.5H11.5M8.5 14.5H6.5M3.5 14.5H0.5V11.5M0.5 8.5V6.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
//       <path d="M10.5 7.50002C10.5 9.15687 9.15686 10.5 7.5 10.5M10.5 7.50002C10.5 5.84316 9.15686 4.50002 7.5 4.50002M10.5 7.50002L12.5 7.5M7.5 10.5C5.84315 10.5 4.5 9.15687 4.5 7.50002M7.5 10.5V12.5M4.5 7.50002C4.5 5.84316 5.84315 4.50002 7.5 4.50002M4.5 7.50002L2.5 7.5M7.5 4.50002V2.5" stroke="currentColor" stroke-linecap="round" />
//     </svg>
//   )
// }

export function LayersCrosshairIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 8L4 9.15385M1.5 11.5L8 14.5M12.5 5.7L14.3394 4.96424C14.7585 4.79661 14.7585 4.20339 14.3394 4.03576L8.37139 1.64856C8.13298 1.55319 7.86702 1.55319 7.62861 1.64856L1.6606 4.03576C1.24152 4.20339 1.24152 4.79661 1.66059 4.96424L6.5 6.9M13.5 10.5C13.5 12.1569 12.1569 13.5 10.5 13.5M13.5 10.5C13.5 8.84316 12.1569 7.50002 10.5 7.50002M13.5 10.5L15.5 10.5M10.5 13.5C8.84315 13.5 7.5 12.1569 7.5 10.5M10.5 13.5V15.5M7.5 10.5C7.5 8.84316 8.84315 7.50002 10.5 7.50002M7.5 10.5L5.5 10.5M10.5 7.50002V5.5" stroke="white" stroke-linecap="round" />
      <circle cx="10.5" cy="10.5" r="0.5" fill="currentColor" />
    </svg>
  )
}

export function AddSelectionIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 3.5V1.5H3.5M6.5 1.5H8.5M11.5 1.5H13.5V3.5M13.5 6.5V8.5M13.5 11.5V13.5H11.5M8.5 13.5H6.5M3.5 13.5H1.5V11.5M1.5 8.5V6.5M7.5 4.5V10.5M4.5 7.5H10.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}

export function DeleteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.5 6.5V10.5M9.5 6.5V10.5M2.5 3.5H13.5M3.5 3.5L4.40995 12.5995C4.46107 13.1107 4.89124 13.5 5.40499 13.5H10.595C11.1088 13.5 11.5389 13.1107 11.59 12.5995L12.5 3.5M5.5 3V3C5.5 2.17157 6.17157 1.5 7 1.5H9C9.82843 1.5 10.5 2.17157 10.5 3V3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}

export function ZoomInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7.5" cy="7.5" r="5" stroke="currentColor" />
      <path d="M11.25 11.25L14.5 14.5M5.5 7.5H9.5M7.5 5.5V9.5" stroke="currentColor" stroke-linecap="round" />
    </svg>
  )
}

export function ZoomOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7.5" cy="7.5" r="5" stroke="currentColor" />
      <path d="M11.25 11.25L14.5 14.5M5.5 7.5H9.5" stroke="currentColor" stroke-linecap="round" />
    </svg>
  )
}

export function ResetZoomIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7.5" cy="7.5" r="5" stroke="currentColor" />
      <path d="M11.25 11.25L14.5 14.5" stroke="currentColor" stroke-linecap="round" />
    </svg>
  )
}

export function CircleIcon(props: {
  filled?: boolean
}) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <Show
        when={props.filled}
        fallback={<circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" />}
      >
        <circle cx="8" cy="8" r="7" fill="currentColor" />
      </Show>
    </svg>
  )
}

export function SquareIcon(props: {
  filled?: boolean
}) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <Show
        when={props.filled}
        fallback={<rect x="2.5" y="2.5" width="11" height="11" rx="0.5" fill="none" stroke="currentColor" />}
      >
        <rect x="2" y="2" width="12" height="12" rx="1" fill="currentColor" />
      </Show>
    </svg>
  )
}

export function StrokeWidthIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 2.5H13.5M2.5 5.5V7.5H13.5V5.5H2.5ZM2.5 10.5V13.5H13.5V10.5H2.5Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}

export function DropIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 9.49919V9C2.5 7 5 4 7.5 1.5C10 4 12.5 7 12.5 9V9.49919C12.5 12.2606 10.2614 14.5 7.5 14.5C4.73858 14.5 2.5 12.2606 2.5 9.49919Z" stroke="currentColor" />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.5 8.5L6.29289 11.2929C6.68342 11.6834 7.31658 11.6834 7.70711 11.2929L14.5 4.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}

export function ChevronDownIcon() {
  return (
    <svg width="7" height="4" viewBox="0 0 7 4" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.5 0.5L3.5 3.5L6.5 0.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}
