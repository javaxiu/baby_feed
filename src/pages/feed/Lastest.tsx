import react from 'react';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { last } from 'underscore';
import eatGif from '../../assets/eat.gif';
import fullGif from '../../assets/full.gif';
import hugGif from '../../assets/hug.gif';
import hungryGif from '../../assets/hungry.gif';
import { ring, feedDataBase } from './db';
import { HOUR, MINUTE } from '../../utils/helpers';

export const LatestPrompt = () => {
  const { list } = feedDataBase.useDataBaseList();
  const lastRecord = last(list);
  const lastTime = lastRecord ? dayjs(lastRecord.timestamp + lastRecord.volumn) : dayjs();
  const [passTime, setPassTime] = useState('');
  useEffect(() => {
    let t = 0;
    const update = () => {
      const milsec = dayjs().diff(lastTime);
      const hours = Math.floor(milsec / HOUR);
      const minus = Math.floor((milsec - hours * HOUR) / MINUTE);
      const sec = Math.floor(milsec % MINUTE / 1000);
      setPassTime(`${hours}小时 ${minus}分 ${sec}秒`);
      t = setTimeout(update, 1000);
    }
    update();
    return () => clearTimeout(t);
  }, [lastTime]);
  const diffTime = dayjs().diff(lastTime);

  const image = useMemo(() => {
    if (diffTime > 2*HOUR) return hungryGif;
    if (diffTime > HOUR) return eatGif;
    if (diffTime < HOUR) return fullGif;
    return hugGif;
  }, [diffTime]);
  
  if (!list?.length) return <div>还没有记录耶</div>;
  return (
    <div className="lastest-prompt">
      <div>上次喂宝宝是 {lastTime.format('HH:mm')}</div>
      <div>距离上次喂奶已经 {passTime} 啦</div>
      <div>
        上次喂的是 左边: <b className='lastest-prompt-side'>{lastRecord!.left}</b>
        右边: <b className='lastest-prompt-side'>{lastRecord!.right}</b>哦
      </div>
      <img src={image} />
      { ring.nextNotifyTime ? <div>下次提醒喂宝宝 {dayjs(ring.nextNotifyTime).format('HH:mm:ss')}</div> : null }
    </div>
  )
};