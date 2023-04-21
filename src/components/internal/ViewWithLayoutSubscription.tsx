import { View, MeasureOnSuccessCallback, ViewProps } from 'react-native'
import React, { useRef, useContext, PropsWithChildren, useEffect, useCallback } from 'react'

import { DragViewLayoutContext } from '../../DragContext'
import { SimplePubSub } from '../../SimplePubSub'

export interface IViewWithLayoutSubscriptionProps extends ViewProps {
  measureCallback: MeasureOnSuccessCallback
}

/** 'ref' and 'onLayout' props will be overwriten */
export function ViewWithLayoutSubscription(props: PropsWithChildren<IViewWithLayoutSubscriptionProps>) {
  /** viewRef to measure */
  const viewRef = useRef<View>(null)
  const onLayoutPubSub = useRef(new SimplePubSub()).current
  const parentOnLayout = useContext(DragViewLayoutContext)

  const onLayout = useCallback(() => {
    if (viewRef?.current) {
      viewRef.current.measure(props.measureCallback)
    }
    onLayoutPubSub.publish()
  }, [onLayoutPubSub, props.measureCallback])

  useEffect(() => {
    parentOnLayout && parentOnLayout.subscribe(onLayout)
    return () => {
      parentOnLayout && parentOnLayout.unsubscribe(onLayout)
    }
  }, [parentOnLayout, onLayout])

  return (
    <DragViewLayoutContext.Provider value={onLayoutPubSub}>
      <View {...props} ref={viewRef} onLayout={onLayout}>
        {props.children}
      </View>
    </DragViewLayoutContext.Provider>
  )
}
