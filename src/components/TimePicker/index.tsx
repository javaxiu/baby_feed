import { forwardRef, useCallback, useImperativeHandle, memo, useState } from 'react';
import { CloseOutline } from 'antd-mobile-icons'
import dayjs from 'dayjs';
import './index.scss';
import classNames from 'classnames';

interface Props {
  border?: boolean
  placeholder?: string
  value?: number,
  onChange?(t: number): void
}

export interface TimePickerRef {
  getValue(): number
}

const TimePicker = forwardRef<TimePickerRef, Props>(({
  border,
  placeholder = '啥时候',
  value,
  onChange,
}: Props, ref) => {
  useImperativeHandle(ref, () => ({
    getValue() {
      return value || Date.now();
    }
  }));
  const [localValue, setLocalValue] = useState<number>();
  const onValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let d = dayjs();
    const [hour, min] = e.target.value.split(':').map(Number);
    d = d.hour(hour).minute(min);
    setLocalValue(+d);
    onChange?.(+d);
  }, []);
  const strVal = localValue ? dayjs(localValue).format('HH:mm') : '';
  return (
    <div className={classNames("time-picker", { border })}>
      <input type="time" value={strVal} onChange={onValueChange}/>
      <div className='time-picker-placeholder'>{localValue ? '' : placeholder}</div>
      <div className='time-picker-value'>{strVal || ''}</div>
      <CloseOutline className={classNames('time-picker-clear', {show: localValue})} onClick={() => setLocalValue(0)}/>
    </div>
  )
})

export default memo(TimePicker);
