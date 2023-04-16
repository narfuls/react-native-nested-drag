import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, TouchableOpacity, Vibration, ViewStyle } from 'react-native'
import React, { PropsWithChildren, useState } from 'react'

import { DropSum } from './DropSum'
import { DragView, DropView, DragHandleView, DragProvider, IPosition } from 'react-native-nested-drag'

export interface IDragItemProps {
  id: number
}

function Draggable({ children, id }: PropsWithChildren<IDragItemProps>) {
  return (
    <DragView style={styles.itemContainer} payload={id}>
      <View style={styles.itemRow}>
        <Text style={styles.dragHandle}>Draggable +{id}</Text>
        <Text style={styles.text}>text222</Text>
        <TouchableOpacity onPress={() => console.log('press Draggable ' + id)}>
          <Text style={styles.text}>press</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onLongPress={() => {
            console.log('onLongPress Draggable ' + id)
            Vibration.vibrate(50)
          }}
        >
          <Text style={styles.text}>LongPress</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.itemSub}>{children}</View>
    </DragView>
  )
}

function DraggableStay({ children, id }: PropsWithChildren<IDragItemProps>) {
  const [movable, setMovable] = useState(true)
  const [movableOffset, setMovableOffset] = useState({ x: 0, y: 0 })
  return (
    <View style={{ ...styles.itemContainer, marginTop: 5 }}>
      <DragView style={styles.itemContainer} payload={id} movable={movable} movableOffset={movableOffset}>
        <View style={{ ...styles.itemContainer, marginTop: 5 }}>
          <View style={styles.itemRow}>
            <Text style={styles.dragHandle}>DraggableStay +{id}</Text>
            <Text style={styles.text}>text222</Text>
            <TouchableOpacity
              onPress={() => {
                console.log('press DraggableStay ' + id)
                setMovable(!movable)
              }}
            >
              <Text style={styles.text}>press</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onLongPress={() => {
                console.log('onLongPress DraggableStay ' + id)
                Vibration.vibrate(50)
                setMovableOffset({ x: movableOffset.x + 3, y: movableOffset.y - 3 })
              }}
            >
              <Text style={styles.text}>LongPress</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.itemSub}>{children}</View>
        </View>
      </DragView>
    </View>
  )
}

function UndraggableHandle({ children, id }: PropsWithChildren<IDragItemProps>) {
  const [undraggable, setUndraggable] = useState(true)
  const [delay, setDelay] = useState(0)
  const [vibro, setVibro] = useState(0)
  return (
    <DragView style={styles.itemContainer} disabled={undraggable} payload={id} vibroDuration={vibro} longPressDelay={delay}>
      <View style={styles.itemRow}>
        <DragHandleView>
          <Text style={styles.dragHandle}>UndraggableHandle +{id}</Text>
        </DragHandleView>
        <TouchableOpacity
          onPress={() => {
            console.log('setUndraggable  press UndraggableHandle ' + id)
            setUndraggable(!undraggable)
          }}
        >
          <Text style={styles.text}>press</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onLongPress={() => {
            console.log('setDelay  onLongPress UndraggableHandle ' + id)
            Vibration.vibrate(50)
            setDelay(delay == 0 ? 500 : 0)
            setVibro(vibro == 0 ? 50 : 0)
          }}
        >
          <Text style={styles.text}>LongPress</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.itemSub}>{children}</View>
    </DragView>
  )
}

function DraggableHandle({ children, id }: PropsWithChildren<IDragItemProps>) {
  const [style, setStyle] = useState<ViewStyle>(styles.itemContainer)
  const [copyDragStyle, setCopyDragStyle] = useState<ViewStyle>(styles.itemContainer)
  const [copyOverStyle, setCopyOverStyle] = useState<ViewStyle>(styles.itemContainer)
  const [dragStyle, setDragStyle] = useState<ViewStyle>(styles.itemContainer)
  const [overStyle, setOverStyle] = useState<ViewStyle>(styles.itemContainer)
  const [payload, setPayload] = useState(id)
  return (
    <DragView payload={payload} style={style} dragStyle={dragStyle} overStyle={overStyle} copyDragStyle={copyDragStyle} copyOverStyle={copyOverStyle}>
      <View style={styles.itemRow}>
        <DragHandleView>
          <Text style={styles.dragHandle}>DraggableHandle +{payload}</Text>
        </DragHandleView>
        <Text style={styles.text}>text222</Text>
        <TouchableOpacity
          onPress={() => {
            console.log('press DraggableHandle ' + payload)
            setStyle({ ...styles.itemContainer, backgroundColor: 'brown' })
            setCopyDragStyle({ ...styles.itemContainer, backgroundColor: 'green' })
            setCopyOverStyle({ ...styles.itemContainer, backgroundColor: 'red' })
            setDragStyle({ ...styles.itemContainer, opacity: 0.3, backgroundColor: 'red' })
            setOverStyle({ ...styles.itemContainer, opacity: 0.5 })
            setPayload(10000 + payload)
          }}
        >
          <Text style={styles.text}>press</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onLongPress={() => {
            console.log('onLongPress DraggableHandle ' + payload)
            Vibration.vibrate(50)
          }}
        >
          <Text style={styles.text}>LongPress</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.itemSub}>{children}</View>
    </DragView>
  )
}

