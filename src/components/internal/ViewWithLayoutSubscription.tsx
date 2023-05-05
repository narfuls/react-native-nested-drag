import { View, MeasureOnSuccessCallback, ViewProps, LayoutChangeEvent } from 'react-native'
import React, { useRef, useContext, useEffect, useCallback, useMemo } from 'react'

import { DragViewLayoutContext } from '../../DragContext'
import { SimplePubSub } from '../../SimplePubSub'

export interface IViewWithLayoutSubscriptionProps extends ViewProps {
  measureCallback: MeasureOnSuccessCallback
}

/** 'ref' and 'onLayout' props will be overwriten */
export function ViewWithLayoutSubscription({ measureCallback, onLayout: onLayoutProp, ...props }: IViewWithLayoutSubscriptionProps) {
  /** viewRef to measure */
  const viewRef = useRef<View>(null)
  const onLayoutPubSub = useRef(new SimplePubSub()).current
  const parentOnLayout = useContext(DragViewLayoutContext)

  const onLayout = useCallback(
    (evt?: LayoutChangeEvent) => {
      if (viewRef?.current) {
        viewRef.current.measure(measureCallback)
      }
      onLayoutPubSub.publish()
      onLayoutProp && evt && onLayoutProp(evt)
    },
    [onLayoutPubSub, measureCallback, onLayoutProp],
  )

  useEffect(() => {
    parentOnLayout && parentOnLayout.subscribe(onLayout)
    return () => {
      parentOnLayout && parentOnLayout.unsubscribe(onLayout)
    }
  }, [parentOnLayout, onLayout])

  const viewProps = useMemo(() => ({ ...props, onLayout: onLayout }), [props, onLayout])
  return (
    <DragViewLayoutContext.Provider value={onLayoutPubSub}>
      <View {...viewProps} ref={viewRef}>
        {props.children}
      </View>
    </DragViewLayoutContext.Provider>
  )
}
