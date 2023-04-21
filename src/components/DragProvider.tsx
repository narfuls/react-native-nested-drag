import { View, StyleSheet } from 'react-native'
import React, { useRef, useState, PropsWithChildren, useMemo } from 'react'

import { IDragContext, IDragClone, IPosition, IDragProviderProps, zeroPoint } from '../types'
import { DragContext, DragCloneContext } from '../DragContext'
import { DndEventManager } from '../EventManager'
import { DragClone } from './internal/DragClone'

export function DragProvider({ children, mockEventManager, overlapMode }: PropsWithChildren<IDragProviderProps>) {
  const eventManager = useRef(mockEventManager ? mockEventManager : new DndEventManager(overlapMode)).current
  const [clone, setClone] = useState<IDragClone>()
  const [windowOffset, setWindowOffset] = useState<IPosition>(zeroPoint)

  const lastCloneIdRef = useRef<number | undefined>()
  /** avoid disable clone when new drag have been started */
  const setCloneState = (c: IDragClone | undefined, dndId?: number) => {
    if (c) {
      lastCloneIdRef.current = c.draggableDndId
      setClone(c)
    } else if (lastCloneIdRef.current == dndId) {
      setClone(undefined)
    } //don't disable if new drag started
  }

  const context: IDragContext = useMemo(() => {
    return {
      dndEventManager: eventManager,
      setClone: setCloneState,
    }
  }, [eventManager])

  // measure provider offset
  const offsetMeasureView = useRef<View>(null)

  const onLayout = () => {
    offsetMeasureView.current &&
      offsetMeasureView.current.measure((_x, _y, _width, _height, pageX, pageY) => {
        if (pageX != -windowOffset.x || pageY != -windowOffset.y) {
          setWindowOffset({ x: -pageX, y: -pageY })
        }
      })
  }

  return (
    <DragContext.Provider value={context}>
      <View style={styles.container}>
        <View ref={offsetMeasureView} onLayout={onLayout} />
        {children}
        <DragCloneContext.Provider value={true}>
          <DragClone clone={clone} providerOffset={windowOffset} />
        </DragCloneContext.Provider>
      </View>
    </DragContext.Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
})
