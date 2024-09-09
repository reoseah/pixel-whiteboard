import "./SubToolbar.css"
import { JSXElement } from "solid-js"

export const SubToolbar = (props: { children: JSXElement }) => {
    return (
        <div class="sub-toolbar">
            {props.children}
        </div>
    )
}

export default SubToolbar