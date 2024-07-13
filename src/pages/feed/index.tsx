import { useLocalStorageState } from 'ahooks';
import { useCallback, useState } from "react";
import { last } from 'underscore';
import { CurrentPrompt } from "./Current";
import { LatestPrompt } from "./Lastest";
import { RecordList } from "./RecordList";
import StartBtn, { FeedAction } from "./StartBtn";
import { FeedRecord, feedDataBase, ring } from "./db";
import './index.scss';
import { getTimesOfList } from "./utils";
import { Dialog } from 'antd-mobile';


const promptForSide = () => {
  return new Promise((resolve) => {
    Dialog.confirm({
      title: '喂的哪一边嘛',
      cancelText: "左边",
      confirmText: "右边",
      onConfirm() {
        resolve('right');
      },
      onCancel() {
        resolve('left');
      }
    })
  });
}

export default () => {
  const [feed = FeedAction.none, setFeeding] = useLocalStorageState<FeedAction>(
    'this-feed-state',
    {defaultValue: FeedAction.none}
  );
  
  const [feedRecords, setFeedRecords] = useState<FeedRecord[]>(() => {
    return feedDataBase.read();
  });
  
  const [thisFeed = [], setThisFeed] = useLocalStorageState<number[]>('this-feed', {defaultValue: []});

  const onSetFeeding = useCallback(async (state: FeedAction) => {
    setFeeding(state);
    ring.feed();
    if (state === FeedAction.none) {
      const side = await promptForSide();
      setFeedRecords(list => {
        const newRecord: FeedRecord = {
          id: Date.now(),
          times: thisFeed,
          type: 'mon',
          volumn: getTimesOfList(thisFeed, true),
          side: side as any,
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