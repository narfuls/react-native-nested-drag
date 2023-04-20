import { View, MeasureOnSuccessCallback } from 'react-native'
import React, { useRef, useState, useContext, PropsWithChildren, useEffect, useCallback } from 'react'

import { IDroppable, IDropViewProps, IPosition, ILayoutData } from '../types'
import { DragContext, DragCloneContext } from '../DragContext'
import { ViewWithLayoutSubscription } from './ViewWithLayoutSubscription'
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
  /** id from IDndEventManager */
  const dndId = useRef<number | undefined>(undefined)
  const [style, setStyle] = useState(styleProp)
  const layoutRef = useRef<ILayoutData>({ x: -1, y: -1, width: 0, height: 0 })

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

  const measureCallback = useCallback<MeasureOnSuccessCallback>(
    (_x, _y, width, height, pageX, pageY) => {
      layoutRef.current = { x: pageX, y: pageY, width: width, height: height }
      dndEventManager.updateDroppable(calcDroppable())
    },
    [calcDroppable, dndEventManager],
  )

  return (
    <ViewWithLayoutSubscription measureCallback={measureCallback} style={style}>
      {children}
    </ViewWithLayoutSubscription>
  )
}
