import { useCallback } from 'react';
import './index.scss';
import classNames from 'classnames';

export enum FeedAction {
  none,
  feeding,
  pause
}

interface IProps {
  value: FeedAction,
  onChange(action: FeedAction ): void;
}

export default ({ value, onChange }: IProps) => {
  const onStart = useCallback(() => {
    onChange(value === FeedAction.feeding ? FeedAction.pause : FeedAction.feeding);
  }, [value]);
  return (
    <div className='start-btn-group'>
      <div
        className={classNames('start-btn', {
          start: value !== FeedAction.feeding,
          pause: value === FeedAction.feeding
        })}
        onClick={onStart}
      />
      <div
        className={classNames('start-btn reset', { hide: value === FeedAction.none })}
        onClick={() => onChange(FeedAction.none)}
      />
    </div>
  )
}