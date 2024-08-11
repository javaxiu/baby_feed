import { PlayOutline } from "antd-mobile-icons";
import Pause from './pause.svg?react';
import './index.scss';
import { createElement, memo, useCallback, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { msFormat } from "../../../utils/helpers";
import { useLatest, useLocalStorageState, useMemoizedFn } from "ahooks";
import { getTimesOfList } from "../utils";
import { Button } from "@components/Button";
import { feedDataBase } from "src/pages/feed/db";
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
  }, [isGoing]);

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

const FeedControl = () => {
  const [times, setTimes] = useState<[number, number]>([0, 0]);
  const { add } = feedDataBase.useDataBaseList();

  const onChangeTime = useMemoizedFn((key: string, t: number) => {
    setTimes(times => key == 'left' ? [t, times[1]] : [times[0], t]);
  });

  const reset = useCallback(() => {
    feedSignal.set('finish');
    setTimes([0, 0]);
  }, []);

  const onClickDone = useCallback(() => {
    add({
      id: Date.now(),
      timestamp: Date.now(),
      left: times[0],
      right: times[1],
      stop: Date.now(),
      volumn: times[0] + times[1],
    });
    reset();
  }, [times]);

  return (
    <div className="feed-control">
      <div className="feed-control-total">
        <b>{msFormat((times[0] + times[1]))}</b>
        <div>一共喂了</div>
      </div>
      <div className="feed-btn-group">
        <FeedBtn title="左边" id="left" onChangeTime={onChangeTime} />
        <FeedBtn title="右边" id="right" onChangeTime={onChangeTime} />
      </div>
      {
        times.filter(Boolean).length === 0 ? null : (
          <div className="feed-control-bottom">
            <Button type="square" onClick={onClickDone}>喂饱啦</Button>
          </div>
        )
      }
    </div>
  )
};

export default FeedControl;
