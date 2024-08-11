import { useMemoizedFn } from 'ahooks';
import { useEffect } from 'react';
import { Signal, useSignal } from 'use-signals';

type FeedSignal = 'finish' | 'left' | 'right' | 'init' | 'pause';
export const feedSignal = new Signal.State<FeedSignal>('init');

export const useFeedSignal = () => useSignal(feedSignal);

export const useFeedSignalChange = (s: FeedSignal | null, callback: (s: FeedSignal) => void) => {
  const signal = useSignal(feedSignal);
  const cb = useMemoizedFn(callback);

  useEffect(() => {
    if (s && s !== signal) return;
    cb(signal);
  }, [signal]);
}

// export const sendFeedSignal = (s: FeedSignal) => feedSignal.set(s);
