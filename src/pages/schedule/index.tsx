import { CalendarPickerView, CalendarPickerViewRef, Dialog, Input, InputRef, Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { useCallback, useMemo, useRef, useState } from 'react';
import { BottomButton, Button } from '../../components/Button';
import '../../main.scss';
import db, { Schedule as ScheduleItem } from './db';
import './index.scss';
import { ID_TS_FMT } from '@utils/helpers';

const dot = <div className='dot'></div>

const Schedule = () => {
  const [selectDate, _changeSelected] = useState<Date | null>();
  const changeSelected = useCallback((date: Date | null) => {
    if (!date) return;
    _changeSelected(date ? dayjs(date).startOf('day').toDate(): date);
  }, [_changeSelected]);

  const calendarRef = useRef<CalendarPickerViewRef  | null>(null);

  const inputRef = useRef<InputRef>(null);

  const { list, add, remove } = db.useDataBaseList();

  const dateEvent = useMemo(() => {
    return list.reduce((pre, cur) => ({
      ...pre,
      [cur.date]: pre[cur.date] ? [...pre[cur.date], cur]: [cur]
    }), {} as Record<string, ScheduleItem[]>);
  }, [list]);

  const selectedDayjs = dayjs(selectDate);

  const addSchedule = useCallback(() => {
    if (!selectDate) {
      Toast.show({ content: '先点个日期撒', });
      return;
    }
    Dialog.confirm({
      title: '增加一个日程',
      content: (
        <Input 
          autoFocus
          ref={inputRef}
          placeholder={`${selectedDayjs.format('MM月DD日')}要干什么呀`}
        />
      ),
      cancelText: '没事儿',
      confirmText: '嗯嗯',
      onConfirm: () => {
        const val = inputRef.current!.nativeElement!.value;
        if (!val) {
          Toast.show({ content: '啥都没填呀', });
          return Promise.reject();
        }
        add({
          id: dayjs().format(ID_TS_FMT),
          timestamps: +selectedDayjs,
          date: +selectedDayjs,
          event: val
        })
      }
    });
  }, [selectedDayjs]);

  const goToday = useCallback(() => {
    // calendarRef.current?.jumpToToday();
    changeSelected(dayjs().toDate())
  }, []);

  const todayEvents = useMemo(() => {
    if (!selectDate) return [];
    return dateEvent[+(selectDate)] || [];
  }, [selectDate, dateEvent]);

  return (
    <>
      <div className="page-title">宝宝日程</div>
      <CalendarPickerView
        ref={calendarRef}
        className='calendar-blk-cal'
        selectionMode="single"
        title=""
        renderBottom={(date) => dateEvent[+dayjs(date).startOf('day')]?.length ? dot : null}
        value={selectDate}
        onChange={changeSelected}
      />
      <ol className='calendar-blk-event-list'>
        {
          !todayEvents.length ? (
            selectDate ? (
              selectedDayjs.isSame(new Date(), 'day') ? '今天没事儿哦' : `${selectedDayjs.date()}号没啥事儿哦`
            ) : '想看哪天呀,点一下呗'
          ) : todayEvents.map((event) => {
            return <li>
              <div>
                <span>{event.event}</span>
                <span onClick={() => remove(event as any)}>删除</span>
              </div>
            </li>
          })
        }
      </ol>
      <BottomButton className='calendar-blk-plus'>
        <Button type='circle' onClick={addSchedule}>+</Button>
      </BottomButton>
      <Button type='bottom-right' onClick={goToday}>今</Button>
    </>
  )
}
export default Schedule;
