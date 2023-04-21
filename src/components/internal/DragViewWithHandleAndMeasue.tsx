import { ViewStyle, MeasureOnSuccessCallback, GestureResponderHandlers } from 'react-native'
import React, { useState, PropsWithChildren, useMemo, useCallback } from 'react'

import { DragHandleContext } from '../../DragContext'
import { IDragHandleContext } from '../../types'
import { ViewWithLayoutSubscription } from './ViewWithLayoutSubscription'

export interface IDragViewWithHandleAndMeasueProps {
  measureCallback: MeasureOnSuccessCallback
  style: ViewStyle
  disabled: boolean
  panHandlers: GestureResponderHandlers
}

export function DragViewWithHandleAndMeasue({
  children,
  style,
  panHandlers,
  measureCallback,
  disabled,
}: PropsWithChildren<IDragViewWithHandleAndMeasueProps>) {
  const [handleExists, setHandleExists] = useState(false)

  const panHandlersCtx = useMemo(() => (disabled ? {} : panHandlers), [panHandlers, disabled])

  const ownPanHandlers = useMemo(
    // do not listen gests when there is a handle for it
    () => (handleExists || disabled ? {} : panHandlers),
    [handleExists, panHandlers, disabled],
  )

  const setHandle = useCallback(() => {
    setHandleExists(true)
  }, [])

  /** context for nested elements */
  const handleContext: IDragHandleContext = useMemo(() => {
    return {
      panHandlers: panHandlersCtx,
      setHandleExists: setHandle,
    }
  }, [panHandlersCtx, setHandle])

  return (
    <DragHandleContext.Provider value={handleContext}>
      <ViewWithLayoutSubscription {...ownPanHandlers} measureCallback={measureCallback} style={style}>
        {children}
      </ViewWithLayoutSubscription>
    </DragHandleContext.Provider>
  )
}
