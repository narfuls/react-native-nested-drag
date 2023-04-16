import { View } from 'react-native'
import React, { useRef, useState, useContext, PropsWithChildren, useEffect } from 'react'

import { IDroppable, IDropViewProps, IPosition, IDragContext } from '../types'
import { DragContext } from '../DragContext'
import { SimplePubSub } from '../SimplePubSub'

const empty = {}
export function DropView({
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
  const ctx = useContext(DragContext)
  /** id from IDndEventManager */
  const dndId = useRef<number | undefined>(undefined)
  const [style, setStyle] = useState(styleProp)
  /** Subscribe to measure view (in nested view 'onLayout' event triggers only once when rendered first time)  */
  const onLayoutPubSub = useRef(new SimplePubSub()).current
  const droppableRef = useRef<IDroppable>()
  /** viewRef to measure */
  const view = useRef<View>(null)

  useEffect(() => {
    setStyle(styleProp)
  }, [styleProp])

  useEffect(() => {
    updateDroppable()
  }, [children, onOver, onDropProp, onEnterProp, onExitProp, styleProp, overStyle, payload])

  useEffect(() => {
    ctx.parentOnLayout && ctx.parentOnLayout.subscribe(onLayout)
    return () => {
      ctx.parentOnLayout && ctx.parentOnLayout.unsubscribe(onLayout)
    }
  }, [ctx.parentOnLayout])

  useEffect(() => {
    droppableRef.current = {
      id: dndId.current,
      layout: droppableRef.current ? droppableRef.current.layout : { x: -1, y: -1, width: 0, height: 0 },
      onDrop: onDrop,
      onEnter: onEnter,
      onExit: onExit,
      onOver: onOver,
      payload: payload,
    }
    if (dndId.current != undefined) {
      if (disabled) {
        ctx.dndEventManager.unregisterDroppable(dndId.current)
        dndId.current = undefined
      } else {
        ctx.dndEventManager.updateDroppable(droppableRef.current)
      }
    } else {
      if (!disabled) {
        dndId.current = ctx.dndEventManager.registerDroppable(droppableRef.current)
      }
    }
    return () => {
      dndId.current !== undefined && ctx.dndEventManager.unregisterDroppable(dndId.current)
    }
  }, [disabled])

  const updateDroppable = () => {
    //  dnd handlers should contain uptodate context
    if (droppableRef.current != undefined) {
      ctx.dndEventManager.updateDroppable({
        ...droppableRef.current,
        onDrop: onDrop,
        onEnter: onEnter,
        onExit: onExit,
        onOver: onOver,
        payload: payload,
      })
    }
  }

  const onEnter = (position: IPosition, payload?: any) => {
    overStyle && setStyle(overStyle)
    onEnterProp && onEnterProp(position, payload)
  }

  const onExit = (position: IPosition, payload?: any) => {
    overStyle && setStyle(styleProp)
    onExitProp && onExitProp(position, payload)
  }

  const onDrop = (position: IPosition, payload?: any, triggerNextDroppable?: () => void) => {
    overStyle && setStyle(styleProp)
    onDropProp && onDropProp(position, payload, triggerNextDroppable)
  }

  const onLayout = () => {
    if (view?.current) {
      view.current.measure((_x, _y, width, height, pageX, pageY) => {
        droppableRef.current = {
          id: dndId.current,
          layout: { x: pageX, y: pageY, width: width, height: height },
          onDrop: onDrop,
          onEnter: onEnter,
          onExit: onExit,
          onOver: onOver,
          payload: payload,
        }
        if (dndId.current != undefined) {
          ctx.dndEventManager.updateDroppable(droppableRef.current)
        }
      })
    }
    onLayoutPubSub.publish()
  }

  /** context for nested elements */
  const context: IDragContext = { ...ctx, parentOnLayout: onLayoutPubSub }

  return (
    <DragContext.Provider value={context}>
      <View ref={view} onLayout={onLayout} style={style}>
        {children}
      </View>
    </DragContext.Provider>
  )
}
