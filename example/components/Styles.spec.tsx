import { render, screen, act } from '@testing-library/react-native'
import { ReactTestInstance } from 'react-test-renderer'
import React from 'react'

import { styles, Styles } from './Styles'
import { DragProvider, MockDndEventManager } from 'react-native-nested-drag'

const mockEventManager = new MockDndEventManager()
describe('Styles', () => {
  it('changes styles', () => {
    render(
      <DragProvider mockEventManager={mockEventManager}>
        <Styles />
      </DragProvider>,
    )
    const drop = screen.queryByText('drop here!')?.parent
    expect(drop).toBeTruthy()
    expect(drop.props.style).toEqual(styles.drop)

    //@ts-ignore
    const drag = screen.queryByTestId('draggables').children[0].children[0].children[0]
    expect(drag).toBeTruthy()
    expect((drag as ReactTestInstance).props.style).toEqual(expect.objectContaining(styles.item))

    const draggable1 = () => mockEventManager.draggables[0]
    const droppable = () => mockEventManager.droppables[0]
    jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
    jest.useFakeTimers()
    act(() => {
      mockEventManager.dragStart(draggable1())
    })
    expect((drag as ReactTestInstance).props.style).toEqual(styles.itemDragStyle)
    act(() => {
      mockEventManager.dragEnter(draggable1(), droppable())
    })
    expect((drag as ReactTestInstance).props.style).toEqual(styles.itemOverStyle)
  })
})
