import { Plugin, ResourceBuilder, Tool } from '../../api'
import { CommandPalette, CreateFrame, Pencil, Select } from './tools'
import { DeleteSelected, InvertSelection, ResetZoom, SelectAll, ZoomIn, ZoomOut, createSelectToolCommand } from './commands'
import { CanvasType, FrameType } from './nodes'

export const DefaultFeaturesPlugin: Plugin = {
  id: 'default_features',
  title: 'Default Features',
  initialize(builder: ResourceBuilder) {
    const defaultTools: Tool[] = [
      Select(),
      Pencil(),
      CreateFrame(),
      CommandPalette(),
    ]
    defaultTools.forEach(builder.addTool)

    defaultTools.map(createSelectToolCommand).forEach(builder.addCommand)
    builder.addCommand(SelectAll)
    builder.addCommand(InvertSelection)
    builder.addCommand(DeleteSelected)

    builder.addCommand(ZoomIn)
    builder.addCommand(ZoomOut)
    builder.addCommand(ResetZoom)

    builder.addNodeType('frame', FrameType)
    builder.addNodeType('canvas', CanvasType)
  }
}

export default DefaultFeaturesPlugin