function DraggableLayout({ children, id }: PropsWithChildren<IDragItemProps>) {
  const [style, setStyle] = useState<ViewStyle>(styles.itemContainer)
  const [movableOffset] = useState<IPosition>({ x: 50, y: -10 })
  return (
    <View style={{ ...styles.itemContainer, transform: [{ translateX: -10 }, { translateY: 5 }] }}>
      <DragView
        movable
        style={styles.itemContainer}
        movableOffset={movableOffset}
        copyDragStyle={{ ...styles.itemContainer, backgroundColor: 'green' }}
        copyOverStyle={{ ...styles.itemContainer, backgroundColor: 'red' }}
        payload={id}
        dragStyle={{ opacity: 0.3 }}
      >
        <View style={{ ...styles.itemContainer, transform: [{ translateX: -10 }, { translateY: 5 }] }}>
          <View style={styles.itemRow}>
            <DragHandleView>
              <Text style={styles.dragHandle}>DraggableLayout +{id}</Text>
            </DragHandleView>
            <Text style={style}>text222</Text>
            <TouchableOpacity
              onPress={() => {
                console.log('press DraggableLayout ' + id)
                setStyle({ ...styles.itemContainer, height: 50, borderRadius: 10 })
              }}
            >
              <Text style={styles.text}>press</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.itemSub}>{children}</View>
        </View>
      </DragView>
    </View>
  )
}

function LongPressHandle({ children, id }: PropsWithChildren<IDragItemProps>) {
  return (
    <DragView style={styles.itemContainer} longPressDelay={600} vibroDuration={50} payload={id}>
      <View style={styles.itemRow}>
        <DragHandleView>
          <Text style={styles.dragHandle}>LongPressHandle +{id}</Text>
        </DragHandleView>
        <TouchableOpacity onPress={() => console.log('press LongPressHandle ' + id)}>
          <Text style={styles.text}>press</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onLongPress={() => {
            console.log('onLongPress LongPressHandle ' + id)
            Vibration.vibrate(50)
          }}
        >
          <Text style={styles.text}>LongPress</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.itemSub}>{children}</View>
    </DragView>
  )
}

export default function App() {
  return (
    <View style={styles.container}>
      <DragProvider>
        <DropView
          onDrop={(pos, payload) => {
            console.log('drop' + JSON.stringify(pos) + ' id:' + payload)
          }}
        >
          <Text style={styles.dragHandle}>drop here************!</Text>
        </DropView>
        <Draggable id={3}></Draggable>
        <UndraggableHandle id={5}>
          <UndraggableHandle id={51}></UndraggableHandle>
          <DraggableHandle id={71}></DraggableHandle>
        </UndraggableHandle>
        <LongPressHandle id={6}>
          <DropView
            payload={0}
            onDrop={(pos, payload, next) => {
              console.log('dropin' + JSON.stringify(pos) + ' id:' + payload)
              next && next()
            }}
          >
            <Text style={styles.dragHandle}>drop here************!</Text>
            <DropView
              payload={1}
              onDrop={(pos, payload) => {
                console.log('dropin 1' + JSON.stringify(pos) + ' id:' + payload)
              }}
            >
              <Text style={styles.dragHandle}>drop here************!</Text>
            </DropView>
            <DropView
              payload={2}
              onDrop={(pos, payload) => {
                console.log('dropin 2' + JSON.stringify(pos) + ' id:' + payload)
              }}
            >
              <Text style={styles.dragHandle}>drop here************!</Text>
            </DropView>
          </DropView>
          <LongPressHandle id={62}></LongPressHandle>
          <DraggableHandle id={72}></DraggableHandle>
        </LongPressHandle>
        <DropSum />
        <DraggableStay id={2}>
          <DraggableStay id={21}></DraggableStay>
        </DraggableStay>
        <DraggableLayout id={90}>
          <DraggableHandle id={93}>
            <DraggableLayout id={931} />
          </DraggableHandle>
          <DraggableLayout id={91}>
            <DraggableLayout id={92} />
          </DraggableLayout>
        </DraggableLayout>
      </DragProvider>
      <StatusBar style='auto' />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    margin: 1,
  },
  itemContainer: {
    borderWidth: 1,
  },
  itemRow: {
    flexDirection: 'row',
  },
  itemSub: {
    paddingLeft: 20,
  },
  dropContainer: {
    width: '90%',
    height: 100,
    backgroundColor: '#CFC',
    marginBottom: 5,
  },
  dragContainer: {
    flexDirection: 'row',
    marginBottom: 5,
    borderWidth: 1,
  },
  dragHandle: {
    minWidth: 40,
    maxWidth: 160,
    height: 30,
    backgroundColor: '#CCC',
  },
  text: {
    borderWidth: 1,
    height: 30,
  },
  titleText: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: 'bold',
  },
  box: {
    height: 50,
    width: '90%',
    borderWidth: 1,
    borderRadius: 5,
  },
})
