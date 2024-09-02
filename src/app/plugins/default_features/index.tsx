import { Command, Plugin, ResourceBuilder, Tool } from '../../api'
import { actions, frame, select } from './tools'
import { deleteSelected, selectAll, createSelectToolCommand } from './commands'

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

    const defaultCommands: Command[] = [
      ...defaultTools.map(createSelectToolCommand),
      selectAll,
      deleteSelected
    ]
    defaultCommands.forEach(builder.addCommand)
  }
}

export default DefaultFeaturesPlugin