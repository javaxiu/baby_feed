import { msFormat } from '@utils/helpers';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import feedGif from '../../assets/feed.gif';
import { feedDataBase } from '../feed/db';
import scheduleDb from '../schedule/db';
import './index.scss';
import FeedChart from './FeedChart';
import PoopChart from './PoopChart';
import { upload } from '@utils/sync';


const EventNotice = () => {
  const list = scheduleDb.useDataBaseRange();
  const data = useMemo(() => {
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
    const dayLeft = date.diff(dayjs(), 'day');
    return [date, dayLeft, latestEvent] as const;
  }, [list]);
  if (!data) return null;
  const [date, dayLeft, latestEvent] = data;
  return (
    <span>
      还有 {dayLeft} 天就要去 <b>{latestEvent.event}</b> 啦 <br /> 是周 {date.day()} 哦
    </span>
  )
}

const TodayFeedStatistics = () => {
  const list = feedDataBase.useDataBaseRange('day');
  const [times, total] = useMemo(() => {
    const totalTimes = list.reduce((acc, cur) => acc + cur.volume, 0);
    return [list.length, totalTimes];
  }, [list])
  return <div className='home-page-today'>今天小满吃了 <b>{times}</b> 次, 一共 <b>{msFormat(total)}</b> 分钟啦</div>
}

export default () => {
  return (
    <div className='home-page'>
      <div className='home-page-greeting' onClick={upload}>
        <div className='home-page-greeting-name'>小满</div>
        <div className='home-page-greeting-days'>已经出生 <b>{dayjs().diff(dayjs('2024-05-20'), 'day')}</b> 天啦</div>
      </div>
      <img src={feedGif} className='home-page-gif'/>
      <TodayFeedStatistics />
      <EventNotice />
      <FeedChart />
      <PoopChart />
    </div>
  );
}