import { Plugin, ResourceBuilder, Tool } from '../../api'
import { Actions, CreateFrame, Pencil, Select } from './tools'
import { DeleteSelected, ResetZoom, SelectAll, ZoomIn, ZoomOut, canvasTest, createSelectToolCommand } from './commands'
import { CanvasType, FrameType } from './nodes'

export const DefaultFeaturesPlugin: Plugin = {
  id: 'default_features',
  title: 'Default Features',
  initialize(builder: ResourceBuilder) {
    const defaultTools: Tool[] = [
      Select(),
      Pencil(),
      CreateFrame(),
      Actions(),
    ]
    defaultTools.forEach(builder.addTool)

    defaultTools.map(createSelectToolCommand).forEach(builder.addCommand)
    builder.addCommand(SelectAll)
    builder.addCommand(DeleteSelected)

    builder.addCommand(ZoomIn)
    builder.addCommand(ZoomOut)
    builder.addCommand(ResetZoom)

    builder.addCommand(canvasTest)

    builder.addNodeType('frame', FrameType)
    builder.addNodeType('canvas', CanvasType)
  }
}

export default DefaultFeaturesPlugin