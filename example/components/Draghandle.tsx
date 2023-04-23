import { StyleSheet, Text } from 'react-native'
import React from 'react'

export function Draghandle() {
  return <Text style={styles.dragHandle}>Draghandle</Text>
}

const styles = StyleSheet.create({
  dragHandle: {
    minWidth: 50,
    maxWidth: 160,
    height: 30,
    backgroundColor: '#CCC',
  },
})
