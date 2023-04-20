import { Animated, View, ViewStyle, PanResponder, Vibration, MeasureOnSuccessCallback } from 'react-native'
import React, { useRef, useState, useContext, PropsWithChildren, useEffect, useMemo, useCallback } from 'react'

import { DragContext, DragHandleContext, DragViewLayoutContext, DragViewOffsetContext, DragCloneContext } from '../DragContext'
import { IDragViewProps, IDraggable, IPosition, IDragHandleContext, zeroPoint } from '../types'
import { useOnLayoutWithSubscription } from '../hooks/useOnLayoutWithSubscription'
const empty = {}
const animEndOptions = { overshootClamping: true }

/* offsets:
1) provider: between clone and provider only
2) movable: 
  - sets on dragEnd as pan change
4) parent: should be set for children via ctx as parent + movable
  - sets on dragEnd and ctx change
*/

export function DragView(props: PropsWithChildren<IDragViewProps>) {
  const cloned = useContext(DragCloneContext)
  if (cloned) {
    return (
      <View
        style={{
          ...props.style,
          transform: [
            { translateX: props.movableOffset ? props.movableOffset.x : 0 },
            { translateY: props.movableOffset ? props.movableOffset.y : 0 },
          ],
        }}
      >
        {props.children}
      </View>
    )
  }
  return <DragViewActual {...props} />
}

