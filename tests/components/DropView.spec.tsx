import { render, screen, fireEvent, act } from '@testing-library/react-native'
import { Text, View, ViewStyle } from 'react-native'
import React, { useContext, useState } from 'react'

import { DragViewLayoutContext, DragContext, DragCloneContext } from '../../src/DragContext'
import { IDragContext, DropView, ISimplePubSub, ITestDndEventManager, zeroPoint } from '../../src'
import { DndEventManager } from '../../src/EventManager'
import { SimplePubSub } from '../../src/SimplePubSub'

const TestingComponent = ({ id }: { id: number }) => {
  const parentOnLayout = useContext(DragViewLayoutContext)
  return (
    <Text testID={'TestingComponent' + id}>
      {parentOnLayout ? 'exists' : 'null'} id:{(parentOnLayout as IMockSimplePubSub)?.id}
    </Text>
  )
}

const TestingComponentReceiver = ({ id }: { id: number }) => {
  const parentOnLayout = useContext(DragViewLayoutContext)
  const [count, setCout] = useState(0)
  parentOnLayout &&
    parentOnLayout.subscribe(() => {
      setCout(count + 1)
    })
  return <Text testID={'TestingComponentReceiver' + id}>called:{count}</Text>
}

interface IMockSimplePubSub extends ISimplePubSub {
  id: number
}

