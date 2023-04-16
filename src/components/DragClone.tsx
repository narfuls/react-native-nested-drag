import { Animated } from 'react-native'
import React, { useContext } from 'react'

import { IDragClone } from '../types'
import { DragContext } from '../DragContext'

export function DragClone({ clone }: { clone?: IDragClone }) {
  const ctx = useContext(DragContext)
  if (clone) {
    return (
      <Animated.View
        style={[
          { ...clone.style, transform: [{ translateX: clone.pan!.x }, { translateY: clone.pan!.y }] },
          {
            position: 'absolute',
            zIndex: 1,
            left: clone.position!.x + ctx.providerOffset.x,
            top: clone.position!.y + ctx.providerOffset.y,
            opacity: clone.opacity,
          },
        ]}
      >
        {clone.children}
      </Animated.View>
    )
  } else {
    return null
  }
}
