import dayjs from 'dayjs';
import { createRef, useEffect, useMemo, useState } from 'react';
import { last } from 'underscore';
import eatGif from '../../assets/eat.gif';
import eatingGif from '../../assets/eating.gif';
import eatPauseGif from '../../assets/eatpause.gif';
import fullGif from '../../assets/full.gif';
import hugGif from '../../assets/hug.gif';
import hungryGif from '../../assets/hungry.gif';
import { FeedAction } from './StartBtn';
import { FeedRecord } from './db';
import mamaMp3 from '../../assets/mama.mp3';
import ReactDOM from 'react-dom/client';

const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;

const ring = (() => {
  const container = document.createElement('div');
  document.body.append(container);
  const el = createRef<HTMLAudioElement>();
  ReactDOM.createRoot(container).render(<audio src={mamaMp3} ref={el}/>);
  return (play: boolean) => {
    if (!el.current) return;
    const status = !el.current.paused;
    if (status && !play) {
      el.current.pause();
      el.current.currentTime = 0
    }
    if (!status && play) {
      el.current?.play();
    }
  }
})();


export const LatestPrompt = ({ record, feedState }: { record?: FeedRecord, feedState: FeedAction }) => {
  if (!record) return <div>还没有记录耶</div>;
  const lastTime = dayjs(last(record.times));
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
    if (feedState === FeedAction.feeding) return eatingGif;
    if (feedState === FeedAction.pause) return eatPauseGif;
    if (diffTime > 2*HOUR) return hungryGif;
    if (diffTime > HOUR) return eatGif;
    if (diffTime < HOUR) return fullGif;
    return hugGif;
  }, [diffTime, feedState]);

  useEffect(() => {
    ring(diffTime > 2.9*HOUR)
  }, [diffTime]);

  useEffect(() => {
    return () => {
      ring(false);
    }
  }, []);
  
  return (
    <div className="lastest-prompt">
      <div>上次喂宝宝是 {lastTime.format('HH:mm')}</div>
      <div>距离上次喂奶已经 {passTime} 啦</div>
      <img src={image} />
    </div>
  )
};