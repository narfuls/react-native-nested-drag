import { ViewStyle, MeasureOnSuccessCallback, GestureResponderHandlers } from 'react-native'
import React, { useState, PropsWithChildren, useMemo, useCallback } from 'react'

import { DragHandleContext } from '../../DragContext'
import { IDragHandleContext } from '../../types'
import { ViewWithLayoutSubscription } from './ViewWithLayoutSubscription'

export interface IDragViewWithHandleAndMeasueProps {
  measureCallback: MeasureOnSuccessCallback
  style: ViewStyle
  panHandlers: GestureResponderHandlers
}

export function DragViewWithHandleAndMeasue({ children, style, panHandlers, measureCallback }: PropsWithChildren<IDragViewWithHandleAndMeasueProps>) {
  const [handleExists, setHandleExists] = useState(false)

  const ownPanHandlers = useMemo(
    // do not listen gests when there is a handle for it
    () => (handleExists ? {} : panHandlers),
    [handleExists, panHandlers],
  )

  const setHandle = useCallback(() => {
    setHandleExists(true)
  }, [])

  /** context for nested elements */
  const handleContext: IDragHandleContext = useMemo(() => {
    return {
      panHandlers: panHandlers,
      setHandleExists: setHandle,
    }
  }, [panHandlers, setHandle])

  return (
    <DragHandleContext.Provider value={handleContext}>
      <ViewWithLayoutSubscription {...ownPanHandlers} measureCallback={measureCallback} style={style}>
        {children}
      </ViewWithLayoutSubscription>
    </DragHandleContext.Provider>
  )
}
