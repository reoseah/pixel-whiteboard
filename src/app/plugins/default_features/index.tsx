import { reconcile } from 'solid-js/store'
import { Plugin, ResourceBuilder, Tool } from '../../api'
import { CommandIcon, CursorIcon, FrameIcon } from './icons'

export default function DefaultFeaturesPlugin(): Plugin {
    return {
        id: 'default_features',
        title: 'Default Features',
        initialize(builder: ResourceBuilder) {
            tools.forEach(tool => {
                builder.addTool(tool)
                builder.addCommand({
                    label: `Toolbar: ${tool.label}`,
                    keybinds: tool.keybinds,
                    icon: () => tool.icon({ selected: false }),
                    isDisabled: app => {
                        console.log(app)
                        return app.state.selectedTool() === tool.id},
                    execute: app => app.state.setSelectedTool(tool.id)
                })
            })
            builder.addCommand({
                label: "Clear workspace",
                keybinds: [{ key: "Delete", ctrl: true }],
                execute: (app) => {
                    if (confirm("Are you sure you want to clear the workspace?")) {
                        app.project.setNodes(reconcile({}))
                        app.project.setSelectedNodes([])
                    }
                }
            })
        }
    }
}

const tools: Tool[] = [
    {
        id: "select",
        label: "Select\u2009/\u2009Move",
        icon: props => (<CursorIcon filled={props.selected} />),
        keybinds: [{ key: "V" }],
    },
    {
        id: "frame",
        label: "Frame",
        icon: FrameIcon,
        keybinds: [{ key: "F" }],
    },
    {
        id: "actions",
        label: "Actions",
        icon: CommandIcon,
        keybinds: [{ key: "K", ctrl: true }],
    }
]
