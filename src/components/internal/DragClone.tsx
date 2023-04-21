import { Animated } from 'react-native'
import React from 'react'

import { IDragCloneProps } from '../../types'

export function DragClone({ clone, providerOffset }: IDragCloneProps) {
  if (clone) {
    return (
      <Animated.View
        style={[
          { ...clone.style, transform: [{ translateX: clone.pan!.x }, { translateY: clone.pan!.y }] },
          {
            position: 'absolute',
            zIndex: 1,
            left: clone.position!.x + providerOffset.x,
            top: clone.position!.y + providerOffset.y,
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
