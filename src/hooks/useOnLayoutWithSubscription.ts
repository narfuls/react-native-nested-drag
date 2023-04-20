import { useRef, useContext, useEffect, useCallback } from 'react'
import { View, MeasureOnSuccessCallback } from 'react-native'
import { DragViewLayoutContext } from '../DragContext'
import { SimplePubSub } from '../SimplePubSub'
/** Subscribes to measure view (in nested view 'onLayout' event triggers only once when rendered first time)  */
export const useOnLayoutWithSubscription = ( measureCallback: MeasureOnSuccessCallback) => {
  /** viewRef to measure */
  const viewRef = useRef<View>(null)
  const onLayoutPubSub = useRef(new SimplePubSub()).current
  const parentOnLayout = useContext(DragViewLayoutContext)

  const onLayout = useCallback(() => {
    if (viewRef?.current) {
      viewRef.current.measure(measureCallback)
    }
    onLayoutPubSub.publish()
  }, [onLayoutPubSub, measureCallback])

  useEffect(() => {
    parentOnLayout && parentOnLayout.subscribe(onLayout)
    return () => {
      parentOnLayout && parentOnLayout.unsubscribe(onLayout)
    }
  }, [parentOnLayout, onLayout])

  return { onLayout, onLayoutPubSub, viewRef }
}
