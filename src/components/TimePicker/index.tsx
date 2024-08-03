import dayjs from 'dayjs';
import './index.scss';
import { useState } from 'react';

interface Props {
  placeholder?: string
}

const TimePicker = ({
  placeholder = '啥时候',
}: Props) => {
  const [value, setValue] = useState<string | undefined>();
  return (
    <div className="time-picker">
      <input type="time" value={value} onChange={v => setValue(v.target.value)}/>
      <div className='time-picker-placeholder'>{value ? '' : placeholder}</div>
      <div className='time-picker-value'>{value || ''}</div>
    </div>
  )
}

export default TimePicker;
