import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'

import { DragView, DropView } from 'react-native-nested-drag'

export function DragMode() {
  const [disabled, setDisabled] = useState(false)
  const [movable, setMovable] = useState(true)
  const [disabledDraggable, setDisabledDraggable] = useState(false)
  const [delay, setDelay] = useState(0)
  const [vibro, setVibro] = useState(0)
  return (
    <View style={styles.container}>
      <DropView style={styles.drop} disabled={disabled}>
        <Text>drop here!</Text>
        <TouchableOpacity
          onPress={() => {
            setDisabled(!disabled)
          }}
          style={styles.button}
        >
          <Text>toggle disable</Text>
        </TouchableOpacity>
      </DropView>
      <DragView movable={movable} disabled={disabledDraggable} vibroDuration={vibro} longPressDelay={delay}>
        <View style={styles.item}>
          <Text>drag me</Text>
          <TouchableOpacity
            onPress={() => {
              setMovable(!movable)
            }}
            style={styles.itemButton}
          >
            <Text>movable</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setDisabledDraggable(!disabledDraggable)
            }}
            style={styles.itemButton}
          >
            <Text>disable</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setDelay(delay == 0 ? 500 : 0)
              setVibro(vibro == 0 ? 50 : 0)
            }}
            style={styles.itemButton}
          >
            <Text>longpress</Text>
          </TouchableOpacity>
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
  item: {
    flexDirection: 'row',
    marginHorizontal: 60,
    marginVertical: 10,
    width: 300,
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemButton: {
    borderWidth: 1,
    borderRadius: 5,
    width: 70,
    height: 40,
    backgroundColor: '#dfd',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
