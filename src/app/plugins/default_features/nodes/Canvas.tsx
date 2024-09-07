import * as Y from "yjs"
import { Application, NodeType, RasterAction } from "../../../api"
import { CanvasComponent } from "../components/Canvas"

export type CanvasNode = {
    type: "canvas"
    children: never[]
}

export const CanvasType: NodeType<CanvasNode> = {
    render: CanvasComponent,
    addRasterAction: (_: CanvasNode, nodeId: string, action: RasterAction, app: Application) => {
        const actions = getOrCreateRasterActions(nodeId, app)
        actions.push([action])
    },
    replaceOrAddRasterAction: (_: CanvasNode, nodeId: string, previous: RasterAction, replacement: RasterAction, app: Application) => {
        const actions = getOrCreateRasterActions(nodeId, app)
        if (actions.get(actions.length - 1) === previous) {
            app.ydoc.transact(() => {
                actions.delete(actions.length - 1)
                actions.push([replacement])
            })
        } else {
            actions.push([replacement])
        }
    },
    onDelete: (_: CanvasNode, nodeId: string, app: Application) => {
        app.ydoc.transact(() => {
            app.ydoc.getMap<Y.Array<RasterAction>>("canvas-actions").delete(nodeId)
        })
    }
}

const getOrCreateRasterActions = (nodeId: string, app: Application) => {
    return app.ydoc.getMap<Y.Array<RasterAction>>("canvas-actions").get(nodeId)
        || app.ydoc.getMap<Y.Array<RasterAction>>("canvas-actions").set(nodeId, new Y.Array<RasterAction>())
}