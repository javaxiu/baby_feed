import { RecordList } from "./RecordList";
import './index.scss';
import FeedPage from './FeedPage';
import { LatestPrompt } from './Lastest';
import { useIsFeeding } from './FeedPage/signal';


export default () => {
  const isFeeding = useIsFeeding();

  return (
    <div className="feed-page">
      <div className="page-title">宝宝吃饭笔记</div>
      {
        !isFeeding ? (
          <>
            <RecordList />
            <LatestPrompt />
          </>
        ) : null
      }
      <FeedPage />
    </div>
  )
}