import { Animated, GestureResponderHandlers, ViewStyle } from 'react-native'

export interface IDragContext {
  /** Calls dnd events */
  dndEventManager: IDndEventManager
  /** Set only in DragProvider. use anywhere
   * @param dndId is necesary for set clone undefinded */
  setClone: (clone?: IDragClone, dndId?: number) => void
}

export interface IDragHandleContext {
  /** Set in view to pass to nested handle */
  panHandlers: GestureResponderHandlers
  /** Call in HandleView to show presence to parent view */
  setHandleExists: () => void
}

export interface ISimplePubSub {
  subscribe: (onLayout: () => void) => void
  unsubscribe: (onLayout: () => void) => void
  publish: () => void
}

export type DroppableEnterExit = (position: IPosition, payload?: any) => void

export type DroppableDropOver = (position: IPosition, payload?: any, triggerNextDroppable?: () => void) => void

export type DraggableEnterExitOver = (position: IPosition, payload?: any) => void

export type DraggableDragStart = (position: IPosition) => void

export type DraggableEnd = (position: IPosition, movableOffset?: IPosition) => void

export type DraggableDrop = (position: IPosition, movableOffset?: IPosition, payload?: any, overlapIndex?: number) => void

export interface IDroppableEvents {
  /** Called when drag ends over it */
  onDrop?: DroppableDropOver
  /** Called repeatedly while an item is dragged over it */
  onOver?: DroppableDropOver
  /** Called each time an item is initially dragged over it */
  onEnter?: DroppableEnterExit
  /** Called when item is dragged off of it or drag is cancelled */
  onExit?: DroppableEnterExit
}

export interface IDraggableEvents {
  /** Called when a drag action begins */
  onDragStart?: DraggableDragStart
  /** Called repeatedly while dragged, not over any receiver */
  onDrag?: DraggableDragStart
  /** Called when initially dragged over a new receiver */
  onEnter?: DraggableEnterExitOver
  /** Called repeatedly while dragged over a receiver */
  onOver?: DraggableEnterExitOver
  /** Called view when dragged off of a receiver */
  onExit?: DraggableEnterExitOver
  /** Called view when drag ends not over any receiver or is cancelled */
  onDragEnd?: DraggableEnd
  /** Called when drag ends over a receiver */
  onDrop?: DraggableDrop
}
/** x, y */
export interface IPosition {
  x: number
  y: number
}

/** x, y, width, height */
export interface ILayoutData extends IPosition {
  height: number
  width: number
}

export interface IDroppable extends IDroppableEvents {
  id?: number
  layout: ILayoutData
  payload?: any
}

export interface IDraggable extends IDraggableEvents {
  id?: number
  payload?: any
  layout: ILayoutData
}

/** Register and update all draggables and droppables, call handlers and recieve dnd events */
export interface IDndEventManager {
  registerDroppable: (droppable: IDroppable) => number
  updateDroppable: (droppable: IDroppable) => void
  unregisterDroppable: (id: number) => void

  registerDraggable: (draggable: IDraggable) => number
  updateDraggable: (draggable: IDraggable) => void
  unregisterDraggable: (id: number) => void
  /** @param draggableId dndId from registerDraggable */
  handleDragStart: (draggableId: number, position: IPosition) => void
  /** @param draggableId dndId from registerDraggable */
  handleDragEnd: (draggableId: number, position: IPosition) => void
  /** @param draggableId dndId from registerDraggable */
  handleDragMove: (draggableId: number, position: IPosition) => void
}
/** for internal tests */
export interface ITestDndEventManager extends IDndEventManager {
  getDroppable: (id?: number) => IDroppable | undefined
  getDraggable: (id?: number) => IDraggable | undefined
}

/** for tests */
export interface IMockDndEventManager extends IDndEventManager {
  droppables: IDroppable[]
  draggables: IDraggable[]
  dragStart: (draggable: IDraggable, position?: IPosition) => void
  dragEnd: (draggable: IDraggable, position?: IPosition, movableOffset?: IPosition) => void
  drag: (draggable: IDraggable, position?: IPosition) => void
  dragOver: (draggable: IDraggable, droppable: IDroppable, position?: IPosition, triggerNextDroppable?: () => void) => void
  dragEnter: (draggable: IDraggable, droppable: IDroppable, position?: IPosition) => void
  dragExit: (draggable: IDraggable, droppable: IDroppable, position?: IPosition) => void
  drop: (draggable: IDraggable, droppable: IDroppable, position?: IPosition, movableOffset?: IPosition, triggerNextDroppable?: () => void) => void
}

