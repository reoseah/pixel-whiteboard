import { Component } from "solid-js"
import { AppState } from "../app/App"

export type Command = {
    label: string,
    icon?: Component,
    // keywords?: string[],
    execute: (app: AppState) => void
}

export default Command;