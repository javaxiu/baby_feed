import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { chunk } from "underscore";
import drinkingGif from '../../assets/drinking.gif';
import drinkingPauseGif from '../../assets/drinking_pause.gif';
import { FeedAction } from "./StartBtn";
import { getTimesOfList } from "./utils";

export const CurrentPrompt = ({ times, feedState }: { times: number[], feedState: FeedAction }) => {
  const [minutes, setMinutes] = useState(0);
  const groups = chunk(times, 2);
  useEffect(() => {
    let i = 0;
    const update = () => {
      setMinutes(getTimesOfList(times, true))
      i = setTimeout(update, 1000);
    }
    update();
    return () => clearTimeout(i);
  }, [times]);
  return (
    <div className="feed-list current">
      <div className="feed-list-sider">
        <div>宝宝已经吃了 <span className="total-time">{minutes}</span> 分钟啦</div>
        <img src={feedState === FeedAction.feeding ? drinkingGif : drinkingPauseGif} />
        <div>
          宝宝正在{feedState === FeedAction.feeding ? '使劲吃' : '中场休息'}
        </div>
      </div>
      <ul className="feed-list-ul">
        {
          groups?.map(([t1, t2]) => (
            <li key={t1}>
              <div>
                从 {dayjs(t1).format('HH:mm:ss')}
                <span> 到 </span>
                {t2 ? dayjs(t2).format('HH:mm:ss') : '吃着呢'}
              </div>
            </li>
          ))
        }
      </ul>
    </div>
  )
}