import { FrameNode, NodeType } from "../../../api"
import { Frame } from '../components/Frame'

export const FrameType: NodeType<FrameNode> = {
  render: Frame
}