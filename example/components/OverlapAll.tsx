import { StyleSheet, Text, View, ViewStyle } from 'react-native'
import React from 'react'
import { DragView, DropView } from 'react-native-nested-drag'

export function OverlapAll() {
  return (
    <>
      <DropView style={styles.drop} overStyle={styles.dropOver}>
        <View>
          <Text>drop outer!</Text>
          <DropView overStyle={styles.dropInnerOver} style={styles.dropInner}>
            <Text>drop inner!</Text>
          </DropView>
        </View>
      </DropView>
      <View style={styles.container}>
        <DragView
          style={styles.item}
          dragStyle={styles.itemDragStyle}
          overStyle={styles.itemOverStyle}
          copyDragStyle={styles.itemDragStyle}
          copyOverStyle={styles.itemOverStyle}
        />
      </View>
    </>
  )
}

const dropStyle: ViewStyle = {
  marginHorizontal: '5%',
  marginVertical: 10,
  padding: 10,
  width: '90%',
  height: 150,
  alignItems: 'center',
  justifyContent: 'space-between',
}
const dropInnerStyle: ViewStyle = {
  marginHorizontal: '5%',
  marginVertical: 10,
  padding: 10,
  width: '90%',
  height: 70,
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
  dropInner: {
    ...dropInnerStyle,
    backgroundColor: '#fff',
  },
  dropInnerOver: {
    ...dropInnerStyle,
    backgroundColor: '#dfd',
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
})
