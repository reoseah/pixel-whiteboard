import { Plugin, ResourceBuilder, Tool } from '../../api'
import { actions, frame, pencil, select } from './tools'
import { DeleteSelected, SelectAll, canvasTest, createSelectToolCommand } from './commands'
import { CanvasType, FrameType } from './nodes'

export const DefaultFeaturesPlugin: Plugin = {
  id: 'default_features',
  title: 'Default Features',
  initialize(builder: ResourceBuilder) {
    const defaultTools: Tool[] = [
      select(),
      frame(),
      actions(),
      pencil(),
    ]
    defaultTools.forEach(builder.addTool)

    defaultTools.map(createSelectToolCommand).forEach(builder.addCommand)
    builder.addCommand(SelectAll)
    builder.addCommand(DeleteSelected)
    builder.addCommand(canvasTest)

    builder.addNodeType('frame', FrameType)
    builder.addNodeType('canvas', CanvasType)
  }
}

export default DefaultFeaturesPlugin