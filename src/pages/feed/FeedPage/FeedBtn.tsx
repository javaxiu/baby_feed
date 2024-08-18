import { PlayOutline } from "antd-mobile-icons";
import Pause from '@assets/svg/pause.svg?react';
import './index.scss';
import { createElement, memo, useCallback, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { msFormat } from "../../../utils/helpers";
import { useLatest, useLocalStorageState } from "ahooks";
import { getTimesOfList } from "@utils/helpers";
import { feedSignal, useFeedSignalChange } from "./signal";

interface Props {
  id: 'left' | 'right';
  title: string;
  onChangeTime(key: string, n: number): void;
}

const FeedBtn = memo((props: Props) => {
  const [times, setTimes] = useLocalStorageState<number[]>(`feed-${props.id}-times`, { defaultValue: [] });
  const timesRef = useLatest(times);
  const [seconds, setSeconds] = useState(0);
  const isFirst = useRef(true);
  const isGoing = useLatest(feedSignal.get() === props.id);

  const onClick = useCallback(() => {
    const cur = feedSignal.get();
    if (cur === props.id) {
      feedSignal.set('pause');
    } else {
      feedSignal.set(props.id);
    }
  }, []);

  useEffect(() => {
    setTimes(l => {
      if (isFirst.current) {
        isFirst.current = false
        return l || [];
      }
      return [...(l || []), Date.now()]
    });
  }, [isGoing.current]);

  useEffect(() => {
    let timer = 0;
    const refresh = () => {
      if (isGoing.current) {
        const t = (getTimesOfList(timesRef.current, true, true) || 0);
        setSeconds(t);
        props.onChangeTime(props.id, t);
      }
      timer = setTimeout(refresh, 1000);
    }
    refresh();
    return () => clearInterval(timer);
  }, [])

  useFeedSignalChange('finish', () => {
    setTimes([]);
    setSeconds(0);
  });

  return (
    <div className={classNames("feed-btn", { active: isGoing.current })} onClick={onClick}>
      <div className="feed-btn-title">{props.title}</div>
      {createElement(isGoing.current ? Pause : PlayOutline, {
        className: 'feed-btn-icon',
      })}
      <div className="feed-btn-time">{msFormat(seconds)}</div>
    </div>
  )
});
FeedBtn.displayName = 'FeedBtn';

export default FeedBtn;
