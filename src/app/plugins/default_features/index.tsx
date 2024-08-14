import { Plugin, ResourceBuilder } from '../../api'
import defaultTools from './tools'
import defaultCommands from './commands'

export const DefaultFeaturesPlugin: Plugin = {
  id: 'default_features',
  title: 'Default Features',
  initialize(builder: ResourceBuilder) {
    defaultTools.forEach(builder.addTool)
    defaultCommands.forEach(builder.addCommand)
  }
}

export default DefaultFeaturesPlugin