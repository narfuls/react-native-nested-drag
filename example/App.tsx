import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native'
import React, { useState } from 'react'
import { DragProvider } from 'react-native-nested-drag'

import { DropSum } from './components/DropSum'
import { Styles } from './components/Styles'
import { DragMode } from './components/DragMode'
import { Draghandle } from './components/Draghandle'
import { NestedDrop } from './components/NestedDrop'
import { OverlapAll } from './components/OverlapAll'
import { Nested } from './components/Nested'
import { NestedMovable } from './components/NestedMovable'

enum Pages {
  Styles,
  DragMode,
  Draghandle,
  NestedDrop,
  Nested,
  NestedMovable,
  DropSum,
  OverlapAll,
}

export default function App() {
  const [page, setPage] = useState(Pages.Styles)
  return (
    <View style={styles.container}>
      <View style={styles.menu}>
        {Object.values(Pages)
          .filter((p) => isNaN(Number(p)) !== false)
          .map((p) => (
            <TouchableOpacity
              style={page == Pages[p] ? styles.menuItemCurrent : styles.menuItem}
              key={p}
              onPress={() => {
                setPage(Pages[p])
              }}
            >
              <Text style={page == Pages[p] ? styles.menuTextCurrent : styles.menuText}>{p}</Text>
            </TouchableOpacity>
          ))}
      </View>
      {page != Pages.OverlapAll && (
        <DragProvider>
          {page == Pages.DropSum && <DropSum />}
          {page == Pages.Styles && <Styles />}
          {page == Pages.DragMode && <DragMode />}
          {page == Pages.Draghandle && <Draghandle />}
          {page == Pages.NestedDrop && <NestedDrop />}
          {page == Pages.Nested && <Nested />}
          {page == Pages.NestedMovable && <NestedMovable />}
        </DragProvider>
      )}
      {page == Pages.OverlapAll && (
        <DragProvider overlapMode={'all'}>
          <OverlapAll />
        </DragProvider>
      )}

      <StatusBar style='auto' />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 30,
  },
  menu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  menuItem: {
    height: 30,
    margin: 5,
    paddingHorizontal: 3,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#efe',
  },
  menuItemCurrent: {
    height: 30,
    margin: 5,
    paddingHorizontal: 3,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#cfc',
  },
  menuText: {},
  menuTextCurrent: {
    fontWeight: 'bold',
  },
})
