import { Animated, View, ViewStyle, PanResponder, Vibration } from 'react-native'
import React, { useRef, useState, useContext, PropsWithChildren, useEffect, useMemo } from 'react'

import { DragContext } from '../DragContext'
import { IDragViewProps, IDraggable, IPosition, IDragContext, zeroPoint } from '../'
import { SimplePubSub } from '../SimplePubSub'

/* offsets:
1) provider: between clone and provider only
2) movable: 
  - sets on dragEnd as pan change
4) parent: should be set for children via ctx as parent + movable
  - sets on dragEnd and ctx change
*/
const empty = {}
const animEndOptions = { overshootClamping: true }

export function DragView({
  children,
  payload,
  style: styleProp = empty,
  dragStyle,
  overStyle,
  copyDragStyle,
  copyOverStyle,
  disabled = false,
  longPressDelay = 0,
  vibroDuration = 0,
  movable = false,
  movableOffset = zeroPoint,
  onDragStart: onDragStartProp,
  onDrag,
  onEnter: onEnterProp,
  onOver,
  onExit: onExitProp,
  onDragEnd: onDragEndProp,
  onDrop: onDropProp,
  animationEndOptions = animEndOptions,
  animationDropOptions = empty,
}: PropsWithChildren<IDragViewProps>) {
  const ctx = useContext(DragContext)

  const [style, setStyle] = useState(styleProp)
  const [handleExists, setHandleExists] = useState(false)
  const [panResponder, setPanResponder] = useState(PanResponder.create({}))
  const [fadeAnim] = useState(new Animated.Value(1))

  const pan = useRef(new Animated.ValueXY()).current
  const defaultStyleRef = useRef(styleProp)
  /** unlike pan updates only on movable dragend */
  const movedOffset = useRef<IPosition>(movableOffset)
  const parentOffsetRef = useRef<IPosition>(ctx.parentOffset)
  /** id from IDndEventManager */
  const dndId = useRef<number | undefined>(undefined)
  /** Subscribe to measure view (in nested view 'onLayout' event triggers only once when rendered first time)  */
  const onLayoutPubSub = useRef(new SimplePubSub()).current
  /** viewRef to measure */
  const view = useRef<View>(null)
  /** initial absolutePos ? ? ? (if you wondered why append and then distract parentOffsetRef.
   * Coz absolutePos updates only inside 'measure' and parentOffsetRef may change while measure not triggered.
   * So it contains parent movedOffset) */
  const absolutePos = useRef<IPosition>(zeroPoint)

  const panHandlers = useMemo(() => (disabled ? {} : panResponder.panHandlers), [panResponder, disabled])

  const ownPanHandlers = useMemo(
    // do not listen gests when there is a handle for it
    () => (handleExists || disabled ? {} : panResponder.panHandlers),
    [handleExists, panResponder, disabled],
  )

  /** context for nested elements */
  const context: IDragContext = useMemo(() => {
    parentOffsetRef.current = {
      x: ctx.parentOffset.x,
      y: ctx.parentOffset.y,
    }
    setDndEventManagerDraggable && setDndEventManagerDraggable()
    return {
      ...ctx,
      parentOffset: {
        x: ctx.parentOffset.x - movedOffset.current.x,
        y: ctx.parentOffset.y - movedOffset.current.y,
      },
      panHandlers: panHandlers,
      setHandleExists: setHandleExists,
      parentOnLayout: onLayoutPubSub,
    }
  }, [ctx, panHandlers, movedOffset.current, onLayoutPubSub])

  useEffect(() => {
    setDefaultStyle()
  }, [styleProp])

  useEffect(() => {
    movedOffset.current = movableOffset
    pan.setOffset(movableOffset)
    setDefaultStyle()
  }, [movableOffset])

  /* for subscribtions */
  useEffect(() => {
    if (ctx.parentOnLayout) {
      ctx.parentOnLayout.subscribe(onLayout)
      return () => {
        ctx.parentOnLayout && ctx.parentOnLayout.unsubscribe(onLayout)
        dndId.current !== undefined && ctx.dndEventManager.unregisterDraggable(dndId.current)
      }
    } else {
      return () => {
        dndId.current !== undefined && ctx.dndEventManager.unregisterDraggable(dndId.current)
      }
    }
  }, [])

  /* create and refresh panHandlers */
  useEffect(() => {
    let onLongPressTimeout: NodeJS.Timeout
    let shouldDrag = false
    setPanResponder(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => false,
        onPanResponderGrant: (_evt, gestureState) => {
          onLongPressTimeout = setTimeout(() => {
            dndId.current !== undefined && ctx.dndEventManager.handleDragStart(dndId.current, { x: gestureState.moveX, y: gestureState.moveY })
            shouldDrag = true
            vibroDuration > 0 && Vibration.vibrate(vibroDuration)
          }, longPressDelay)
        },
        onPanResponderMove: (evt, gestureState) => {
          if (shouldDrag) {
            dndId.current !== undefined && ctx.dndEventManager.handleDragMove(dndId.current, { x: gestureState.moveX, y: gestureState.moveY })
            Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(evt, gestureState)
          } else {
            Math.abs(gestureState.dx) + Math.abs(gestureState.dy) > 10 && clearTimeout(onLongPressTimeout)
          }
        },
        onPanResponderRelease: (_evt, gestureState) => {
          shouldDrag &&
            dndId.current !== undefined &&
            ctx.dndEventManager.handleDragEnd(dndId.current, { x: gestureState.moveX, y: gestureState.moveY })
          shouldDrag = false
          clearTimeout(onLongPressTimeout)
        },
        onPanResponderTerminate: (_evt, gestureState) => {
          shouldDrag &&
            dndId.current !== undefined &&
            ctx.dndEventManager.handleDragEnd(dndId.current, { x: gestureState.moveX, y: gestureState.moveY })
          shouldDrag = false
          clearTimeout(onLongPressTimeout)
        },
        onShouldBlockNativeResponder: () => false,
        onPanResponderTerminationRequest: () => true,
      }),
    )
  }, [longPressDelay, vibroDuration])

  const setDndEventManagerDraggable = () => {
    //  dnd handlers should contain uptodate context
    const draggable: IDraggable = {
      id: dndId.current,
      onDragStart: onDragStart,
      onDrag: onDrag,
      onDragEnd: onDragEnd,
      onDrop: onDrop,
      onEnter: onEnter,
      onExit: onExit,
      onOver: onOver,
      payload: payload,
    }
    if (dndId.current != undefined) {
      ctx.dndEventManager.updateDraggable(draggable)
    } else {
      dndId.current = ctx.dndEventManager.registerDraggable(draggable)
    }
  }

  //#region refresh draggable storred in IDndEventManager
  /* (it's important cos manager may call event whith old(irrelevant) context)*/
  useEffect(() => {
    setDndEventManagerDraggable()
  }, [children, payload, onDrag, onOver, styleProp, dragStyle, overStyle, copyDragStyle, copyOverStyle])

  //#endregion

  const setDefaultStyle = () => {
    defaultStyleRef.current = {
      ...styleProp,
      transform: [{ translateX: movedOffset.current.x }, { translateY: movedOffset.current.y }],
    }
    setStyle(defaultStyleRef.current)
  }

  /** update clone
   *  @param exists bool  set or remove @default false
   * so setClone() sets undefined
   * setClone(true) sets clone with default style*/
  const setClone = (exists = false, styleParam?: ViewStyle) => {
    if (!exists) {
      ctx.setClone(undefined, dndId.current)
    } else {
      dndId.current !== undefined &&
        ctx.setClone({
          draggableDndId: dndId.current,
          style: styleParam ? styleParam : copyDragStyle ? copyDragStyle : defaultStyleRef.current,
          pan: pan,
          position: {
            x: absolutePos.current.x - parentOffsetRef.current.x,
            y: absolutePos.current.y - parentOffsetRef.current.y,
          },
          opacity: fadeAnim,
          children: children,
        })
    }
  }

  //#region dnd events
  const onEnter = (position: IPosition, payload: any) => {
    overStyle && setStyle(overStyle)
    copyOverStyle && setClone(true, copyOverStyle)
    onEnterProp && onEnterProp(position, payload)
  }

  const onExit = (position: IPosition, payload: any) => {
    overStyle && setStyle(dragStyle ? dragStyle : styleProp)
    copyOverStyle && setClone(true)
    onExitProp && onExitProp(position, payload)
  }

  const onDragStart = (position: IPosition) => {
    if (movable) {
      setStyle({ ...styleProp, opacity: 0 })
    } else {
      dragStyle && setStyle(dragStyle)
      fadeAnim.stopAnimation()
      pan.stopAnimation()
    }
    setClone(true)
    onDragStartProp && onDragStartProp(position)
  }

  const onDragEnd = (position: IPosition) => {
    if (movable) {
      movableDragEnd()
    } else {
      bounce()
    }
    setDefaultStyle()
    onDragEndProp && onDragEndProp(position, movedOffset.current)
  }

  const onDrop = (position: IPosition, _movedOffset: any, payload: any) => {
    if (movable) {
      movableDragEnd()
    } else {
      fadeOut()
    }
    setDefaultStyle()
    onDropProp && onDropProp(position, movedOffset.current, payload)
  }
  //#endregion

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      ...animationDropOptions,
      toValue: 0,
      useNativeDriver: true,
    }).start(() => {
      pan.setValue(zeroPoint) // remove flashing on second drag
      fadeAnim.setValue(1)
      setDndEventManagerDraggable()
      setClone()
    })
  }

  const bounce = () => {
    Animated.spring(pan, {
      ...animationEndOptions,
      toValue: zeroPoint,
      useNativeDriver: true,
    }).start(() => {
      setClone()
    })
  }

  const movableDragEnd = () => {
    pan.extractOffset()
    movedOffset.current = {
      x: Number(JSON.stringify(pan.x)),
      y: Number(JSON.stringify(pan.y)),
    }
    setClone()
  }

  //measore component
  const onLayout = () => {
    if (view?.current) {
      view.current.measure((_x, _y, _width, _height, pageX, pageY) => {
        absolutePos.current = {
          x: pageX + parentOffsetRef.current.x - movedOffset.current.x,
          y: pageY + parentOffsetRef.current.y - movedOffset.current.y,
        }
        setDndEventManagerDraggable()
      })
    }
    onLayoutPubSub.publish()
  }

  return (
    <DragContext.Provider value={context}>
      <View {...ownPanHandlers} onLayout={onLayout} ref={view} style={style}>
        {children}
      </View>
    </DragContext.Provider>
  )
}
