import { Accessor, createContext, createSignal } from 'solid-js'
import * as Y from 'yjs'

import { WhiteboardElement } from '../types/whiteboard'
import { Registry } from './RegistryContext'

export type WhiteboardElements = {
  elements: Y.Map<WhiteboardElement>

  set: (id: string, element: WhiteboardElement) => void
  remove: (id: string) => void
  clear: () => void

  editingTitle: Accessor<null | string>
  setEditingTitle: (id: null | string) => void

  selected: Accessor<string[]>
  select: (ids: string[]) => void
}

const WhiteboardElementsContext = createContext<WhiteboardElements>(undefined as unknown as WhiteboardElements)

export default WhiteboardElementsContext

export const createWhiteboardElements = (ydoc: Y.Doc): WhiteboardElements => {
  const elements = ydoc.getMap<WhiteboardElement>('board-elements')

  const [selected, setSelected] = createSignal<string[]>([])
  const [editingTitle, setEditingTitle] = createSignal<null | string>(null)

  const set = (id: string, entity: WhiteboardElement) => {
    elements.set(id, entity)
  }

  const remove = (id: string) => {
    elements.delete(id)
  }

  const select = (ids: string[]) => {
    setSelected(ids)
  }

  const clear = () => {
    elements.clear()
  }

  return {
    elements,
    set,
    remove,
    clear,
    editingTitle,
    setEditingTitle,
    selected,
    select,
  }
}

export const getElementsInside = (whiteboard: WhiteboardElements, elementTypes: Registry['elementTypes'], x: number, y: number, width: number, height: number) => {
  const output: string[] = []
  for (const [id, element] of whiteboard.elements) {
    const bounds = elementTypes[element.type].getBounds(element)
    if (bounds.x >= x && bounds.y >= y && bounds.x + bounds.width <= x + width && bounds.y + bounds.height <= y + height) {
      output.push(id)
    }
  }
  return output
}
