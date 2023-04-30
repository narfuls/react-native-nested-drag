import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { DragView, DragHandleView } from 'react-native-nested-drag'

export function Draghandle() {
  return (
    <DragView movable>
      <View style={styles.item}>
        <Text>part 1</Text>
        <DragHandleView style={styles.handle}>
          <Text>drag here!</Text>
        </DragHandleView>
        <Text>part 2</Text>
        <DragHandleView style={styles.handle}>
          <Text>drag here!</Text>
        </DragHandleView>
        <Text>part 3</Text>
      </View>
    </DragView>
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 10,
    width: 300,
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  handle: {
    height: 40,
    justifyContent: 'center',
  },
})
