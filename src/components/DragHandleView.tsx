import { Animated } from 'react-native'
import React, { useContext, PropsWithChildren, useEffect } from 'react'

import { DragContext } from '../DragContext'
import { IDragHandleViewProps } from '../types'

export function DragHandleView({ children, style = {} }: PropsWithChildren<IDragHandleViewProps>) {
  const { panHandlers, setHandleExists } = useContext(DragContext)
  useEffect(() => {
    setHandleExists && setHandleExists(true)
  }, [setHandleExists])
  return (
    <Animated.View style={style} {...panHandlers}>
      {children}
    </Animated.View>
  )
}
