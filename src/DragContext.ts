import { createContext } from 'react'
import { IDragContext, zeroPoint } from './types'
import { DndEventManager } from './EventManager'

export const DragContext = createContext<IDragContext>({
  setHandleExists: () => undefined,
  panHandlers: {},
  dndEventManager: new DndEventManager(),
  parentOnLayout: undefined,
  setClone: () => undefined,
  providerOffset: zeroPoint,
  parentOffset: zeroPoint,
})
