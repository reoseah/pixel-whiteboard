export function Cursor(props: {
  filled?: boolean
}) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={props.filled ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
      <path d="M7.5 7.5L6.36924 13.1538C6.26869 13.6566 5.56675 13.7003 5.40461 13.2138L1.5 1.5L13.2138 5.40461C13.7003 5.56675 13.6566 6.26869 13.1538 6.36924L7.5 7.5ZM7.5 7.5L12.5 12.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}

export function Frame() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 4.5H14.5M1.5 11.5H14.5M4.5 14.5V1.5M11.5 1.5V14.5" stroke="currentColor" stroke-linecap="round" />
    </svg>
  )
}

export function Search() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" />
      <path d="M11.25 11.25L15.5 15.5" stroke="currentColor" stroke-linecap="round" />
    </svg>
  )
}

export function Command() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 3.5L7.5 8.5L2.5 13.5M7.5 13.5H14.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}