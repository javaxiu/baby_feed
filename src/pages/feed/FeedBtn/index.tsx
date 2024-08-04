import { PlayOutline } from "antd-mobile-icons";
import Pause from './pause.svg?react';
import './index.scss';
import { createElement, forwardRef, memo, useCallback, useEffect, useState } from "react";
import classNames from "classnames";
import { msFormat } from "../../../utils/helpers";
import { useLocalStorageState, useMemoizedFn } from "ahooks";

interface Props {
  id: string;
  title: string;
  going: boolean;
  onChangeTime(key: string, n: number): void;
  onChangeState(key: string, going: boolean): void
}

const FeedBtn = memo((props: Props) => {
  const [second = 0, setSecond] = useLocalStorageState<number>(`feed-${props.id}-start`, { defaultValue: 0 });

  const onClick = useCallback(() => {
    props.onChangeState(props.id, !props.going)
  }, [props.onChangeState, props.going]);

  useEffect(() => {
    if (!props.going) return;
    const timer = setInterval(() => {
      setSecond(t => {
        const next = (t || 0) + 1;
        props.onChangeTime(props.id, next);
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [props.going])

  return (
    <div className={classNames("feed-btn", { active: props.going })}>
      <div className="feed-btn-title">{props.title}</div>
      {createElement(props.going ? Pause : PlayOutline, {
        className: 'feed-btn-icon',
        onClick,
      })}
      <div className="feed-btn-time">{msFormat(second * 1000)}</div>
    </div>
  )
})

interface FeedControlProps {

}

const FeedControl = forwardRef(() => {
  const [status, setStatus] = useLocalStorageState<'left' | 'right' | 'none'>('feed-control', { defaultValue: 'none' });
  const [times, setTimes] = useState([0, 0]);

  const onChangeState = useMemoizedFn((key: 'left' | 'right', going: boolean) => {
    if (going) {
      setStatus(key)
    } else {
      setStatus('none');
    }
  });

  const onChangeTime = useMemoizedFn((key: string, t: number) => {
    setTimes(times => key == 'left' ? [t, times[1]] : [times[0], t]);
  });

  return (
    <div className="feed-control">
      <div className="feed-control-total">
        <b>{msFormat((times[0] + times[1]) * 1000)}</b>
        <div>一共喂了</div>
      </div>
      <div className="feed-btn-group">
        <FeedBtn title="左边" id="left" going={status === 'left'} onChangeState={onChangeState} onChangeTime={onChangeTime} />
        <FeedBtn title="右边" id="right" going={status === 'right'}  onChangeState={onChangeState} onChangeTime={onChangeTime} />
      </div>
    </div>
  )
});

export default FeedControl;
