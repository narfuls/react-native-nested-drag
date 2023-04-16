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
    const sum = screen.queryByText('sum: 0')

    const draggable1 = mockEventManager.draggables.find((d) => d.payload == 1)
    const draggable2 = mockEventManager.draggables.find((d) => d.payload == 2)
    const droppable = mockEventManager.droppables[0]
    jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
    jest.useFakeTimers()
    act(() => {
      mockEventManager.drop(draggable1, droppable, undefined)
      mockEventManager.drop(draggable2, droppable, undefined)
    })
    //@ts-ignore
    expect(sum).toHaveTextContent('sum: 3')
  })
})
