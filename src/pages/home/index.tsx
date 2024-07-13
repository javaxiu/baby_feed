import dayjs from 'dayjs';
import { useMemo } from 'react';
import feedGif from '../../assets/feed.gif';
import scheduleDb from '../schedule/db';
import './index.scss';

export default () => {
  const latestEventNotice = useMemo(() => {
    const list = scheduleDb.get();
    if(!list.length) return null;

    let latestEvent;
    const today = +dayjs().startOf('day');
    for (let i = 1; i < list.length; i++) {
      const cur = list[i];
      if (today > cur.date) continue;
      if (today < cur.date && !latestEvent) {
        latestEvent = cur;
        continue;
      }
      if (!latestEvent) continue;
      console.log(new Date(cur.date), new Date(latestEvent.date))
      if (cur.date < latestEvent.date) {
        latestEvent = cur;
      }
    };

    if (!latestEvent) return null;
  
    const date = dayjs(latestEvent.date);
    const dayleft = date.diff(dayjs(), 'day');
    return <span>还有 {dayleft} 天就要去 <b>{latestEvent.event}</b> 啦 <br /> 是周 {date.day()} 哦</span>;
  }, []);
  return (
    <div className='home-page'>
      <div>小满已经出生 {dayjs().diff(dayjs('2024-05-20'), 'day')} 天啦</div>
      <div>妈妈们辛苦啦!</div>
      <img src={feedGif} />
      <div>{latestEventNotice}</div>
    </div>
  );
}