import "./InputGroup.css"

import { JSX } from "solid-js"

export const InputGroup = (props: {
  children: JSX.Element
}) => {
  return (
    <div class="input-group">
      {props.children}
    </div>
  )
}

export default InputGroup
