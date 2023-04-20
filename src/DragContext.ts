import { createContext } from 'react'
import { IDragContext, IDragHandleContext, ISimplePubSub, IPosition, zeroPoint } from './types'
import { DndEventManager } from './EventManager'

//reason to split context: dndEventManager is singleton but parents need to recreate contect and dependencies from dndEventManager trigger.
export const DragContext = createContext<IDragContext>({
  dndEventManager: new DndEventManager(),
  setClone: () => undefined,
})

export const DragCloneContext = createContext<boolean>(false)

export const DragHandleContext = createContext<IDragHandleContext>({
  setHandleExists: () => undefined,
  panHandlers: {},
})

export const DragViewLayoutContext = createContext<ISimplePubSub | undefined>(undefined)

export const DragViewOffsetContext = createContext<IPosition>(zeroPoint)
