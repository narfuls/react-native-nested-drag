import { StyleSheet, Text, View } from 'react-native'
import React, { PropsWithChildren } from 'react'
import { DragView, DragHandleView } from 'react-native-nested-drag'

export function Nested() {
  return (
    <View style={styles.container}>
      <Draggable>
        <Draggable>
          <Draggable />
        </Draggable>
        <Draggable />
      </Draggable>
    </View>
  )
}

function Draggable({ children }: PropsWithChildren) {
  return (
    <View style={styles.dragContainer}>
      <DragView style={styles.drag}>
        <DragHandleView style={styles.handle}>
          <Text>drag gere!</Text>
        </DragHandleView>
        <View style={styles.child}>{children}</View>
      </DragView>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    padding: 10,
    position: 'absolute',
    width: '100%',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
  },
  dragContainer: {
    padding: 10,
  },
  drag: {
    borderWidth: 1,
    borderRadius: 5,
  },
  child: {
    paddingLeft: 10,
  },
  handle: {
    width: 100,
    height: 40,
    justifyContent: 'center',
  },
})
