import { RecordList } from "./RecordList";
import './index.scss';
import FeedControl from './FeedPage';
import { LatestPrompt } from './Lastest';
import { useIsFeeding } from './FeedPage/signal';


export default () => {
  const isFeeding = useIsFeeding();

  return (
    <div className="feed-page">
      {
        !isFeeding ? (
          <>
            <RecordList />
            <LatestPrompt />
          </>
        ) : null
      }
      <FeedControl />
    </div>
  )
}