describe('DropView', () => {
  const uniqueText = 'DragHandleView*-975!@#$%^&*'
  const uniqueStyle: ViewStyle = {
    width: '963',
    height: '825',
    borderColor: '#ebf0f1',
    shadowColor: '#eca0f1',
    backgroundColor: '#eca071',
  }
  const overStyle: ViewStyle = {
    width: '953',
    height: '835',
    borderColor: '#eb60f1',
    shadowColor: '#4ca0f1',
    backgroundColor: '#eca051',
  }
  let context: IDragContext
  let Unmount: () => void

  it('renders children and style', () => {
    render(
      <DropView style={uniqueStyle} overStyle={overStyle}>
        <Text>{uniqueText}</Text>
      </DropView>,
    )
    const child = screen.queryAllByText(uniqueText)
    expect(child.length).toBe(1)

    const view = screen.queryByText(uniqueText)?.parent
    expect(view).toBeTruthy()
    if (view) {
      expect(view.props.style).toEqual(uniqueStyle)
    }
  })

  describe('subscription', () => {
    let parentOnLayout: IMockSimplePubSub
    let contextLayout: ISimplePubSub
    beforeEach(() => {
      parentOnLayout = { subscribe: jest.fn(), unsubscribe: jest.fn(), publish: jest.fn(), id: 0 }

      context = { dndEventManager: new DndEventManager(), setClone: jest.fn() }
      contextLayout = parentOnLayout
    })

    it('subscribes and unsubscribes ctx.parentOnLayout', () => {
      const { unmount } = render(
        <DragViewLayoutContext.Provider value={contextLayout}>
          <DropView>
            <Text>{uniqueText}</Text>
          </DropView>
        </DragViewLayoutContext.Provider>,
      )
      Unmount = unmount

      expect(parentOnLayout.subscribe).toBeCalledTimes(1)

      Unmount()

      expect(parentOnLayout.unsubscribe).toBeCalledTimes(1)
      expect(parentOnLayout.unsubscribe).toBeCalledWith((parentOnLayout.subscribe as jest.Mock).mock.calls[0][0])
    })

    it('always creates new service ctx.parentOnLayout for children', () => {
      render(
        <View>
          <TestingComponent id={0} />
          <DragViewLayoutContext.Provider value={contextLayout}>
            <TestingComponent id={1} />
            <DropView>
              <TestingComponent id={2} />
              <Text>{uniqueText}</Text>
            </DropView>
          </DragViewLayoutContext.Provider>
        </View>,
      )
      const testComp0 = screen.queryByTestId('TestingComponent0')
      const testComp1 = screen.queryByTestId('TestingComponent1')
      const testComp2 = screen.queryByTestId('TestingComponent2')
      //@ts-ignore
      expect(testComp0).toHaveTextContent('null id:')
      //@ts-ignore
      expect(testComp1).toHaveTextContent('exists id:0')
      //@ts-ignore
      expect(testComp2).toHaveTextContent('exists id:')
    })

    it('registers updates and unregisters droppaple when ctx.parentOnLayout.publish or layout', () => {
      const pubsub = new SimplePubSub()
      const mockMngr: ITestDndEventManager = {
        getDroppable: jest.fn(),
        registerDroppable: jest.fn().mockImplementationOnce(() => 0),
        updateDroppable: jest.fn(),
        unregisterDroppable: jest.fn(),
        getDraggable: jest.fn(),
        registerDraggable: jest.fn(),
        updateDraggable: jest.fn(),
        unregisterDraggable: jest.fn(),
        handleDragStart: jest.fn(),
        handleDragEnd: jest.fn(),
        handleDragMove: jest.fn(),
      }
      context = {
        dndEventManager: mockMngr,
        setClone: jest.fn(),
      }
      contextLayout = pubsub
      const { unmount } = render(
        <DragContext.Provider value={context}>
          <DragViewLayoutContext.Provider value={contextLayout}>
            <DropView>
              <Text>{uniqueText}</Text>
            </DropView>
          </DragViewLayoutContext.Provider>
        </DragContext.Provider>,
      )

      expect(context.dndEventManager.registerDroppable).toBeCalledTimes(1)
      const measure = jest.fn().mockImplementation((f) => {
        f(0, 0, 0, 0, 11, 11)
      })
      const view = screen.queryByText(uniqueText)?.parent?.parent
      if (view) {
        view.instance.measure = measure

        act(() => {
          fireEvent(view, 'layout')
        })
      }

      expect(measure).toBeCalledTimes(1)

      act(() => {
        pubsub.publish()
      })

      expect(measure).toBeCalledTimes(2)
      expect(context.dndEventManager.updateDroppable).toBeCalled()

      unmount()

      expect(context.dndEventManager.unregisterDroppable).toBeCalledTimes(1)
    })

    it("doesn't register droppaple inside clone", () => {
      const pubsub = new SimplePubSub()
      const mockMngr: ITestDndEventManager = {
        getDroppable: jest.fn(),
        registerDroppable: jest.fn().mockImplementationOnce(() => 0),
        updateDroppable: jest.fn(),
        unregisterDroppable: jest.fn(),
        getDraggable: jest.fn(),
        registerDraggable: jest.fn(),
        updateDraggable: jest.fn(),
        unregisterDraggable: jest.fn(),
        handleDragStart: jest.fn(),
        handleDragEnd: jest.fn(),
        handleDragMove: jest.fn(),
      }
      context = {
        dndEventManager: mockMngr,
        setClone: jest.fn(),
      }
      contextLayout = pubsub
      render(
        <DragContext.Provider value={context}>
          <DragViewLayoutContext.Provider value={contextLayout}>
            <DragCloneContext.Provider value={true}>
              <DropView>
                <Text>{uniqueText}</Text>
              </DropView>
            </DragCloneContext.Provider>
          </DragViewLayoutContext.Provider>
        </DragContext.Provider>,
      )
      expect(context.dndEventManager.registerDroppable).toBeCalledTimes(0)
    })

    it('calls publish onLayout for children', () => {
      render(
        <DragViewLayoutContext.Provider value={contextLayout}>
          <DropView>
            <Text>{uniqueText}</Text>
            <TestingComponentReceiver id={0} />
          </DropView>
        </DragViewLayoutContext.Provider>,
      )
      const testComp0 = screen.queryByTestId('TestingComponentReceiver0')
      //@ts-ignore
      expect(testComp0).toHaveTextContent('called:0')

      const view = screen.queryByText(uniqueText)?.parent?.parent
      act(() => {
        view && fireEvent(view, 'layout')
      })

      //@ts-ignore
      expect(testComp0).toHaveTextContent('called:1')
    })
  })

  describe('dnd Event Props', () => {
    let onEnter = jest.fn()
    let onExit = jest.fn()
    let onDrop = jest.fn()
    let onOver = jest.fn()
    beforeEach(() => {
      onEnter = jest.fn()
      onExit = jest.fn()
      onDrop = jest.fn()
      onOver = jest.fn()
      context = {
        dndEventManager: new DndEventManager(),
        setClone: jest.fn(),
      }

      render(
        <DragContext.Provider value={context}>
          <DropView style={uniqueStyle} overStyle={overStyle} onOver={onOver} onDrop={onDrop} onEnter={onEnter} onExit={onExit}>
            <Text>{uniqueText}</Text>
          </DropView>
        </DragContext.Provider>,
      )

      const view = screen.queryByText(uniqueText)?.parent?.parent

      const measure = jest.fn().mockImplementation((f) => {
        f(0, 0, 0, 0, 11, 11)
      })

      if (view) {
        view.instance.measure = measure

        act(() => {
          fireEvent(view, 'layout')
        })
      }
    })
    it('switches between style and overStyle', () => {
      const view = screen.queryByText(uniqueText)?.parent?.parent
      expect(view).toBeTruthy()
      if (view) {
        expect(view.props.style).toEqual(uniqueStyle)

        act(() => {
          const droppable = (context.dndEventManager as ITestDndEventManager).getDroppable(0)
          droppable?.onEnter && droppable.onEnter(zeroPoint)
        })

        expect(view.props.style).toEqual(overStyle)

        act(() => {
          const droppable = (context.dndEventManager as ITestDndEventManager).getDroppable(0)
          droppable?.onExit && droppable.onExit(zeroPoint)
        })

        expect(view.props.style).toEqual(uniqueStyle)
      }
    })
    it('calls onEnter prop when ctx.dndEventManager asks', () => {
      expect(onEnter).toBeCalledTimes(0)

      act(() => {
        const droppable = (context.dndEventManager as ITestDndEventManager).getDroppable(0)
        droppable?.onEnter && droppable.onEnter(zeroPoint)
      })
      expect(onEnter).toBeCalledTimes(1)
    })

    it('calls onExit prop when ctx.dndEventManager asks', () => {
      expect(onExit).toBeCalledTimes(0)

      act(() => {
        const droppable = (context.dndEventManager as ITestDndEventManager).getDroppable(0)
        droppable?.onExit && droppable.onExit(zeroPoint)
      })
      expect(onExit).toBeCalledTimes(1)
    })

    it('calls onDrop prop when ctx.dndEventManager asks', () => {
      expect(onDrop).toBeCalledTimes(0)

      act(() => {
        const droppable = (context.dndEventManager as ITestDndEventManager).getDroppable(0)
        droppable?.onDrop && droppable.onDrop(zeroPoint)
      })
      expect(onDrop).toBeCalledTimes(1)
    })

    it('calls onOver prop when ctx.dndEventManager asks', () => {
      expect(onOver).toBeCalledTimes(0)

      act(() => {
        const droppable = (context.dndEventManager as ITestDndEventManager).getDroppable(0)
        droppable?.onOver && droppable.onOver(zeroPoint)
      })
      expect(onOver).toBeCalledTimes(1)
    })
  })
})
