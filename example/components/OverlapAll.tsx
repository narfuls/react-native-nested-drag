import { StyleSheet, Text } from 'react-native'
import React from 'react'

export function OverlapAll() {
  return <Text style={styles.dragHandle}>OverlapAll</Text>
}

const styles = StyleSheet.create({
  dragHandle: {
    minWidth: 50,
    maxWidth: 160,
    height: 30,
    backgroundColor: '#CCC',
  },
})
