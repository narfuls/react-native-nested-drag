import { Animated, GestureResponderHandlers, ViewStyle, ViewProps, LayoutChangeEvent } from 'react-native'

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
  subscribe: (onLayout: (e?: LayoutChangeEvent) => void) => void
  unsubscribe: (onLayout: (e?: LayoutChangeEvent) => void) => void
  publish: () => void
}

export type DroppableEnterExit = (position: IPosition, payload?: any) => void

export type DroppableDropOver = (position: IPosition, payload?: any, triggerNextDroppable?: () => void) => void

export type DraggableEnterOver = (position: IPosition, payload?: any) => void

export type DraggableExit = (position: IPosition, payload?: any, overCount?: number) => void

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
  onEnter?: DraggableEnterOver
  /** Called repeatedly while dragged over a receiver */
  onOver?: DraggableEnterOver
  /** Called when dragged off of a receiver */
  onExit?: DraggableExit
  /** Called when drag ends not over any receiver or is cancelled */
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

/** Register and update all draggables and droppables, call handlers and receive dnd events */
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

export interface IDropViewProps extends IDroppableEvents, ViewProps {
  /** Style applied while dragging over this view */
  overStyle?: ViewStyle
  payload?: any
  /** view can't receive draggables */
  disabled?: boolean
}

export type ViewWithoutPanHandlersProps = Omit<ViewProps, keyof GestureResponderHandlers>

export interface IDragCloneProps {
  clone?: IDragClone
  /** Offset for calc absolute position */
  providerOffset: IPosition
}

export interface IDragProviderProps {
  /** for testing */
  mockEventManager?: IDndEventManager
  /** droppable overlap call order ('first' | 'last' | 'all' | compare function) (default last) */
  overlapMode?: OverlapMode
}

export type OverlapMode = 'first' | 'last' | 'all' | DroppablesComparer

export type DroppablesComparer = (droppable1: { layout: ILayoutData; payload?: any }, droppable2: { layout: ILayoutData; payload?: any }) => number

export interface IDragViewStyleProps {
  /** Style applied while this view is being dragged */
  dragStyle?: ViewStyle
  /** Style applied while this view is being dragged over a receiver */
  overStyle?: ViewStyle
  /** Style applied to the copy of this view while dragging */
  copyDragStyle?: ViewStyle
  /** Style applied to the copy of this view while dragging over a receiver */
  copyOverStyle?: ViewStyle
}

export interface IDragViewProps extends IDragViewStyleProps, IDraggableEvents, ViewWithoutPanHandlersProps {
  /** Custom style prop */
  style?: ViewStyle
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
  animationEndOptions?: SpringAnimationConfig
  /** customize drop animation @default {}*/
  animationDropOptions?: TimingAnimationConfig
  /** in case you want to restore innser state (handy for nested movable) */
  movableOffset?: IPosition
}

/** Animated.TimingAnimationConfig without toValue and useNativeDriver*/
export type TimingAnimationConfig = Omit<Animated.TimingAnimationConfig, 'toValue' | 'useNativeDriver'>

/** Animated.SpringAnimationConfig without toValue and useNativeDriver*/
export type SpringAnimationConfig = Omit<Animated.SpringAnimationConfig, 'toValue' | 'useNativeDriver'>

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
