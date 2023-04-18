import { render, screen } from '@testing-library/react-native'
import { Text, ViewStyle, Animated } from 'react-native'
import React from 'react'

import { DragClone } from '../../src/components/DragClone'

jest.setTimeout(10000)
describe('DragClone', () => {
  const uniqueText = 'DragHandleView*-975!@#$%^&*'
  const uniqueStyle: ViewStyle = {
    width: '963',
    height: '825',
    borderColor: '#ebf0f1',
    shadowColor: '#eca0f1',
    backgroundColor: '#eca071',
  }

  beforeEach(() => {
    const clone = {
      draggableDndId: 0,
      style: uniqueStyle,
      pan: new Animated.ValueXY({ x: 100, y: 100 }),
      position: { x: 1, y: 1 },
      opacity: new Animated.Value(0.33),
      children: <Text>{uniqueText}</Text>,
    }
    render(<DragClone clone={clone} providerOffset={{ x: 10, y: 10 }} />)
  })

  it('renders children', () => {
    const child = screen.queryAllByText(uniqueText)
    expect(child.length).toBe(1)
  })

  it('renders style', () => {
    const view = screen.queryByText(uniqueText)?.parent
    expect(view).toBeTruthy()
    if (!view) throw new Error('view is null')

    expect(view.props.style).toEqual({
      ...uniqueStyle,
      left: 11,
      top: 11, // providerOffset + pos
      opacity: 0.33,
      position: 'absolute',
      zIndex: 1,
      transform: [{ translateX: 100 }, { translateY: 100 }],
    })
  })
})
