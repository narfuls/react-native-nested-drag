import { createContext } from 'react'
import { IDragContext, IDragHandleContext, IDragViewLayoutContext, IDragViewOffsetContext, zeroPoint } from './types'
import { DndEventManager } from './EventManager'

//reason to split context: dndEventManager is singleton but parents need to recreate contect and dependencies from dndEventManager trigger.
export const DragContext = createContext<IDragContext>({
  dndEventManager: new DndEventManager(),
  setClone: () => undefined,
})

export const DragHandleContext = createContext<IDragHandleContext>({
  setHandleExists: () => undefined,
  panHandlers: {},
})

export const DragViewLayoutContext = createContext<IDragViewLayoutContext>({
  parentOnLayout: undefined,
})

export const DragViewOffsetContext = createContext<IDragViewOffsetContext>({
  parentOffset: zeroPoint,
})
