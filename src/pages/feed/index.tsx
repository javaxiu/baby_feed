import { useLocalStorageState } from 'ahooks';
import { Form, Input } from 'antd-mobile';
import { FormInstance } from 'antd-mobile/es/components/form';
import { createRef, useCallback } from "react";
import { last } from 'underscore';
import { Button } from '../../components/Button';
import TimePicker from '../../components/TimePicker';
import { asyncPrompt } from '../../utils/prompt';
import { CurrentPrompt } from "./Current";
import { LatestPrompt } from "./Lastest";
import { RecordList } from "./RecordList";
import StartBtn, { FeedAction } from "./StartBtn";
import { FeedRecord, feedDataBase, ring } from "./db";
import './index.scss';
import { getTimesOfList } from "./utils";
import FeedControl from './FeedBtn';
import { MINUTE } from '../../utils/helpers';


export default () => {
  const { list, add, refresh } = feedDataBase.useDataBaseList();

  const [feed = FeedAction.none, setFeeding] = useLocalStorageState<FeedAction>(
    'this-feed-state',
    {defaultValue: FeedAction.none}
  );

  // const onSetFeeding = useCallback(async (state: FeedAction) => {
  //   setFeeding(state);
  //   ring.feed();
  //   if (state === FeedAction.none) {
  //     const side = await promptForSide();
  //     const newRecord: FeedRecord = {
  //       id: Date.now(),
  //       times: thisFeed,
  //       type: 'mon',
  //       volumn: getTimesOfList(thisFeed, true),
  //       side: side as any,
  //     };
  //     add(newRecord);
  //     setThisFeed([]);
  //   } else {
  //     setThisFeed(list => ([...(list || []), Date.now()]));
  //   }   
  // }, [thisFeed]);

  const addRecord = useCallback(async () => {
    const ref = createRef<FormInstance>();
    const ok = await asyncPrompt({
      title: '刚才没来得及记录哦?',
      content: (
        <Form ref={ref}>
          <Form.Item label="时间" name="start">
            <TimePicker placeholder='啥时候开始喂的'/>
          </Form.Item>
          <Form.Item label="时长" name="left">
            <Input placeholder='左边喂了多少分钟' type='number'/>
          </Form.Item>
          <Form.Item label="时长" name="right">
            <Input placeholder='右边喂了多久分钟' type='number'/>
          </Form.Item>
        </Form>
      )
    });
    if (!ok) return;
    const formValue = ref.current!.getFieldsValue();
    const stopAt = formValue.start + formValue.right * MINUTE + formValue.left * MINUTE;
    add({
      id: Date.now(),
      timestamp: stopAt,
      stop: stopAt,
      left: formValue.left,
      right: formValue.right,
      volumn: formValue.left + formValue.right,
    })
  }, []);

  return (
    <FeedControl />
  )

  // return (
  //   <div className="feed-page">
  //     {
  //       feed === FeedAction.none ? (
  //         <>
  //           <RecordList records={list} refresh={refresh}/>
  //           <LatestPrompt record={last(list)!} feedState={feed}/>
  //         </>
  //       ) : (
  //         <CurrentPrompt times={thisFeed} feedState={feed}/>
  //       )
  //     }
  //     <StartBtn onChange={onSetFeeding} value={feed}/>
  //     <Button onClick={addRecord} className='feed-page-add'>+</Button>
  //   </div>
  // )
}