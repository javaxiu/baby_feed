import { useLocalStorageState } from 'ahooks';
import { useCallback, useEffect, useState } from "react";
import { last } from 'underscore';
import { CurrentPrompt } from "./Current";
import { LatestPrompt } from "./Lastest";
import { RecordList } from "./RecordList";
import StartBtn, { FeedAction } from "./StartBtn";
import { FeedRecord, feedDataBase } from "./db";
import './index.scss';
import { getTimesOfList } from "./utils";

export default () => {
  const [feed = FeedAction.none, setFeeding] = useLocalStorageState<FeedAction>('this-feed-state', {defaultValue: FeedAction.none});
  const [feedRecords, setFeedRecords] = useState<FeedRecord[]>([]);
  const [thisFeed = [], setThisFeed] = useLocalStorageState<number[]>('this-feed', {defaultValue: []});
  useEffect(() => {
    setFeedRecords(feedDataBase.read());
  }, []);
  const onSetFeeding = useCallback((state: FeedAction) => {
    setFeeding(state);
    if (state === FeedAction.none) {
      setFeedRecords(list => {
        const newRecord: FeedRecord = {
          id: Date.now(),
          times: thisFeed,
          type: 'mon',
          volumn: getTimesOfList(thisFeed, true)
        };
        const newList: FeedRecord[] = [
          ...list || [],
          newRecord,
        ];
        feedDataBase.write(newRecord);
        return newList;
      });
      setThisFeed([]);
    } else {
      setThisFeed(list => ([...(list || []), Date.now()]));
    }   
  }, [thisFeed]);
  return (
    <div className="feed-page">
      {
        feed === FeedAction.none ? (
          <>
            <RecordList records={feedRecords} refresh={() => setFeedRecords(feedDataBase.read())}/>
            <LatestPrompt record={last(feedRecords)!} feedState={feed}/>
          </>
        ) : (
          <CurrentPrompt times={thisFeed} feedState={feed}/>
        )
      }
      <StartBtn onChange={onSetFeeding} value={feed}/>
    </div>
  )
}