import { View, ViewProps } from 'react-native'
import React, { useContext, useEffect } from 'react'

import { DragHandleContext, DragCloneContext } from '../DragContext'

export function DragHandleView(props: ViewProps) {
  const cloned = useContext(DragCloneContext)
  if (cloned) return <View style={props.style}>{props.children}</View>
  return <DragHandleViewActual {...props} />
}

function DragHandleViewActual(props: ViewProps) {
  const { panHandlers, setHandleExists } = useContext(DragHandleContext)

  useEffect(() => {
    setHandleExists && setHandleExists()
  }, [setHandleExists])

  return <View {...props} {...panHandlers} />
}
