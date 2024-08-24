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
    <div className="text-center text-base">
      <div className='flex items-center justify-center'>
        <div>上次 {dayjs(lastTime).format('HH:mm')}</div>
        <div className='ml-1'>
          左: <b>{msFormat(latest!.left || 0)}</b>,
          右: <b>{msFormat(latest!.right || 0)}</b> 哦
        </div>
      </div>

      <div className='flex items-center justify-center mb-1 mt-2 text-base'>
        距离上次喂奶已经
        <b className='text-3xl text-second px-2'>
          {passTime}
        </b> 啦
      </div>
      {
        ring.nextNotifyTime ? 
          <div className='mb-2 flex justify-center items-center'>
            下次提醒喂宝宝
            <span className='text-primary text-3xl font-bold ml-2'>
              {dayjs(ring.nextNotifyTime).format('HH:mm')}
            </span>
          </div>
        : null
      }
      
      <img src={image} className='w-1/3 mx-auto'/>
    </div>
  )
};