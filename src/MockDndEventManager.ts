import { IMockDndEventManager, IDroppable, IDraggable, IPosition, zeroPoint } from './types'

export class MockDndEventManager implements IMockDndEventManager {
  droppables: IDroppable[] = []
  draggables: IDraggable[] = []

  registerDroppable(droppable: IDroppable): number {
    const lastDroppable = this.droppables.length ? this.droppables[this.droppables.length - 1] : undefined
    const newId = lastDroppable?.id !== undefined ? lastDroppable.id + 1 : 0
    this.droppables.push({ ...droppable, id: newId })
    return newId
  }

  updateDroppable(droppable: IDroppable) {
    this.droppables = this.droppables.map((d) => (d.id == droppable.id ? droppable : d))
  }

  unregisterDroppable(id: number) {
    this.droppables = this.droppables.filter((d) => id !== d.id)
  }

  registerDraggable(draggable: IDraggable): number {
    const lastDraggable = this.draggables.length ? this.draggables[this.draggables.length - 1] : undefined
    const newId = lastDraggable?.id !== undefined ? lastDraggable.id + 1 : 0
    this.draggables.push({ ...draggable, id: newId })
    return newId
  }

  updateDraggable(draggable: IDraggable) {
    this.draggables = this.draggables.map((d) => (d.id == draggable.id ? draggable : d))
  }

  unregisterDraggable(id: number) {
    this.draggables = this.draggables.filter((d) => id !== d.id)
  }

  handleDragStart = () => undefined
  handleDragEnd = () => undefined
  handleDragMove = () => undefined

  dragStart = (draggable: IDraggable, position: IPosition = zeroPoint) => {
    draggable?.onDragStart && draggable.onDragStart(position)
  }

  dragEnd = (draggable: IDraggable, position: IPosition = zeroPoint, movableOffset: IPosition = zeroPoint) => {
    draggable?.onDragEnd && draggable.onDragEnd(position, movableOffset)
  }

  drag = (draggable: IDraggable, position: IPosition = zeroPoint) => {
    draggable?.onDrag && draggable.onDrag(position)
  }

  dragEnter = (draggable: IDraggable, droppable: IDroppable, position: IPosition = zeroPoint) => {
    droppable?.onEnter && droppable.onEnter(position, draggable.payload)
    draggable?.onEnter && draggable.onEnter(position, droppable.payload)
  }

  dragOver = (draggable: IDraggable, droppable: IDroppable, position: IPosition = zeroPoint, triggerNextDroppable?: () => void) => {
    droppable?.onOver && droppable.onOver(position, draggable.payload, triggerNextDroppable)
    draggable?.onOver && draggable.onOver(position, droppable.payload)
  }

  dragExit = (draggable: IDraggable, droppable: IDroppable, position: IPosition = zeroPoint) => {
    droppable?.onExit && droppable.onExit(position, draggable.payload)
    draggable?.onExit && draggable.onExit(position, droppable.payload)
  }

  drop = (
    draggable: IDraggable,
    droppable: IDroppable,
    position: IPosition = zeroPoint,
    movableOffset: IPosition = zeroPoint,
    triggerNextDroppable?: () => void,
  ) => {
    droppable?.onDrop && droppable.onDrop(position, draggable.payload, triggerNextDroppable)
    draggable?.onDrop && draggable.onDrop(position, movableOffset, droppable.payload)
  }
}
