import dayjs from 'dayjs';
import { useMemo } from 'react';
import feedGif from '../../assets/feed.gif';
import scheduleDb from '../schedule/db';
import './index.scss';
import { feedDataBase } from '../feed/db';
import { last } from 'underscore';
import { getTimesOfList } from '../feed/utils';
import { upload } from '../../utils/sync';


const useEventNotice = () => {
  return useMemo(() => {
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
}

const useFeedCount = () => {
  return useMemo(() => {
    const today = dayjs();
    const todayList = feedDataBase.get().filter(record => today.isSame(last(record.times), 'day'));
    const totalTimes = todayList.reduce((prev, cur) => getTimesOfList(cur.times) + prev, 0).toFixed(2);
    // const todayLeft = todayList.filter(item => item.side === 'left').length;
    return <div>今天小满吃了 <b>{todayList.length}</b> 次, 一共 {totalTimes} 分钟啦</div>
  }, [])
}

export default () => {
  const latestEventNotice = useEventNotice();
  const feedNotice = useFeedCount();
  return (
    <div className='home-page'>
      <div>小满已经出生 {dayjs().diff(dayjs('2024-05-20'), 'day')} 天啦</div>
      <div onClick={upload}>妈妈们辛苦啦!</div>
      <img src={feedGif} />
      <div>{latestEventNotice}</div>
      <div>{feedNotice}</div>
    </div>
  );
}