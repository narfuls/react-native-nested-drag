import { StyleSheet, Text, View, TouchableOpacity, Vibration, ViewStyle } from 'react-native'
import React, { PropsWithChildren, useRef, useState } from 'react'

import { DragView, DropView, DragHandleView, DragProvider, IPosition } from 'react-native-nested-drag'

export interface IDragItemProps {
  id: number
}

export function DropSum() {
  const [sum, setSum] = useState(0)
  const [disabled, setDisabled] = useState(false)
  const sumRef = useRef(0)
  const add = (num: number) => {
    sumRef.current += num
    setSum(sumRef.current)
  }
  return (
    <>
      <DropView
        disabled={disabled}
        onDrop={(_, payload) => {
          add(payload)
        }}
      >
        <Text style={styles.dragHandle}>sum: {sum}</Text>
        <TouchableOpacity
          onPress={() => {
            setDisabled(!disabled)
          }}
        >
          <Text style={styles.dragHandle}>toggle</Text>
        </TouchableOpacity>
      </DropView>
      <DragView style={styles.itemContainer} payload={1}>
        <Text style={styles.dragHandle}>+1</Text>
      </DragView>
      <DragView style={styles.itemContainer} payload={2}>
        <Text style={styles.dragHandle}>+2</Text>
      </DragView>
    </>
  )
}

const styles = StyleSheet.create({
  itemContainer: {
    borderWidth: 1,
  },
  dragHandle: {
    minWidth: 50,
    maxWidth: 160,
    height: 30,
    backgroundColor: '#CCC',
  },
})
