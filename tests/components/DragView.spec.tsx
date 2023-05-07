import { render, screen, fireEvent, act } from '@testing-library/react-native'
import { Text, View, ViewStyle } from 'react-native'
import React, { useContext, useState } from 'react'

import { DragContext, DragViewLayoutContext, DragViewOffsetContext, DragCloneContext } from '../../src/DragContext'
import { IDragContext, DragView, ISimplePubSub, DragHandleView, ITestDndEventManager, zeroPoint } from '../../src/'
import { DndEventManager } from '../../src/EventManager'
import { SimplePubSub } from '../../src/SimplePubSub'
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

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

const uniqueText = 'DragHandleView*-975!@#$%^&*'
const uniqueStyle: ViewStyle = {
  borderColor: '#ebf0f1',
  shadowColor: '#eca0f1',
  backgroundColor: '#eca071',
}
const overStyle: ViewStyle = { ...uniqueStyle, backgroundColor: '#ecb070' }
const dragStyle: ViewStyle = { ...uniqueStyle, backgroundColor: '#ecb072' }
const copyDragStyle: ViewStyle = { ...uniqueStyle, backgroundColor: '#ecb074' }
const copyOverStyle: ViewStyle = { ...uniqueStyle, backgroundColor: '#ecb075' }

describe('DragView', () => {
  let context: IDragContext
  let Unmount: () => void

  beforeEach(() => {
    context = {
      dndEventManager: new DndEventManager(),
      setClone: jest.fn(),
    }

    const { unmount } = render(
      <DragContext.Provider value={context}>
        <DragView style={uniqueStyle} overStyle={overStyle}>
          <Text>{uniqueText}</Text>
        </DragView>
      </DragContext.Provider>,
    )
    Unmount = unmount
  })

  it('renders children and style', () => {
    const child = screen.queryAllByText(uniqueText)
    expect(child.length).toBe(1)
    const view = screen.queryByText(uniqueText)?.parent
    expect(view).toBeTruthy()
    if (!view) throw new Error('view is null')

    expect(view.props.style).toEqual(expect.objectContaining(uniqueStyle))
  })

  describe('subscription', () => {
    let parentOnLayout: IMockSimplePubSub
    beforeEach(() => {
      parentOnLayout = { subscribe: jest.fn(), unsubscribe: jest.fn(), publish: jest.fn(), id: 0 }

      context = {
        dndEventManager: new DndEventManager(),
        setClone: jest.fn(),
      }
    })
    it('subscribes and unsubscribes ctx.parentOnLayout', () => {
      const { unmount } = render(
        <DragViewLayoutContext.Provider value={parentOnLayout}>
          <DragView>
            <Text>{uniqueText}</Text>
          </DragView>
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
          <DragViewLayoutContext.Provider value={parentOnLayout}>
            <TestingComponent id={1} />
            <DragView>
              <TestingComponent id={2} />
              <Text>{uniqueText}</Text>
            </DragView>
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
        registerDroppable: jest.fn(),
        updateDroppable: jest.fn(),
        unregisterDroppable: jest.fn(),
        getDraggable: jest.fn(),
        registerDraggable: jest.fn().mockImplementationOnce(() => 0),
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

      const { unmount } = render(
        <DragContext.Provider value={context}>
          <DragViewLayoutContext.Provider value={pubsub}>
            <DragView>
              <Text>{uniqueText}</Text>
            </DragView>
          </DragViewLayoutContext.Provider>
        </DragContext.Provider>,
      )
      expect(context.dndEventManager.registerDraggable).toBeCalledTimes(1)

      const measure = jest.fn().mockImplementation((f) => {
        f(0, 0, 0, 0, 11, 11)
      })
      const view = screen.queryByText(uniqueText)?.parent?.parent
      expect(view).toBeTruthy()
      if (!view) throw new Error('view is null')
      view.instance.measure = measure

      act(() => {
        fireEvent(view, 'layout')
      })

      expect(measure).toBeCalledTimes(1)

      act(() => {
        pubsub.publish()
      })

      expect(measure).toBeCalledTimes(2)
      expect(context.dndEventManager.updateDraggable).toBeCalled()

      unmount()

      expect(context.dndEventManager.unregisterDraggable).toBeCalledTimes(1)
    })

    it("doesn't register droppaple inside clone", () => {
      const pubsub = new SimplePubSub()
      const mockMngr: ITestDndEventManager = {
        getDroppable: jest.fn(),
        registerDroppable: jest.fn(),
        updateDroppable: jest.fn(),
        unregisterDroppable: jest.fn(),
        getDraggable: jest.fn(),
        registerDraggable: jest.fn().mockImplementationOnce(() => 0),
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

      render(
        <DragContext.Provider value={context}>
          <DragViewLayoutContext.Provider value={pubsub}>
            <DragCloneContext.Provider value={true}>
              <DragView>
                <Text>{uniqueText}</Text>
              </DragView>
            </DragCloneContext.Provider>
          </DragViewLayoutContext.Provider>
        </DragContext.Provider>,
      )
      expect(context.dndEventManager.registerDraggable).toBeCalledTimes(0)
    })

    it('calls publish onLayout for children', () => {
      render(
        <DragContext.Provider value={context}>
          <DragView>
            <Text>{uniqueText}</Text>
            <TestingComponentReceiver id={0} />
          </DragView>
        </DragContext.Provider>,
      )
      const testComp0 = screen.queryByTestId('TestingComponentReceiver0')
      //@ts-ignore
      expect(testComp0).toHaveTextContent('called:0')

      const view = screen.queryByText(uniqueText)?.parent?.parent
      expect(view).toBeTruthy()
      if (!view) throw new Error('view is null')

      act(() => {
        fireEvent(view, 'layout')
      })

      //@ts-ignore
      expect(testComp0).toHaveTextContent('called:1')
    })
  })

  describe('dnd Events', () => {
    let onEnter = jest.fn()
    let onExit = jest.fn()
    let onDrop = jest.fn()
    let onOver = jest.fn()
    let onDragStart = jest.fn()
    let onDrag = jest.fn()
    let onDragEnd = jest.fn()
    beforeEach(() => {
      onEnter = jest.fn()
      onExit = jest.fn()
      onDrop = jest.fn()
      onOver = jest.fn()
      onDragStart = jest.fn()
      onDrag = jest.fn()
      onDragEnd = jest.fn()
      context = {
        dndEventManager: new DndEventManager(),
        setClone: jest.fn(),
      }

      render(
        <DragContext.Provider value={context}>
          <DragView
            style={uniqueStyle}
            overStyle={overStyle}
            dragStyle={dragStyle}
            copyDragStyle={copyDragStyle}
            copyOverStyle={copyOverStyle}
            onOver={onOver}
            onDrop={onDrop}
            onEnter={onEnter}
            onExit={onExit}
            onDragStart={onDragStart}
            onDrag={onDrag}
            onDragEnd={onDragEnd}
          >
            <Text>{uniqueText}</Text>
          </DragView>
        </DragContext.Provider>,
      )

      const view = screen.queryByText(uniqueText)?.parent?.parent
      expect(view).toBeTruthy()
      if (!view) throw new Error('view is null')

      const measure = jest.fn().mockImplementation((f) => {
        f(0, 0, 0, 0, 11, 11)
      })
      view.instance.measure = measure

      act(() => {
        fireEvent(view, 'layout')
      })
    })
    describe('switch between styles', () => {
      it('start-drag-end', () => {
        const view = screen.queryByText(uniqueText)?.parent?.parent
        expect(view).toBeTruthy()
        if (!view) throw new Error('view is null')
        view.instance.measure = jest.fn()
        const draggable = (context.dndEventManager as ITestDndEventManager).getDraggable(0)

        expect(view.props.style).toEqual(expect.objectContaining(uniqueStyle))

        act(() => {
          draggable?.onDragStart && draggable.onDragStart(zeroPoint)
        })
        expect(view.props.style).toEqual(expect.objectContaining(dragStyle))
        expect(context.setClone).toBeCalledTimes(1)
        expect((context.setClone as jest.Mock).mock.calls[0][0].style).toEqual(expect.objectContaining(copyDragStyle))

        act(() => {
          draggable?.onDrag && draggable.onDrag(zeroPoint)
        })
        expect(view.props.style).toEqual(expect.objectContaining(dragStyle))

        act(() => {
          draggable?.onDragEnd && draggable.onDragEnd(zeroPoint)
        })
        expect(view.props.style).toEqual(expect.objectContaining(uniqueStyle))
      })

      it('start-drag-enter-over-exit-end', () => {
        const view = screen.queryByText(uniqueText)?.parent?.parent
        expect(view).toBeTruthy()
        if (!view) throw new Error('view is null')
        const draggable = (context.dndEventManager as ITestDndEventManager).getDraggable(0)

        expect(view.props.style).toEqual(expect.objectContaining(uniqueStyle))

        act(() => {
          draggable?.onDragStart && draggable.onDragStart(zeroPoint)
        })
        expect(view.props.style).toEqual(expect.objectContaining(dragStyle))
        expect(context.setClone).toBeCalledTimes(1)
        expect((context.setClone as jest.Mock).mock.calls[0][0].style).toEqual(expect.objectContaining(copyDragStyle))

        act(() => {
          draggable?.onDrag && draggable.onDrag(zeroPoint)
        })
        expect(view.props.style).toEqual(expect.objectContaining(dragStyle))

        act(() => {
          draggable?.onEnter && draggable.onEnter(zeroPoint)
        })
        expect(view.props.style).toEqual(expect.objectContaining(overStyle))
        expect(context.setClone).toBeCalledTimes(2)
        expect((context.setClone as jest.Mock).mock.calls[1][0].style).toEqual(expect.objectContaining(copyOverStyle))

        act(() => {
          draggable?.onOver && draggable.onOver(zeroPoint)
        })
        expect(view.props.style).toEqual(expect.objectContaining(overStyle))

        act(() => {
          draggable?.onExit && draggable.onExit(zeroPoint)
        })
        expect(view.props.style).toEqual(expect.objectContaining(dragStyle))
        expect(context.setClone).toBeCalledTimes(3)
        expect((context.setClone as jest.Mock).mock.calls[2][0].style).toEqual(expect.objectContaining(copyDragStyle))

        act(() => {
          draggable?.onDragEnd && draggable.onDragEnd(zeroPoint)
        })
        expect(view.props.style).toEqual(expect.objectContaining(uniqueStyle))
      })
      it('start-enter-exit-enter-drop', () => {
        const view = screen.queryByText(uniqueText)?.parent?.parent
        expect(view).toBeTruthy()
        if (!view) throw new Error('view is null')
        const draggable = (context.dndEventManager as ITestDndEventManager).getDraggable(0)

        expect(view.props.style).toEqual(expect.objectContaining(uniqueStyle))

        act(() => {
          draggable?.onDragStart && draggable.onDragStart(zeroPoint)
        })
        expect(view.props.style).toEqual(expect.objectContaining(dragStyle))
        expect(context.setClone).toBeCalledTimes(1)
        expect((context.setClone as jest.Mock).mock.calls[0][0].style).toEqual(expect.objectContaining(copyDragStyle))

        act(() => {
          draggable?.onEnter && draggable.onEnter(zeroPoint)
        })
        expect(view.props.style).toEqual(expect.objectContaining(overStyle))
        expect(context.setClone).toBeCalledTimes(2)
        expect((context.setClone as jest.Mock).mock.calls[1][0].style).toEqual(expect.objectContaining(copyOverStyle))

        act(() => {
          draggable?.onExit && draggable.onExit(zeroPoint)
        })
        expect(view.props.style).toEqual(expect.objectContaining(dragStyle))
        expect(context.setClone).toBeCalledTimes(3)
        expect((context.setClone as jest.Mock).mock.calls[2][0].style).toEqual(expect.objectContaining(copyDragStyle))

        act(() => {
          draggable?.onEnter && draggable.onEnter(zeroPoint)
        })
        expect(view.props.style).toEqual(expect.objectContaining(overStyle))
        expect(context.setClone).toBeCalledTimes(4)
        expect((context.setClone as jest.Mock).mock.calls[3][0].style).toEqual(expect.objectContaining(copyOverStyle))

        jest.useFakeTimers()
        act(() => {
          draggable?.onDrop && draggable.onDrop(zeroPoint)
          jest.advanceTimersByTime(1000)
        })
        jest.useRealTimers()
        expect(view.props.style).toEqual(expect.objectContaining(uniqueStyle))
      })
    })

    it('calls onEnter prop when ctx.dndEventManager asks', () => {
      expect(onEnter).toBeCalledTimes(0)

      act(() => {
        const draggable = (context.dndEventManager as ITestDndEventManager).getDraggable(0)
        draggable?.onEnter && draggable.onEnter(zeroPoint)
      })
      expect(onEnter).toBeCalledTimes(1)
    })

    it('calls onExit prop when ctx.dndEventManager asks', () => {
      expect(onExit).toBeCalledTimes(0)

      act(() => {
        const draggable = (context.dndEventManager as ITestDndEventManager).getDraggable(0)
        draggable?.onExit && draggable.onExit(zeroPoint)
      })
      expect(onExit).toBeCalledTimes(1)
    })

    it('calls onDrop prop when ctx.dndEventManager asks', () => {
      expect(onDrop).toBeCalledTimes(0)

      act(() => {
        const draggable = (context.dndEventManager as ITestDndEventManager).getDraggable(0)
        draggable?.onDrop && draggable.onDrop(zeroPoint)
      })
      expect(onDrop).toBeCalledTimes(1)
    })
    it('calls onOver prop when ctx.dndEventManager asks', () => {
      expect(onOver).toBeCalledTimes(0)

      act(() => {
        const draggable = (context.dndEventManager as ITestDndEventManager).getDraggable(0)
        draggable?.onOver && draggable.onOver(zeroPoint)
      })
      expect(onOver).toBeCalledTimes(1)
    })

    it('calls onDragStart prop when ctx.dndEventManager asks', () => {
      expect(onDragStart).toBeCalledTimes(0)

      act(() => {
        const draggable = (context.dndEventManager as ITestDndEventManager).getDraggable(0)
        draggable?.onDragStart && draggable.onDragStart(zeroPoint)
      })
      expect(onDragStart).toBeCalledTimes(1)
    })

    it('calls onDrag prop when ctx.dndEventManager asks', () => {
      expect(onDrag).toBeCalledTimes(0)

      act(() => {
        const draggable = (context.dndEventManager as ITestDndEventManager).getDraggable(0)
        draggable?.onDrag && draggable.onDrag(zeroPoint)
      })
      expect(onDrag).toBeCalledTimes(1)
    })

    it('calls onDragEnd prop when ctx.dndEventManager asks', () => {
      expect(onDragEnd).toBeCalledTimes(0)

      act(() => {
        const draggable = (context.dndEventManager as ITestDndEventManager).getDraggable(0)
        draggable?.onDragEnd && draggable.onDragEnd(zeroPoint)
      })
      expect(onDragEnd).toBeCalledTimes(1)
    })
  })

  it('removes panhandlers if handle exists', () => {
    render(
      <DragContext.Provider value={context}>
        <DragView>
          <Text>{uniqueText}</Text>
          <DragHandleView />
        </DragView>
      </DragContext.Provider>,
    )
    const view = screen.queryByText(uniqueText)?.parent?.parent
    expect(view).toBeTruthy()
    if (!view) throw new Error('view is null')

    expect(view.props.onResponderGrant).toBeFalsy()
  })

  it('can change panhandlers draggable undraggable', () => {
    render(
      <DragContext.Provider value={context}>
        <DragView>
          <Text>{uniqueText}</Text>
        </DragView>
      </DragContext.Provider>,
    )
    let view = screen.queryByText(uniqueText)?.parent?.parent
    expect(view).toBeTruthy()
    if (!view) throw new Error('view is null')

    expect(view.props.onResponderGrant).toBeTruthy()

    render(
      <DragContext.Provider value={context}>
        <DragView disabled>
          <Text>{uniqueText}</Text>
        </DragView>
      </DragContext.Provider>,
    )
    view = screen.queryByText(uniqueText)?.parent?.parent
    expect(view).toBeTruthy()
    if (!view) throw new Error('view is null')

    expect(view.props.onResponderGrant).toBeFalsy()
  })
  describe('offsets', () => {
    it('reads and sets parenntOffset', () => {
      const TestComponent = () => {
        const parentOffset = useContext(DragViewOffsetContext)
        return (
          <Text testID={'TestComponent'}>
            {parentOffset.x}/{parentOffset.y}
          </Text>
        )
      }
      render(
        <DragViewOffsetContext.Provider value={{ x: 1, y: 2 }}>
          <DragView>
            <TestComponent />
          </DragView>
        </DragViewOffsetContext.Provider>,
      )
      const testComp = screen.queryByTestId('TestComponent')

      //@ts-ignore
      expect(testComp).toHaveTextContent('1/2')
    })

    it('restores movableOffset from prop', () => {
      render(
        <DragView movableOffset={{ x: 10, y: 20 }}>
          <Text>{uniqueText}</Text>
        </DragView>,
      )
      const view = screen.queryByText(uniqueText)?.parent?.parent
      expect(view).toBeTruthy()
      if (!view) throw new Error('view is null')

      expect(view.props.style).toEqual(
        expect.objectContaining({
          transform: [{ translateX: 10 }, { translateY: 20 }],
        }),
      )
    })
    it('sets clone position with offset', () => {
      render(
        <DragContext.Provider value={context}>
          <DragViewOffsetContext.Provider value={{ x: 1, y: 2 }}>
            <DragView payload={1} movableOffset={{ x: 10, y: 20 }}>
              <Text>{uniqueText}</Text>
            </DragView>
          </DragViewOffsetContext.Provider>
        </DragContext.Provider>,
      )

      const measure = jest.fn().mockImplementation((f) => {
        f(0, 0, 0, 0, 100, 200)
      })
      const view = screen.queryByText(uniqueText)?.parent?.parent
      expect(view).toBeTruthy()
      if (!view) throw new Error('view is null')
      view.instance.measure = measure

      act(() => {
        fireEvent(view, 'layout')
      })

      const draggable = (context.dndEventManager as ITestDndEventManager).getDraggable(1)
      expect(draggable?.payload).toBe(1)

      act(() => {
        draggable?.onDragStart && draggable.onDragStart(zeroPoint)
      })

      expect(measure).toBeCalledTimes(1)
      expect(context.setClone).toBeCalledTimes(1)
      expect((context.setClone as jest.Mock).mock.calls[0][0].position).toEqual({ x: 90, y: 180 })
    })
  })
})
