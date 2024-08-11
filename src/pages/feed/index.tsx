import { useLocalStorageState } from 'ahooks';
import { Form, Input } from 'antd-mobile';
import { FormInstance } from 'antd-mobile/es/components/form';
import { createRef, useCallback } from "react";
import { Button } from '../../components/Button';
import TimePicker from '../../components/TimePicker';
import { asyncPrompt } from '../../utils/prompt';
import { RecordList } from "./RecordList";
import { FeedAction } from "./StartBtn";
import { feedDataBase } from "./db";
import './index.scss';
import FeedControl from './FeedBtn';
import { MINUTE } from '../../utils/helpers';
import { LatestPrompt } from './Lastest';


export default () => {
  const { list, add, refresh } = feedDataBase.useDataBaseList();
  const [ page, setPage ] = useLocalStorageState('feed-page', { defaultValue: 'none' });

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
    <div className="feed-page">
      {
        page === 'none' ? (
          <>
            <RecordList records={list} refresh={refresh}/>
            <LatestPrompt />
          </>
        ) : null
      }
      <FeedControl />
      <Button onClick={addRecord} className='feed-page-add'>+</Button>
    </div>
  )
}