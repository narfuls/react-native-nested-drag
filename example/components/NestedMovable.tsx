import { StyleSheet, Text, View } from 'react-native'
import React, { PropsWithChildren, useState } from 'react'
import { DragView, DragHandleView, IPosition, DraggableEnd, zeroPoint } from 'react-native-nested-drag'

export function NestedMovable() {
  const [offset1, setOffset1] = useState(zeroPoint)
  const [offset11, setOffset11] = useState(zeroPoint)
  const [offset12, setOffset12] = useState(zeroPoint)
  const [offset111, setOffset111] = useState(zeroPoint)
  return (
    <View style={styles.container}>
      <Draggable payload={1} offset={offset1} setOffset={setOffset1}>
        <Draggable payload={11} offset={offset11} setOffset={setOffset11}>
          <Draggable payload={111} offset={offset111} setOffset={setOffset111} />
        </Draggable>
        <Draggable payload={12} offset={offset12} setOffset={setOffset12} />
      </Draggable>
    </View>
  )
}

interface IDraggableProps {
  payload: number
  offset: IPosition
  setOffset: React.Dispatch<React.SetStateAction<IPosition>>
}
function Draggable({ children, payload, offset = zeroPoint, setOffset }: PropsWithChildren<IDraggableProps>) {
  const saveOffset: DraggableEnd = (_, offset: IPosition) => {
    setOffset(offset)
  }
  return (
    <View style={styles.dragContainer}>
      <DragView
        payload={payload}
        movableOffset={offset}
        onDragEnd={saveOffset}
        movable
        style={styles.draggable}
        dragStyle={styles.draggableDrag}
        copyDragStyle={styles.draggableClone}
      >
        <DragHandleView style={styles.handle}>
          <Text>drag here!</Text>
        </DragHandleView>
        <View style={styles.child}>{children}</View>
      </DragView>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    padding: 10,
    width: '100%',
    justifyContent: 'flex-start',
  },
  dragContainer: {
    padding: 10,
  },
  draggable: {
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  draggableDrag: {
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#dfd',
    opacity: 0.2,
  },
  draggableClone: {
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#dfd',
  },
  child: {
    paddingLeft: 10,
  },
  handle: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