export interface IDropViewProps extends IDroppableEvents {
  /** Custom style prop */
  style?: ViewStyle
  /** Style applied while dragging over this view */
  overStyle?: ViewStyle
  payload?: any
  /** view can't recieve draggables */
  disabled?: boolean
}

export interface IDragHandleViewProps {
  style?: ViewStyle
}

export interface IDragCloneProps {
  clone?: IDragClone
  /** Offset for calc absolute position */
  providerOffset: IPosition
}

export interface IDragProviderProps {
  /** for testing */
  mockEventManager?: IDndEventManager
  /** droppable overlap call ('first' | 'last' | 'all' | compare function) (default last) */
  overlapMode?: OverlapMode
}

export type OverlapMode = 'first' | 'last' | 'all' | DroppablesComparer

export type DroppablesComparer = (droppable1: { layout: ILayoutData; payload?: any }, droppable2: { layout: ILayoutData; payload?: any }) => number

export interface IDragViewStyleProps {
  /** Custom style prop */
  style?: ViewStyle
  /** Style applied while this view is being dragged */
  dragStyle?: ViewStyle
  /** Style applied while this view is being dragged over a receiver */
  overStyle?: ViewStyle
  /** Style applied to the copy of this view while dragging */
  copyDragStyle?: ViewStyle
  /** Style applied to the copy of this view while dragging over a receiver */
  copyOverStyle?: ViewStyle
}

export interface IDragViewProps extends IDragViewStyleProps, IDraggableEvents {
  /** view can't be dragged */
  disabled?: boolean
  /** view start drag after delay @default 0 */
  longPressDelay?: number
  /** to disable set it 0. @default 0 */
  vibroDuration?: number
  payload?: any
  /** actual view moves with copy ontop and stays where it relesed */
  movable?: boolean
  /** customize dragEnd animation @default {overshootClamping: true}*/
  animationEndOptions?: ISpringAnimationConfig
  /** customize drop animation @default {}*/
  animationDropOptions?: ITimingAnimationConfig
  /** in case you want to restore innser state (handy for nested movable) */
  movableOffset?: IPosition
}

/** Animated.TimingAnimationConfig without toValue and useNativeDriver*/
export interface ITimingAnimationConfig {
  /** Length of animation (milliseconds). @Default 500. */
  duration?: number
  /**Easing function to define curve. Default is Easing.inOut(Easing.ease). */
  easing?: (value: number) => number
  /**Start the animation after delay (milliseconds). @Default 0. */
  delay?: number
  /**Whether or not this animation creates an "interaction handle" on the InteractionManager. @Default true.*/
  isInteraction?: boolean
}

/** Animated.SpringAnimationConfig without toValue and useNativeDriver*/
export interface ISpringAnimationConfig {
  /** Controls "bounciness"/overshoot. Default 7.*/
  friction?: number
  /** Controls speed. Default 40. */
  tension?: number
  /**Controls speed of the animation. Default 12. */
  speed?: number
  /** Controls bounciness. Default 8.*/
  bounciness?: number
  /** The spring stiffness coefficient. Default 100.*/
  stiffness?: number
  /**Defines how the spring’s motion should be damped due to the forces of friction. Default 10. */
  damping?: number
  /**The mass of the object attached to the end of the spring. Default 1. */
  mass?: number
  /** The initial velocity of the object attached to the spring. Default 0 (object is at rest).*/
  velocity?: number
  /**Boolean indicating whether the spring should be clamped and not bounce. Default false. */
  overshootClamping?: boolean
  /** The threshold of displacement from rest below which the spring should be considered at rest. Default 0.001.*/
  restDisplacementThreshold?: number
  /** The speed at which the spring should be considered at rest in pixels per second. Default 0.001.*/
  restSpeedThreshold?: number
  /**  Start the animation after delay (milliseconds). Default 0.*/
  delay?: number
  /**Whether or not this animation creates an "interaction handle" on the InteractionManager. Default true. */
  isInteraction?: boolean
}

export interface IDragClone {
  /** Custom style prop */
  style?: ViewStyle
  /** pan to animate dragging */
  pan?: Animated.ValueXY
  /** Initial actual view absolute position */
  position?: IPosition
  /** to animate onDrop effect */
  opacity?: Animated.Value
  /** to look same as actual view */
  children: React.ReactNode
  /** id from IDndEventManager */
  draggableDndId: number
}

export const zeroPoint = { x: 0, y: 0 }
