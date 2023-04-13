import { render, screen, fireEvent, act } from '@testing-library/react-native'
import { Text, Animated } from 'react-native'
import React, { useContext, useEffect } from 'react'

import { DragContext } from '../../src/DragContext'
import { DragProvider, IDragClone, MockDndEventManager, IMockDndEventManager, zeroPoint } from '../../src/'

const TestingComponent = () => {
  const { providerOffset: providerOffset } = useContext(DragContext)
  return (
    <Text testID='TestingComponent'>
      {providerOffset.x}:{providerOffset.y}
    </Text>
  )
}

describe('DragProvider', () => {
  const uniqueText = 'DragHandleView*-975!@#$%^&*'
  beforeEach(() => {
    render(
      <DragProvider>
        <Text>{uniqueText}</Text>
        <TestingComponent />
      </DragProvider>,
    )
  })

  it('renders children', () => {
    const child = screen.queryAllByText(uniqueText)
    expect(child.length).toBe(1)
  })
  it('accept mockEventManager', () => {
    const TestComp = () => {
      const { dndEventManager } = useContext(DragContext)
      return <Text testID='TestComp'>{(dndEventManager as any).test}</Text>
    }
    const mngr: IMockDndEventManager = new MockDndEventManager()
    //@ts-ignore
    mngr.test = 'mock'
    render(
      <DragProvider mockEventManager={mngr}>
        <Text>{uniqueText}</Text>
        <TestComp />
      </DragProvider>,
    )
    const t = screen.queryByTestId('TestComp')
    expect(t).toBeTruthy()
    //@ts-ignore
    expect(t).toHaveTextContent('mock')
  })

  it('sets offset', () => {
    const view = screen.queryByText(uniqueText)?.parent?.children[0]
    expect(view).toBeTruthy()
    if (!view) throw new Error('view is null')

    expect(typeof view).not.toBe('string')

    if (typeof view !== 'string') {
      const measure = jest.fn().mockImplementation((f) => {
        f(0, 0, 0, 0, 11, 11)
      })
      view.instance.measure = measure
      act(() => {
        fireEvent(view, 'layout')
      })

      expect(measure).toBeCalledTimes(1)

      const offset = screen.queryByTestId('TestingComponent')
      expect(offset).toBeTruthy()
      //@ts-ignore
      expect(offset).toHaveTextContent('-11:-11')
    }
  })

  it('sets clone undefinded only if second param matchs', () => {
    const defaultClone: IDragClone = {
      draggableDndId: 0,
      style: {},
      pan: new Animated.ValueXY(),
      position: zeroPoint,
      opacity: undefined,
      children: <Text testID='TestClone'>0</Text>,
    }

    const TestSetClone = () => {
      const { setClone } = useContext(DragContext)
      useEffect(() => {
        setClone(defaultClone)
        setClone({ ...defaultClone, draggableDndId: 1, children: <Text testID='TestClone'>1</Text> })
        setClone(undefined, 0)
      }, [setClone])
      return <Text testID='TestSetClone'>TestSetClone</Text>
    }

    render(
      <DragProvider>
        <TestSetClone />
      </DragProvider>,
    )

    const testComponent = screen.queryByTestId('TestSetClone')
    const clone = testComponent?.parent?.parent?.parent?.children[2]

    expect(clone).toBeTruthy()
    //@ts-ignore
    expect(clone).toHaveTextContent('1')
  })
})
