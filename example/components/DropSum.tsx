import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useRef, useState } from 'react'

import { DragView, DropView } from 'react-native-nested-drag'

export function DropSum() {
  const [sum, setSum] = useState(0)
  const [disabled, setDisabled] = useState(false)
  const sumRef = useRef(0)
  const add = (num: number) => {
    sumRef.current += num
    setSum(sumRef.current)
  }
  return (
    <View style={styles.container}>
      <DropView
        style={styles.drop}
        disabled={disabled}
        onDrop={(_, payload) => {
          add(payload)
        }}
      >
        <Text>drop here! Sum: {sum}</Text>
        <TouchableOpacity
          onPress={() => {
            setDisabled(!disabled)
          }}
          style={styles.button}
        >
          <Text>toggle</Text>
        </TouchableOpacity>
      </DropView>
      <DragView payload={1}>
        <View style={styles.itemContainer}>
          <Text>+1</Text>
        </View>
      </DragView>
      <DragView payload={2}>
        <View style={styles.itemContainer}>
          <Text>+2</Text>
        </View>
      </DragView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: '5%',
    marginVertical: 10,
    alignItems: 'center',
  },
  drop: {
    marginHorizontal: '5%',
    marginVertical: 10,
    padding: 10,
    width: '90%',
    height: 100,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    borderWidth: 1,
    borderRadius: 5,
    width: '100%',
    height: 40,
    backgroundColor: '#dfd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContainer: {
    marginHorizontal: 60,
    marginVertical: 10,
    width: 200,
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
