import { useLocalStorageState } from 'ahooks';
import { useCallback } from "react";
import { last } from 'underscore';
import { CurrentPrompt } from "./Current";
import { LatestPrompt } from "./Lastest";
import { RecordList } from "./RecordList";
import StartBtn, { FeedAction } from "./StartBtn";
import { FeedRecord, feedDataBase, ring } from "./db";
import './index.scss';
import { getTimesOfList } from "./utils";
import { asyncPrompt } from '../../utils/prompt';


const promptForSide = () => {
  return asyncPrompt({
    title: '喂的哪一边嘛',
    cancelText: "左边",
    confirmText: "右边",
    okKey: 'right' as const,
    noKey: 'left' as const,
  });
}

export default () => {
  const { list, add, refresh } = feedDataBase.useDataBaseList();

  const [feed = FeedAction.none, setFeeding] = useLocalStorageState<FeedAction>(
    'this-feed-state',
    {defaultValue: FeedAction.none}
  );
  
  const [thisFeed = [], setThisFeed] = useLocalStorageState<number[]>('this-feed', {defaultValue: []});

  const onSetFeeding = useCallback(async (state: FeedAction) => {
    setFeeding(state);
    ring.feed();
    if (state === FeedAction.none) {
      const side = await promptForSide();
      const newRecord: FeedRecord = {
        id: Date.now(),
        times: thisFeed,
        type: 'mon',
        volumn: getTimesOfList(thisFeed, true),
        side: side as any,
      };
      add(newRecord);
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
            <RecordList records={list} refresh={refresh}/>
            <LatestPrompt record={last(list)!} feedState={feed}/>
          </>
        ) : (
          <CurrentPrompt times={thisFeed} feedState={feed}/>
        )
      }
      <StartBtn onChange={onSetFeeding} value={feed}/>
    </div>
  )
}