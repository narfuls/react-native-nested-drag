import { Animated, View } from 'react-native'
import React, { useContext, PropsWithChildren, useEffect } from 'react'

import { DragHandleContext, DragCloneContext } from '../DragContext'
import { IDragHandleViewProps } from '../types'

export function DragHandleView({ children, style = {} }: PropsWithChildren<IDragHandleViewProps>) {
  const cloned = useContext(DragCloneContext)
  if (cloned) return <View style={style}>{children}</View>
  return <DragHandleViewActual style={style}>{children}</DragHandleViewActual>
}

function DragHandleViewActual({ children, style = {} }: PropsWithChildren<IDragHandleViewProps>) {
  const { panHandlers, setHandleExists } = useContext(DragHandleContext)

  useEffect(() => {
    setHandleExists && setHandleExists()
  }, [setHandleExists])

  return (
    <Animated.View style={style} {...panHandlers}>
      {children}
    </Animated.View>
  )
}
