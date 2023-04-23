import { StyleSheet, Text, View, ViewStyle } from 'react-native'
import React from 'react'

import { DragView, DropView } from 'react-native-nested-drag'

export function Styles() {
  return (
    <>
      <DropView style={styles.drop} overStyle={styles.dropOver}>
        <Text>drop here! </Text>
      </DropView>
      <View style={styles.container}>
        <DragView
          style={styles.item}
          dragStyle={styles.itemDragStyle}
          overStyle={styles.itemOverStyle}
          copyDragStyle={styles.itemCopyDragStyle}
          copyOverStyle={styles.itemCopyOverStyle}
        />
        <DragView movable style={styles.item} dragStyle={styles.itemDragStyle} overStyle={styles.itemOverStyle} />
      </View>
    </>
  )
}

const dropStyle: ViewStyle = {
  marginHorizontal: '5%',
  marginVertical: 10,
  padding: 10,
  width: '90%',
  height: 100,
  alignItems: 'center',
  justifyContent: 'space-between',
}
const dragStyle: ViewStyle = {
  width: 100,
  height: 100,
  borderWidth: 1,
  borderRadius: 50,
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  drop: {
    ...dropStyle,
    backgroundColor: '#ddd',
  },
  dropOver: {
    ...dropStyle,
    backgroundColor: '#dfd',
  },
  item: {
    ...dragStyle,
  },
  itemDragStyle: {
    ...dragStyle,
    backgroundColor: '#cfd',
  },
  itemOverStyle: {
    ...dragStyle,
    backgroundColor: '#6f6',
  },
  itemCopyDragStyle: {
    ...dragStyle,
    backgroundColor: '#c6d',
  },
  itemCopyOverStyle: {
    ...dragStyle,
    backgroundColor: '#6fd',
  },
})
