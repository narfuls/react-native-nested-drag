import { render, screen, act } from '@testing-library/react-native'
import React from 'react'

import { DropSum } from './DropSum'
import { DragProvider, MockDndEventManager } from 'react-native-nested-drag'

const mockEventManager = new MockDndEventManager()
describe('DropSum', () => {
  it('increase onDrop', () => {
    render(
      <DragProvider mockEventManager={mockEventManager}>
        <DropSum />
      </DragProvider>,
    )
    const sum = screen.queryByText('drop here! Sum: 0')
    expect(sum).toBeTruthy()
    //draggables and droppable may change
    const draggable1 = () => mockEventManager.draggables.find((d) => d.payload == 1)
    const draggable2 = () => mockEventManager.draggables.find((d) => d.payload == 2)
    const droppable = () => mockEventManager.droppables[0]
    jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
    jest.useFakeTimers()
    act(() => {
      mockEventManager.drop(draggable1(), droppable())
    })
    //@ts-ignore
    expect(sum).toHaveTextContent('drop here! Sum: 1')
    act(() => {
      mockEventManager.drop(draggable2(), droppable())
    })
    //@ts-ignore
    expect(sum).toHaveTextContent('drop here! Sum: 3')
  })
})
