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

export function SelectionWithCrosshairIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7.5" cy="7.5" r="0.5" fill="currentColor" />
      <path d="M7.5 10C6.11929 10 5 8.88071 5 7.5M7.5 10C8.87311 10 9.98767 8.893 9.9999 7.52277M7.5 10V11.5M5 7.5C5 6.11929 6.11929 5 7.5 5M5 7.5H3.5M7.5 5C8.88071 5 10 6.11929 10 7.5C10 7.5076 9.99997 7.51519 9.9999 7.52277M7.5 5V3.5M9.9999 7.52277L11.5 7.5M0.5 3.5V1.5C0.5 0.947715 0.947715 0.5 1.5 0.5H3.5M6.5 0.5H8.5M11.5 0.5H13.5C14.0523 0.5 14.5 0.947715 14.5 1.5V3.5M14.5 6.5V8.5M14.5 11.5V13.5C14.5 14.0523 14.0523 14.5 13.5 14.5H11.5M8.5 14.5H6.5M3.5 14.5H1.5C0.947715 14.5 0.5 14.0523 0.5 13.5V11.5M0.5 8.5V6.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
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