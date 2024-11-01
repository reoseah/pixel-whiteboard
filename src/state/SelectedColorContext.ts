import { makePersisted } from '@solid-primitives/storage'
import { Accessor, createContext, createSignal } from 'solid-js'

import { hexToRgb, hsvToRgb, normalizeHex, rgbToHex, rgbToHsv } from '../util/color_conversion'

export type SelectedColor = {
  hex: Accessor<string>
  rgb: Accessor<[number, number, number]>
  hsv: Accessor<[number, number, number]>
  alpha: Accessor<number>

  setRgbaNumber: (color: number) => void
  setHex: (hex: string) => void
  setRgb: (rgb: [number, number, number]) => void
  setHsv: (hsv: [number, number, number]) => void
  setAlpha: (alpha: number) => void
}

const SelectedColorContext = createContext<SelectedColor>(undefined as unknown as SelectedColor)

export default SelectedColorContext

export const createSelectedColor = (): SelectedColor => {
  const [hex, _setHex] = makePersisted(createSignal('#FFFFFF'), { name: 'color' })
  const [rgb, _setRgb] = createSignal(hexToRgb(hex()))
  const [hsv, _setHsv] = createSignal(rgbToHsv(rgb()))
  const [alpha, setAlpha] = makePersisted(createSignal(1), { name: 'alpha' })

  const setHex = (hex: string) => {
    const hasAlpha = hex.length > 7
    let safeHex = normalizeHex(hex)
    if (hasAlpha) {
      setAlpha(parseInt(safeHex.slice(7, 9), 16) / 255)
      safeHex = safeHex.slice(0, 7)
      _setHex(safeHex)
    }
    else {
      _setHex(hex)
    }
    _setRgb(hexToRgb(safeHex))
    _setHsv(rgbToHsv(hexToRgb(safeHex)))
  }

  const setRgbaNumber = (color: number) => {
    const r = (color >> 24) & 0xFF
    const g = (color >> 16) & 0xFF
    const b = (color >> 8) & 0xFF
    const a = (color & 0xFF) / 255

    _setRgb([r, g, b])
    _setHex(rgbToHex([r, g, b]))
    _setHsv(rgbToHsv([r, g, b]))
    setAlpha(a)
  }

  const setRgb = (rgb: [number, number, number]) => {
    _setRgb(rgb)
    _setHex(rgbToHex(rgb))
    _setHsv(rgbToHsv(rgb))
  }

  const setHsv = (hsv: [number, number, number]) => {
    _setHsv(hsv)
    _setRgb(hsvToRgb(hsv))
    _setHex(rgbToHex(hsvToRgb(hsv)))
  }

  return {
    hex,
    hsv,
    rgb,
    alpha,
    setRgbaNumber,
    setHex,
    setHsv,
    setRgb,
    setAlpha,
  }
}
