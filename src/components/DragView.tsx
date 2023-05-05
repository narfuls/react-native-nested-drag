import { Animated, View, ViewStyle, PanResponder, Vibration, MeasureOnSuccessCallback } from 'react-native'
import React, { useRef, useState, useContext, useEffect, useMemo, useCallback } from 'react'

import { DragContext, DragViewOffsetContext, DragCloneContext } from '../DragContext'
import { IDragViewProps, IDraggable, IPosition, zeroPoint, ILayoutData } from '../types'
import { DragViewWithHandleAndMeasue } from './internal/DragViewWithHandleAndMeasue'
const empty = {}
const animEndOptions = { overshootClamping: true }

/* offsets:
1) provider: between clone and provider only
2) movable: 
  - sets on dragEnd as pan change
4) parent: should be set for children via ctx as parent + movable
  - sets on dragEnd and ctx change*/
export function DragView(props: IDragViewProps) {
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
  ...restProps
}: IDragViewProps) {
  const { dndEventManager, setClone: ctxSetClone } = useContext(DragContext)
  const parentOffset = useContext(DragViewOffsetContext)

  const [style, setStyle] = useState(styleProp)
  const [panResponder, setPanResponder] = useState(PanResponder.create({}))
  const [fadeAnim] = useState(new Animated.Value(1))

  const pan = useRef(new Animated.ValueXY()).current
  const defaultStyleRef = useRef(styleProp)
  /** unlike pan updates only on movable dragend */
  const movedOffsetRef = useRef<IPosition>(movableOffset)
  const [movedOffset, setMovedOffset] = useState<IPosition>(movableOffset)
  /** id from IDndEventManager */
  const dndId = useRef<number | undefined>(undefined)
  /** initial absolutePos * * (if you wondered why append and then distract parentOffset ?
   * Coz absolutePos updates only inside 'measure' and parentOffset may change while measure not triggered.
   * So it contains parent movedOffset) */
  const absolutePos = useRef<IPosition>(zeroPoint)
  const layoutRef = useRef<ILayoutData>({ x: -1, y: -1, width: 0, height: 0 })

  const setDefaultStyle = useCallback(() => {
    defaultStyleRef.current = {
      ...styleProp,
      transform: [{ translateX: movedOffsetRef.current.x }, { translateY: movedOffsetRef.current.y }],
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
        const cloneStyle = styleParam ? styleParam : copyDragStyle ? copyDragStyle : defaultStyleRef.current
        dndId.current !== undefined &&
          ctxSetClone({
            draggableDndId: dndId.current,
            style: { ...cloneStyle, width: layoutRef.current.width, height: layoutRef.current.height },
            pan: pan,
            position: {
              x: absolutePos.current.x - parentOffset.x,
              y: absolutePos.current.y - parentOffset.y,
            },
            opacity: fadeAnim,
            children: children,
          })
      }
    },
    [parentOffset, children, copyDragStyle, ctxSetClone, fadeAnim, pan],
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

  const fadeOut = useCallback(() => {
    Animated.timing(fadeAnim, {
      ...animationDropOptions,
      toValue: 0,
      useNativeDriver: true,
    }).start(() => {
      pan.setValue(zeroPoint) // remove flashing on second drag
      fadeAnim.setValue(1)
      setClone()
    })
  }, [setClone, animationDropOptions, fadeAnim, pan])

  const movableDragEnd = useCallback(() => {
    pan.extractOffset()
    movedOffsetRef.current = {
      x: Number(JSON.stringify(pan.x)),
      y: Number(JSON.stringify(pan.y)),
    }
    setMovedOffset(movedOffsetRef.current)
    setClone()
  }, [setClone, pan])

  const onEnter = useCallback(
    (position: IPosition, payload: any) => {
      if (movable) {
        if (copyOverStyle || overStyle) {
          setClone(true, copyOverStyle ? copyOverStyle : overStyle)
        }
      } else {
        overStyle && setStyle(overStyle)
        copyOverStyle && setClone(true, copyOverStyle)
      }
      onEnterProp && onEnterProp(position, payload)
    },
    [onEnterProp, copyOverStyle, overStyle, setClone, movable],
  )

  const onExit = useCallback(
    (position: IPosition, payload: any, overCount?: number) => {
      if (!overCount) {
        //overCount: only if not over (0 or undefinded) to prevent style change
        if (movable) {
          if (copyOverStyle || overStyle) {
            setClone(true)
          }
        } else {
          overStyle && setStyle(dragStyle ? dragStyle : styleProp)
          copyOverStyle && setClone(true)
        }
      }
      onExitProp && onExitProp(position, payload, overCount)
    },
    [onExitProp, copyOverStyle, dragStyle, overStyle, setClone, styleProp, movable],
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
      onDragEndProp && onDragEndProp(position, movedOffsetRef.current)
    },
    [onDragEndProp, bounce, movable, movableDragEnd, setDefaultStyle],
  )

  const onDrop: (position: IPosition, _movedOffset: any, payload: any, overlapIndex?: number) => void = useCallback(
    (position: IPosition, _movedOffset: any, payload: any, overlapIndex?: number) => {
      if (!overlapIndex) {
        //overlapIndex: only first(0) or undefinded to prevent multiple animation call
        if (movable) {
          movableDragEnd()
        } else {
          fadeOut()
        }
        setDefaultStyle()
      }
      onDropProp && onDropProp(position, movedOffsetRef.current, payload, overlapIndex)
    },
    [movable, movableDragEnd, setDefaultStyle, onDropProp, fadeOut],
  )

  const setDndEventManagerDraggable = useCallback(() => {
    //  dnd handlers should contain uptodate context
    const draggable: IDraggable = {
      id: dndId.current,
      layout: layoutRef.current,
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

  useEffect(() => {
    setDndEventManagerDraggable()
  }, [setDndEventManagerDraggable])

  useEffect(() => {
    setDefaultStyle()
  }, [setDefaultStyle])

  useEffect(() => {
    movedOffsetRef.current = movableOffset
    setMovedOffset(movableOffset)
    pan.setOffset(movableOffset)
    setDefaultStyle()
  }, [movableOffset, pan, setDefaultStyle])

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

  const offsetContext: IPosition = useMemo(() => {
    return {
      x: parentOffset.x - movedOffset.x,
      y: parentOffset.y - movedOffset.y,
    }
  }, [parentOffset, movedOffset])

  const panHandlers = useMemo(() => (disabled ? {} : panResponder.panHandlers), [panResponder, disabled])
  const measureCallback = useCallback<MeasureOnSuccessCallback>(
    (_x, _y, width, height, pageX, pageY) => {
      layoutRef.current = { x: pageX, y: pageY, width: width, height: height }
      absolutePos.current = {
        x: pageX + parentOffset.x - movedOffsetRef.current.x,
        y: pageY + parentOffset.y - movedOffsetRef.current.y,
      }
      setDndEventManagerDraggable()
    },
    [parentOffset, setDndEventManagerDraggable],
  )

  const viewWithHandleAndMeasueProps = useMemo(
    () => ({ ...restProps, panHandlers: panHandlers, measureCallback: measureCallback, style: style }),
    [restProps, measureCallback, style, panHandlers],
  )
  return (
    <DragViewOffsetContext.Provider value={offsetContext}>
      <DragViewWithHandleAndMeasue {...viewWithHandleAndMeasueProps}>{children}</DragViewWithHandleAndMeasue>
    </DragViewOffsetContext.Provider>
  )
}
