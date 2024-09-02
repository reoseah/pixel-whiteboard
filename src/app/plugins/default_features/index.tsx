import { Plugin, ResourceBuilder, Tool } from '../../api'
import { actions, frame, select } from './tools'
import { DeleteSelected, SelectAll, createSelectToolCommand } from './commands'
import { FrameType } from './nodes/frame'


export const DefaultFeaturesPlugin: Plugin = {
  id: 'default_features',
  title: 'Default Features',
  initialize(builder: ResourceBuilder) {
    const defaultTools: Tool[] = [
      select(),
      frame(),
      actions()
    ]
    defaultTools.forEach(builder.addTool)

    defaultTools.map(createSelectToolCommand).forEach(builder.addCommand)
    builder.addCommand(SelectAll)
    builder.addCommand(DeleteSelected)

    builder.addNodeType('frame', FrameType)
  }
}

export default DefaultFeaturesPlugin