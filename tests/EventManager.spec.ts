import { DndEventManager } from '../src/EventManager'
import { IDraggable, IDroppable } from '../src'

// eslint-disable-next-line
const toHaveBeenCalledBefore = require('jest-extended').toHaveBeenCalledBefore
expect.extend({ toHaveBeenCalledBefore })

describe('DndEventManager', () => {
  let evenManager: DndEventManager
  let draggables: IDraggable[]
  let droppables: IDroppable[]
  beforeEach(() => {
    droppables = [
      {
        id: 0,
        layout: { x: 0, y: 0, width: 10, height: 10 },
        onDrop: jest.fn(),
        onEnter: jest.fn(),
        onExit: jest.fn(),
        onOver: jest.fn(),
        payload: 1,
      },
      {
        id: 1,
        layout: { x: 10, y: 10, width: 10, height: 10 },
        onDrop: jest.fn(),
        onEnter: jest.fn(),
        onExit: jest.fn(),
        onOver: jest.fn(),
        payload: 2,
      },
    ]
    draggables = [
      {
        id: 0,
        onDragStart: jest.fn(),
        onDrag: jest.fn(),
        onDragEnd: jest.fn(),
        onDrop: jest.fn(),
        onEnter: jest.fn(),
        onExit: jest.fn(),
        onOver: jest.fn(),
        payload: 0,
        layout: { x: 10, y: 10, width: 10, height: 10 },
      },
      {
        id: 1,
        onDragStart: jest.fn(),
        onDrag: jest.fn(),
        onDragEnd: jest.fn(),
        onDrop: jest.fn(),
        onEnter: jest.fn(),
        onExit: jest.fn(),
        onOver: jest.fn(),
        payload: 1,
        layout: { x: 10, y: 10, width: 10, height: 10 },
      },
    ]
    evenManager = new DndEventManager()
  })

  it('registers draggable whith unique id', () => {
    const id1 = evenManager.registerDraggable(draggables[1])
    const id2 = evenManager.registerDraggable(draggables[0])

    expect(id1 != id2).toBeTruthy()
    expect(evenManager.draggables.length).toBe(2)
  })

  it('unregisters draggable', () => {
    evenManager.draggables = draggables

    evenManager.unregisterDraggable(draggables[0].id!)

    expect(evenManager.draggables.length).toBe(1)
    expect(evenManager.draggables[0]).toBe(draggables[1])
  })

  it('updates draggable', () => {
    evenManager.draggables = draggables
    const draggable0 = { ...draggables[1], id: draggables[0].id }

    evenManager.updateDraggable(draggable0)

    expect(evenManager.draggables[0]).toBe(draggable0)
  })

  it('gets draggable', () => {
    evenManager.draggables = draggables
    const actual = evenManager.getDraggable(evenManager.draggables[1].id)

    expect(evenManager.draggables[1]).toBe(actual)
  })

  it('registers droppable whith unique id', () => {
    const id1 = evenManager.registerDroppable(droppables[1])
    const id2 = evenManager.registerDroppable(droppables[0])

    expect(id1 != id2).toBeTruthy()
    expect(evenManager.droppables.length).toBe(2)
  })

  it('unregisters droppable', () => {
    evenManager.droppables = droppables

    evenManager.unregisterDroppable(draggables[0].id!)

    expect(evenManager.droppables.length).toBe(1)
    expect(evenManager.droppables[0]).toBe(droppables[1])
  })

  it('updates droppable', () => {
    evenManager.droppables = droppables
    const droppable0 = { ...droppables[1], id: droppables[0].id }

    evenManager.updateDroppable(droppable0)

    expect(evenManager.droppables[0]).toBe(droppable0)
  })

  it('gets droppable', () => {
    evenManager.droppables = droppables
    const actual = evenManager.getDroppable(evenManager.droppables[1].id)

    expect(evenManager.droppables[1]).toBe(actual)
  })

  describe('handleDragStart', () => {
    it('calls corresponding draggable onDragStart whith coords', () => {
      evenManager.draggables = draggables
      evenManager.handleDragStart(draggables[1].id!, { x: 0, y: 0 })

      expect(draggables[1].onDragStart).toBeCalledTimes(1)
    })
  })

  describe('handleDragEnd', () => {
    it('calls corresponding draggable onDragEnd. if not inside droppable', () => {
      evenManager.draggables = draggables
      evenManager.droppables = droppables
      evenManager.handleDragEnd(draggables[1].id!, { x: 20, y: 0 })

      expect(draggables[1].onDragEnd).toBeCalledTimes(1)
      expect(draggables[1].onDrop).toBeCalledTimes(0)
    })
    it('calls droppable onDrop then draggable onDrop. if inside droppable', () => {
      evenManager.draggables = draggables
      evenManager.droppables = droppables
      evenManager.handleDragEnd(draggables[1].id!, { x: 5, y: 5 })
      // @ts-ignore
      expect(droppables[0].onDrop).toHaveBeenCalledBefore(draggables[1].onDrop)
    })

    it('calls onDrop on last droppable in area', () => {
      evenManager.draggables = draggables
      evenManager.droppables = droppables

      evenManager.handleDragEnd(draggables[1].id!, { x: 10, y: 10 })

      expect(droppables[0].onDrop).toBeCalledTimes(0)
      expect(droppables[1].onDrop).toBeCalledTimes(1)
    })
  })
  describe('handleDragMove if NOT inside droppable', () => {
    it('calls draggable onDrag ', () => {
      evenManager.draggables = draggables
      evenManager.droppables = droppables
      evenManager.handleDragMove(draggables[1].id!, { x: 20, y: 0 })

      expect(draggables[1].onDrag).toBeCalledTimes(1)
    })
    it('calls droppable and droppable onExit then draggable onDrag. if it was inside droppable', () => {
      evenManager.draggables = draggables
      evenManager.droppables = droppables
      evenManager.currentDroppables = [droppables[0]]

      evenManager.handleDragMove(draggables[1].id!, { x: 25, y: 5 })

      // @ts-ignore
      expect(draggables[1].onExit).toHaveBeenCalledBefore(draggables[1].onDrag)
      // @ts-ignore
      expect(droppables[0].onExit).toHaveBeenCalledBefore(draggables[1].onDrag)
    })
  })
  describe('handleDragMove if INSIDE droppable', () => {
    it('calls droppable and droppable onOver', () => {
      evenManager.draggables = draggables
      evenManager.droppables = droppables
      evenManager.handleDragMove(draggables[1].id!, { x: 5, y: 5 })

      expect(draggables[1].onOver).toBeCalledTimes(1)
      expect(droppables[0].onOver).toBeCalledTimes(1)
    })
    it('calls droppable and droppable onExit then onEnter then onOver. if it was inside OTHER droppable', () => {
      evenManager.draggables = draggables
      evenManager.droppables = droppables
      evenManager.currentDroppables = [droppables[1]]

      evenManager.handleDragMove(draggables[1].id!, { x: 5, y: 5 })

      // @ts-ignore
      expect(draggables[1].onExit).toHaveBeenCalledBefore(draggables[1].onEnter)
      // @ts-ignore
      expect(draggables[1].onExit).toHaveBeenCalledBefore(droppables[0].onEnter)
      // @ts-ignore
      expect(droppables[1].onExit).toHaveBeenCalledBefore(droppables[0].onEnter)
      // @ts-ignore
      expect(droppables[1].onExit).toHaveBeenCalledBefore(draggables[1].onEnter)
      // @ts-ignore
      expect(draggables[1].onEnter).toHaveBeenCalledBefore(draggables[1].onOver)
      // @ts-ignore
      expect(droppables[0].onEnter).toHaveBeenCalledBefore(draggables[1].onOver)
      // @ts-ignore
      expect(draggables[1].onEnter).toHaveBeenCalledBefore(droppables[0].onOver)
      // @ts-ignore
      expect(droppables[0].onEnter).toHaveBeenCalledBefore(droppables[0].onOver)
    })
  })
  it('calculates getDroppablesInArea', () => {
    evenManager.droppables = droppables

    expect(evenManager.getDroppablesInArea({ x: 5, y: 5 })).toEqual([droppables[0]])
    expect(evenManager.getDroppablesInArea({ x: 15, y: 15 })).toEqual([droppables[1]])

    expect(evenManager.getDroppablesInArea({ x: -1, y: 5 })).toEqual([])
    expect(evenManager.getDroppablesInArea({ x: 11, y: 5 })).toEqual([])
    expect(evenManager.getDroppablesInArea({ x: 5, y: -1 })).toEqual([])
    expect(evenManager.getDroppablesInArea({ x: 5, y: 11 })).toEqual([])

    expect(evenManager.getDroppablesInArea({ x: 10, y: 10 })).toEqual(droppables)
  })

  it('sort Droppables', () => {
    const originalDroppables = [...droppables]
    evenManager.sortDroppables(droppables)
    expect(originalDroppables).toEqual(droppables)

    evenManager.overlapMode = 'first'
    droppables = evenManager.sortDroppables(droppables)
    expect(originalDroppables).toEqual(droppables.reverse())

    droppables = [...originalDroppables]
    evenManager.overlapMode = (d1, d2) => d2.payload - d1.payload
    droppables = evenManager.sortDroppables(droppables)
    expect(originalDroppables).toEqual(droppables.reverse())
  })
})
