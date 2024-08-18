import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import eatGif from '@assets/eat.gif';
import fullGif from '@assets/full.gif';
import hugGif from '@assets/hug.gif';
import hungryGif from '@assets/hungry.gif';
import { ring, feedDataBase } from './db';
import { HOUR, msFormat } from '@utils/helpers';
import { useUpdate } from 'ahooks';

export const LatestPrompt = () => {
  const latest = feedDataBase.useLatest();
  const lastTime = latest?.stop || 0;
  const forceUpdate = useUpdate();
  useEffect(() => {
    let t = 0;
    const update = () => {
      forceUpdate();
      t = setTimeout(update, 1000);
    }
    update();
    return () => clearTimeout(t);
  }, []);

  const diffTime = dayjs().diff(lastTime);
  const [image, passTime] = useMemo(() => {
    let gif = hugGif;
    if (diffTime > 2*HOUR) gif = hungryGif;
    if (diffTime > HOUR) gif = eatGif;
    if (diffTime < HOUR) gif = fullGif;
    return [gif, msFormat(diffTime)];
  }, [diffTime]);
  
  if (!latest) return <div>还没有记录耶</div>;

  return (
    <div className="lastest-prompt">
      <div>上次喂宝宝是 {dayjs(lastTime).format('HH:mm')}</div>
      <div>距离上次喂奶已经 <b className='lastest-prompt-pass-time'>{passTime}</b> 啦</div>
      <div>
        上次 左边: <b>{msFormat(latest!.left || 0)}</b>,
        右边: <b>{msFormat(latest!.right || 0)}</b> 哦
      </div>
      <img src={image} className='lastest-prompt-gif'/>
      { ring.nextNotifyTime ? <div>下次提醒喂宝宝 {dayjs(ring.nextNotifyTime).format('HH:mm:ss')}</div> : null }
    </div>
  )
};