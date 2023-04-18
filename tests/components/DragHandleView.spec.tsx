import { render, screen } from '@testing-library/react-native'
import { Text, ViewStyle } from 'react-native'
import React from 'react'

import { DragHandleContext } from '../../src/DragContext'
import { DragHandleView, IDragHandleContext } from '../../src/'

jest.setTimeout(10000)
describe('DragHandleView', () => {
  const uniqueText = 'DragHandleView*-975!@#$%^&*'
  const uniqueStyle: ViewStyle = {
    width: '963',
    height: '825',
    borderColor: '#ebf0f1',
    shadowColor: '#eca0f1',
    backgroundColor: '#eca071',
  }
  const panHandlers = { accessibilityHint: uniqueText }
  let setHandleExists = jest.fn()

  beforeEach(() => {
    setHandleExists = jest.fn()
    const context: IDragHandleContext = {
      setHandleExists: setHandleExists,
      panHandlers: panHandlers as any,
    }
    render(
      <DragHandleContext.Provider value={context}>
        <DragHandleView style={uniqueStyle}>
          <Text>{uniqueText}</Text>
        </DragHandleView>
      </DragHandleContext.Provider>,
    )
  })

  it('renders children', () => {
    const child = screen.queryAllByText(uniqueText)
    expect(child.length).toBe(1)
  })

  it('renders style', () => {
    const view = screen.queryByText(uniqueText)?.parent
    expect(view).toBeTruthy()
    if (!view) throw new Error('view is null')

    expect(view.props.style).toEqual(uniqueStyle)
  })

  it('calls setHandleExists from context', () => {
    expect(setHandleExists).toHaveBeenCalledTimes(1)
  })

  it('renders panHandlers from context', () => {
    const view = screen.queryByText(uniqueText)?.parent
    expect(view).toBeTruthy()
    if (!view) throw new Error('view is null')

    // no need actual responder. just check that it spreads whatever it recieves
    expect(view.props.accessibilityHint).toEqual(uniqueText)
  })
})
