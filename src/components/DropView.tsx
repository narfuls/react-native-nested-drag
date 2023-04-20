import { View } from 'react-native'
import React, { useRef, useState, useContext, PropsWithChildren, useEffect, useCallback } from 'react'

import { IDroppable, IDropViewProps, IPosition, ILayoutData } from '../types'
import { DragContext, DragViewLayoutContext, DragCloneContext } from '../DragContext'
import { SimplePubSub } from '../SimplePubSub'
const empty = {}

export function DropView(props: PropsWithChildren<IDropViewProps>) {
  const cloned = useContext(DragCloneContext)
  if (cloned) return <View style={props.style}>{props.children}</View>
  return <DropViewActual {...props} />
}

function DropViewActual({
  children,
  payload,
  disabled = false,
  style: styleProp = empty,
  overStyle,
  onDrop: onDropProp,
  onEnter: onEnterProp,
  onExit: onExitProp,
  onOver,
}: PropsWithChildren<IDropViewProps>) {
  const { dndEventManager } = useContext(DragContext)
  const parentOnLayout = useContext(DragViewLayoutContext)
  /** id from IDndEventManager */
  const dndId = useRef<number | undefined>(undefined)
  const [style, setStyle] = useState(styleProp)
  /** Subscribe to measure view (in nested view 'onLayout' event triggers only once when rendered first time)  */
  const onLayoutPubSub = useRef(new SimplePubSub()).current
  const layoutRef = useRef<ILayoutData>({ x: -1, y: -1, width: 0, height: 0 })
  /** viewRef to measure */
  const view = useRef<View>(null)

  const onEnter = useCallback(
    (position: IPosition, payload?: any) => {
      overStyle && setStyle(overStyle)
      onEnterProp && onEnterProp(position, payload)
    },
    [overStyle, onEnterProp],
  )

  const onExit = useCallback(
    (position: IPosition, payload?: any) => {
      overStyle && setStyle(styleProp)
      onExitProp && onExitProp(position, payload)
    },
    [styleProp, overStyle, onExitProp],
  )

  const onDrop = useCallback(
    (position: IPosition, payload?: any, triggerNextDroppable?: () => void) => {
      overStyle && setStyle(styleProp)
      onDropProp && onDropProp(position, payload, triggerNextDroppable)
    },
    [styleProp, overStyle, onDropProp],
  )

  const calcDroppable = useCallback<() => IDroppable>(() => {
    return {
      id: dndId.current,
      layout: layoutRef.current,
      onDrop: onDrop,
      onEnter: onEnter,
      onExit: onExit,
      onOver: onOver,
      payload: payload,
    }
  }, [onOver, onDrop, onEnter, onExit, payload])

  const onLayout = useCallback(() => {
    if (view?.current) {
      view.current.measure((_x, _y, width, height, pageX, pageY) => {
        layoutRef.current = { x: pageX, y: pageY, width: width, height: height }
        dndEventManager.updateDroppable(calcDroppable())
      })
    }
    onLayoutPubSub.publish()
  }, [onLayoutPubSub, calcDroppable, dndEventManager])

  useEffect(() => {
    setStyle(styleProp)
  }, [styleProp])

  useEffect(() => {
    if (dndId.current != undefined) {
      if (disabled) {
        dndEventManager.unregisterDroppable(dndId.current)
        dndId.current = undefined
      } else {
        dndEventManager.updateDroppable(calcDroppable())
      }
    } else {
      if (!disabled) {
        dndId.current = dndEventManager.registerDroppable(calcDroppable())
      }
    }
    return () => {
      dndId.current !== undefined && dndEventManager.unregisterDroppable(dndId.current)
    }
  }, [disabled, calcDroppable, dndEventManager])

  useEffect(() => {
    parentOnLayout && parentOnLayout.subscribe(onLayout)
    return () => {
      parentOnLayout && parentOnLayout.unsubscribe(onLayout)
    }
  }, [parentOnLayout, onLayout])

  return (
    <DragViewLayoutContext.Provider value={onLayoutPubSub}>
      <View ref={view} onLayout={onLayout} style={style}>
        {children}
      </View>
    </DragViewLayoutContext.Provider>
  )
}