function DragViewActual({
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
  const { dndEventManager, setClone: ctxSetClone } = useContext(DragContext)
  const parentOffset = useContext(DragViewOffsetContext)

  const [style, setStyle] = useState(styleProp)
  const [handleExists, setHandleExists] = useState(false)
  const [panResponder, setPanResponder] = useState(PanResponder.create({}))
  const [fadeAnim] = useState(new Animated.Value(1))

  const pan = useRef(new Animated.ValueXY()).current
  const defaultStyleRef = useRef(styleProp)
  /** unlike pan updates only on movable dragend */
  const movedOffset = useRef<IPosition>(movableOffset)
  const parentOffsetRef = useRef<IPosition>(parentOffset)
  /** id from IDndEventManager */
  const dndId = useRef<number | undefined>(undefined)
  /** initial absolutePos * * (if you wondered why append and then distract parentOffsetRef ?
   * Coz absolutePos updates only inside 'measure' and parentOffsetRef may change while measure not triggered.
   * So it contains parent movedOffset) */
  const absolutePos = useRef<IPosition>(zeroPoint)

  const panHandlers = useMemo(() => (disabled ? {} : panResponder.panHandlers), [panResponder, disabled])

  const ownPanHandlers = useMemo(
    // do not listen gests when there is a handle for it
    () => (handleExists || disabled ? {} : panResponder.panHandlers),
    [handleExists, panResponder, disabled],
  )

  const setHandle = useCallback(() => {
    setHandleExists(true)
  }, [])

  /** context for nested elements */
  const handleContext: IDragHandleContext = useMemo(() => {
    return {
      panHandlers: panHandlers,
      setHandleExists: setHandle,
    }
  }, [panHandlers, setHandle])

  const setDefaultStyle = useCallback(() => {
    defaultStyleRef.current = {
      ...styleProp,
      transform: [{ translateX: movedOffset.current.x }, { translateY: movedOffset.current.y }],
    }
    setStyle(defaultStyleRef.current)
  }, [styleProp])

  /** update clone
   *  @param exists bool  set or remove @default false
   * so setClone() sets undefined
   * setClone(true) sets clone with default style*/
  const setClone = useCallback(
    (exists = false, styleParam?: ViewStyle) => {
      if (!exists) {
        ctxSetClone(undefined, dndId.current)
      } else {
        dndId.current !== undefined &&
          ctxSetClone({
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
    },
    [children, copyDragStyle, ctxSetClone, fadeAnim, pan],
  )

  const bounce = useCallback(() => {
    Animated.spring(pan, {
      ...animationEndOptions,
      toValue: zeroPoint,
      useNativeDriver: true,
    }).start(() => {
      setClone()
    })
  }, [setClone, animationEndOptions, pan])

  const movableDragEnd = useCallback(() => {
    pan.extractOffset()
    movedOffset.current = {
      x: Number(JSON.stringify(pan.x)),
      y: Number(JSON.stringify(pan.y)),
    }
    setClone()
  }, [setClone, pan])

  const onEnter = useCallback(
    (position: IPosition, payload: any) => {
      overStyle && setStyle(overStyle)
      copyOverStyle && setClone(true, copyOverStyle)
      onEnterProp && onEnterProp(position, payload)
    },
    [onEnterProp, copyOverStyle, overStyle, setClone],
  )

  const onExit = useCallback(
    (position: IPosition, payload: any) => {
      overStyle && setStyle(dragStyle ? dragStyle : styleProp)
      copyOverStyle && setClone(true)
      onExitProp && onExitProp(position, payload)
    },
    [onExitProp, copyOverStyle, dragStyle, overStyle, setClone, styleProp],
  )

  const onDragStart = useCallback(
    (position: IPosition) => {
      if (movable) {
        setStyle({ ...styleProp, opacity: 0 })
      } else {
        dragStyle && setStyle(dragStyle)
        fadeAnim.stopAnimation()
        pan.stopAnimation()
      }
      setClone(true)
      onDragStartProp && onDragStartProp(position)
    },
    [onDragStartProp, dragStyle, fadeAnim, movable, pan, setClone, styleProp],
  )

  const onDragEnd = useCallback(
    (position: IPosition) => {
      if (movable) {
        movableDragEnd()
      } else {
        bounce()
      }
      setDefaultStyle()
      onDragEndProp && onDragEndProp(position, movedOffset.current)
    },
    [onDragEndProp, bounce, movable, movableDragEnd, setDefaultStyle],
  )

  const onDrop: (position: IPosition, _movedOffset: any, payload: any) => void = useCallback(
    (position: IPosition, _movedOffset: any, payload: any) => {
      if (movable) {
        movableDragEnd()
      } else {
        fadeOut()
      }
      setDefaultStyle()
      onDropProp && onDropProp(position, movedOffset.current, payload)
    },
    [movable, movableDragEnd, setDefaultStyle, onDropProp],
  )

  const setDndEventManagerDraggable = useCallback(() => {
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
      dndEventManager.updateDraggable(draggable)
    } else {
      dndId.current = dndEventManager.registerDraggable(draggable)
    }
  }, [payload, onDrag, onOver, dndEventManager, onDragEnd, onDragStart, onDrop, onEnter, onExit])
  const fadeOut = useCallback(() => {
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
  }, [setClone, animationDropOptions, fadeAnim, pan, setDndEventManagerDraggable])
  const offsetContext: IPosition = useMemo(() => {
    parentOffsetRef.current = {
      x: parentOffset.x,
      y: parentOffset.y,
    }
    setDndEventManagerDraggable && setDndEventManagerDraggable()
    return {
      x: parentOffset.x - movedOffset.current.x,
      y: parentOffset.y - movedOffset.current.y,
    }
  }, [parentOffset, movedOffset.current, setDndEventManagerDraggable])

  //#region refresh draggable storred in IDndEventManager
  /* (it's important cos manager may call event whith old(irrelevant) context)*/
  useEffect(() => {
    setDndEventManagerDraggable()
  }, [setDndEventManagerDraggable])

  useEffect(() => {
    setDefaultStyle()
  }, [setDefaultStyle])

  useEffect(() => {
    movedOffset.current = movableOffset
    pan.setOffset(movableOffset)
    setDefaultStyle()
  }, [movableOffset, pan, setDefaultStyle])

  /* for subscribtions */
  useEffect(() => {
    return () => {
      dndId.current !== undefined && dndEventManager.unregisterDraggable(dndId.current)
    }
  }, [dndEventManager])

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
            dndId.current !== undefined && dndEventManager.handleDragStart(dndId.current, { x: gestureState.moveX, y: gestureState.moveY })
            shouldDrag = true
            vibroDuration > 0 && Vibration.vibrate(vibroDuration)
          }, longPressDelay)
        },
        onPanResponderMove: (evt, gestureState) => {
          if (shouldDrag) {
            dndId.current !== undefined && dndEventManager.handleDragMove(dndId.current, { x: gestureState.moveX, y: gestureState.moveY })
            Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(evt, gestureState)
          } else {
            Math.abs(gestureState.dx) + Math.abs(gestureState.dy) > 10 && clearTimeout(onLongPressTimeout)
          }
        },
        onPanResponderRelease: (_evt, gestureState) => {
          shouldDrag && dndId.current !== undefined && dndEventManager.handleDragEnd(dndId.current, { x: gestureState.moveX, y: gestureState.moveY })
          shouldDrag = false
          clearTimeout(onLongPressTimeout)
        },
        onPanResponderTerminate: (_evt, gestureState) => {
          shouldDrag && dndId.current !== undefined && dndEventManager.handleDragEnd(dndId.current, { x: gestureState.moveX, y: gestureState.moveY })
          shouldDrag = false
          clearTimeout(onLongPressTimeout)
        },
        onShouldBlockNativeResponder: () => false,
        onPanResponderTerminationRequest: () => true,
      }),
    )
  }, [longPressDelay, vibroDuration, pan, dndEventManager])
  //#endregion

  const measureCallback = useCallback<MeasureOnSuccessCallback>(
    (_x, _y, _width, _height, pageX, pageY) => {
      absolutePos.current = {
        x: pageX + parentOffsetRef.current.x - movedOffset.current.x,
        y: pageY + parentOffsetRef.current.y - movedOffset.current.y,
      }
      setDndEventManagerDraggable()
    },
    [setDndEventManagerDraggable],
  )

  const { onLayout, onLayoutPubSub, viewRef } = useOnLayoutWithSubscription(measureCallback)

  return (
    <DragHandleContext.Provider value={handleContext}>
      <DragViewLayoutContext.Provider value={onLayoutPubSub}>
        <DragViewOffsetContext.Provider value={offsetContext}>
          <View {...ownPanHandlers} onLayout={onLayout} ref={viewRef} style={style}>
            {children}
          </View>
        </DragViewOffsetContext.Provider>
      </DragViewLayoutContext.Provider>
    </DragHandleContext.Provider>
  )
}
