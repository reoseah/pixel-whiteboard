import { Command, Plugin, ResourceBuilder, Tool } from '../../api'
import { actions, frame, select } from './tools'
import { deleteSelected, selectAll, selectToolCommand } from './commands'

export const DefaultFeaturesPlugin: Plugin = {
  id: 'default_features',
  title: 'Default Features',
  initialize(builder: ResourceBuilder) {
    const defaultTools: Tool[] = [
      select(),
      frame(),
      actions
    ]
    defaultTools.forEach(tool => {
      builder.addTool(tool)
      builder.addCommand(selectToolCommand(tool))
    })
    
    const defaultCommands: Command[] = [
      ...defaultTools.map(selectToolCommand),
      selectAll,
      deleteSelected
    ]
    defaultCommands.forEach(builder.addCommand)
  }
}

export default DefaultFeaturesPlugin