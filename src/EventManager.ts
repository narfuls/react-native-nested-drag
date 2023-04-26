import { IDroppable, IDraggable, IPosition, IDndEventManager, OverlapMode } from './types'

export class DndEventManager implements IDndEventManager {
  constructor(overlapMode?: OverlapMode) {
    this.overlapMode = overlapMode ? overlapMode : 'last'
  }
  overlapMode: OverlapMode
  droppables: IDroppable[] = []
  draggables: IDraggable[] = []
  currentDroppables: IDroppable[] = []

  getDroppable = (id?: number): IDroppable | undefined => this.droppables.find((d) => d.id === id)

  registerDroppable(droppable: IDroppable): number {
    const lastDroppable = this.droppables.length ? this.droppables[this.droppables.length - 1] : undefined
    const newId = lastDroppable?.id !== undefined ? lastDroppable.id + 1 : 0
    this.droppables.push({ ...droppable, id: newId })
    return newId
  }

  updateDroppable(droppable: IDroppable): void {
    const actualDroppable = this.getDroppable(droppable.id)
    if (actualDroppable) {
      this.droppables = this.droppables.map((d) => (d.id == droppable.id ? droppable : d))
    } else {
      /*if (__DEV__) {
        console.warn("No such droppable: "+droppable.id+" all: "+JSON.stringify(this.droppables.map(d=>d.id)));
        this.registerDroppable(droppable);
      }*/
    }
  }

  unregisterDroppable(id: number): void {
    this.droppables = this.droppables.filter((d) => id !== d.id)
  }

  getDraggable = (id?: number): IDraggable | undefined => this.draggables.find((d) => d.id === id)

  registerDraggable(draggable: IDraggable): number {
    const lastDraggable = this.draggables.length ? this.draggables[this.draggables.length - 1] : undefined
    const newId = lastDraggable?.id !== undefined ? lastDraggable.id + 1 : 0
    this.draggables.push({ ...draggable, id: newId })
    return newId
  }

  updateDraggable(draggable: IDraggable): void {
    if (this.getDraggable(draggable.id)) {
      this.draggables = this.draggables.map((d) => (d.id == draggable.id ? draggable : d))
    } else {
      /*if (__DEV__) {
        console.warn("No such draggable: "+draggable.id+" all draggables: "+JSON.stringify(this.draggables.map(d=>d.id)));
        this.registerDraggable(draggable);        
      }*/
    }
  }

  unregisterDraggable(id: number): void {
    this.draggables = this.draggables.filter((d) => id !== d.id)
  }

  handleDragStart = (draggableId: number, position: IPosition) => {
    const draggable = this.getDraggable(draggableId)
    draggable?.onDragStart && draggable.onDragStart(position)
  }

  handleDragEnd = (draggableId: number, position: IPosition) => {
    const draggable = this.getDraggable(draggableId)

    if (!draggable) {
      return
    }

    const currentDroppables = this.sortDroppables(this.getDroppablesInArea(position))

    if (currentDroppables.length) {
      if (this.overlapMode == 'all') {
        currentDroppables.forEach((d, index) => {
          d.onDrop && d.onDrop(position, draggable.payload)
          draggable.onDrop && draggable.onDrop(position, undefined, d.payload, index)
        })
      } else {
        this.callDropWithNextParameter(currentDroppables, position, draggable.payload)
        draggable.onDrop && draggable.onDrop(position, undefined, currentDroppables[currentDroppables.length - 1].payload)
      }
    } else {
      draggable.onDragEnd && draggable.onDragEnd(position)
    }
    // single mode
    this.currentDroppables = []
  }

  handleDragMove = (draggableId: number, position: IPosition) => {
    const draggable = this.getDraggable(draggableId)

    if (!draggable) {
      return
    }

    const currentDroppables = this.getDroppablesInArea(position)
    if (this.overlapMode == 'all') {
      const newDroppables = currentDroppables.filter((x) => !this.currentDroppables.includes(x))
      const leavedDroppables = this.currentDroppables.filter((x) => !currentDroppables.includes(x))
      newDroppables.forEach((d) => {
        d.onEnter && d.onEnter(position, draggable.payload)
        draggable.onEnter && draggable.onEnter(position, d.payload)
      })
      leavedDroppables.forEach((d) => {
        d.onExit && d.onExit(position, draggable.payload)
        draggable.onExit && draggable.onExit(position, d.payload)
      })
      currentDroppables.forEach((d) => {
        d.onOver && d.onOver(position, draggable.payload)
        draggable.onOver && draggable.onOver(position, d.payload)
      })
      if (!currentDroppables.length) {
        draggable.onDrag && draggable.onDrag(position)
      }
      this.currentDroppables = currentDroppables
    } else {
      // single mode
      const currentDroppable = currentDroppables.length ? this.sortDroppables(currentDroppables)[currentDroppables.length - 1] : undefined
      const previousDroppable = this.currentDroppables?.length ? this.currentDroppables[0] : undefined
      if (previousDroppable != currentDroppable) {
        // droppable changed
        if (previousDroppable) {
          previousDroppable.onExit && previousDroppable.onExit(position, draggable.payload)
          draggable.onExit && draggable.onExit(position, previousDroppable.payload)
        }
        if (currentDroppable) {
          currentDroppable.onEnter && currentDroppable.onEnter(position, draggable.payload)
          draggable.onEnter && draggable.onEnter(position, currentDroppable.payload)
        }
      }

      if (currentDroppable) {
        // over
        this.callOverWithNextParameter(currentDroppables, position, draggable.payload)
        draggable.onOver && draggable.onOver(position, currentDroppable.payload)
      } else {
        // not over
        draggable.onDrag && draggable.onDrag(position)
      }
      this.currentDroppables = currentDroppable ? [currentDroppable] : []
    }
  }

  getDroppablesInArea = (position: IPosition) =>
    this.droppables.filter(
      (droppable) =>
        position.x >= droppable.layout.x &&
        position.y >= droppable.layout.y &&
        position.x <= droppable.layout.x + droppable.layout.width &&
        position.y <= droppable.layout.y + droppable.layout.height,
    )

  sortDroppables = (droppables: IDroppable[]) => {
    const result = [...droppables]
    if (this.overlapMode == 'first') {
      result.reverse()
    } else if (this.overlapMode != 'last' && this.overlapMode != 'all') {
      result.sort(this.overlapMode)
    }
    return result
  }

  callDropWithNextParameter = (droppables: IDroppable[], position: IPosition, payload: any) => {
    this._drop(droppables, droppables.length - 1, position, payload)
  }

  _drop = (droppables: IDroppable[], index: number, position: IPosition, payload: any) => {
    if (droppables.length > index) {
      const droppable = droppables[index]
      const nextDrop =
        index > 0
          ? () => {
              this._drop(droppables, index - 1, position, payload)
            }
          : undefined
      droppable.onDrop && droppable.onDrop(position, payload, nextDrop)
    }
  }

  callOverWithNextParameter = (droppables: IDroppable[], position: IPosition, payload: any) => {
    this._over(droppables, droppables.length - 1, position, payload)
  }

  _over = (droppables: IDroppable[], index: number, position: IPosition, payload: any) => {
    if (droppables.length > index) {
      const droppable = droppables[index]
      const nextOver =
        index > 0
          ? () => {
              this._over(droppables, index - 1, position, payload)
            }
          : undefined
      droppable.onOver && droppable.onOver(position, payload, nextOver)
    }
  }
}
