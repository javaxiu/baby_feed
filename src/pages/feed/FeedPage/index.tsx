import drinkingGif from '@assets/drinking.gif';
import drinkingPauseGif from '@assets/drinking_pause.gif';
import CloseSvg from '@assets/svg/close.svg?react';
import { Button } from "@components/Button";
import TimePicker from '@components/TimePicker';
import { ID_TS_FMT, MINUTE, msFormat } from '@utils/helpers';
import { asyncPrompt } from '@utils/prompt';
import { useLocalStorageState, useMemoizedFn } from "ahooks";
import { Form, Input } from 'antd-mobile';
import type { FormInstance } from 'antd-mobile/es/components/form';
import dayjs from 'dayjs';
import { createRef, useCallback, useEffect, useState } from "react";
import { feedDataBase, ring } from "../db";
import FeedBtn from "./FeedBtn";
import './index.scss';
import { feedSignal, useFeedSignalChange, useIsFeeding } from "./signal";

const FeedPage = () => {
  const [times = [0, 0], setTimes] = useState<[number, number]>([0, 0]);
  const [startFeedingTime, setStartFeedingTime] = useLocalStorageState<number[]>('feeding-start-time', { defaultValue: [] });
  const isFeeding = useIsFeeding();

  const onChangeTime = useMemoizedFn((key: string, t: number) => {
    setTimes(times => key == 'left' ? [t, times![1]] : [times![0], t]);
    ring.feed();
  });

  useEffect(() => {
    const total = times[0] + times[1];
    if (total > 30 * MINUTE) {
      onClickDone();
    }
  }, [times]);

  const reset = useMemoizedFn(() => {
    feedSignal.set('finish');
    setTimes([0, 0]);
    setStartFeedingTime([]);
  });

  useFeedSignalChange(null, (s) => {
    if (s === 'left' || s === 'right') {
      setStartFeedingTime(l => [...(l || []), Date.now()]);
    }
  });

  const onClickDone = useMemoizedFn(async () => {
    const startTimeD = dayjs(startFeedingTime![0]);
    const volume = times[0] + times[1];
    if (volume < MINUTE) {
      const sure = await asyncPrompt({
        content: '才喂了一分钟吗',
        confirmText: '是呀',
        cancelText: '点错啦',
      });
      if (!sure) return;
    }
    feedDataBase.add({
      id: startTimeD.format(ID_TS_FMT),
      timestamps: startTimeD.valueOf(),
      left: times[0],
      right: times[1],
      stop: startTimeD.valueOf() + times[0] + times[1],
      volume,
    });
    reset();
  });

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
    const left = formValue.left * MINUTE;
    const right = formValue.right * MINUTE;
    const stopAt = formValue.start + left + right;
    feedDataBase.add({
      id: formValue.start,
      timestamps: formValue.start,
      type: 'mon',
      stop: stopAt,
      left,
      right,
      volume: left + right,
    });
  }, []);

  const onClose = useCallback(() => {
    asyncPrompt({
      title: '不喂了吗?',
      content: '这次就不记录了哦？',
      confirmText: '嗯嗯',
      cancelText: '还要吃',
    }).then(ok => {
      if (!ok) return;
      reset();
    })
  }, []);

  return (
    <div className="feed-control">
      {
        isFeeding ? <CloseSvg className='feed-control-close' onClick={onClose}/> : null
      }
      <img
        className='feed-control-img'
        src={isFeeding ? drinkingGif : (
          feedSignal.get() === 'pause' ? drinkingPauseGif : ''
        )}
      />
      {
        isFeeding ? (
          <>
          <div className="feed-control-total">
            <div className='text-center text-lg'>
              {
                startFeedingTime!.map((e, i) => (
                  <div key={e.valueOf()}>
                    第{i+1}次喂: {dayjs(e).format('HH:mm:ss')}
                  </div>
                ))
              }
              
            </div>
            <div className='flex justify-center items-center'>
              <span className='pr-2'>一共喂了</span> <b>{msFormat((times[0] + times[1]))}</b>
            </div>
          </div>
          </>
        ) : null
      }
      <div className="feed-btn-group">
        <FeedBtn title="左边" id="left" onChangeTime={onChangeTime} />
        <FeedBtn title="右边" id="right" onChangeTime={onChangeTime} />
      </div>
      {
        !startFeedingTime?.length ? null : (
          <div className="feed-control-bottom">
            <Button type="square" onClick={onClickDone}>喂饱啦</Button>
          </div>
        )
      }
      <Button onClick={addRecord} className='feed-control-add' type='bottom-right'>+</Button>
    </div>
  )
};

export default FeedPage;
