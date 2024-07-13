import { useCallback, useMemo, useRef, useState } from 'react';
import { useMemoizedFn } from 'ahooks';
import { Calendar, CalendarRef, Dialog, Input, Toast, InputRef } from 'antd-mobile'
import db, { Schedule as ScheduleItem } from './db';
import './index.scss';
import dayjs from 'dayjs';

const useScheduleList = () => {
  const [list, updateList] = useState(() => {
    return db.get()
  });
  const add = useMemoizedFn((cur: ScheduleItem) => {
    updateList(db.add(cur));
  });
  const remove = useMemoizedFn((cur: ScheduleItem) => {
    updateList(db.remove(cur));
  });
  const dateEvent = useMemo(() => {
    return list.reduce((pre, cur) => ({
      ...pre,
      [cur.date]: pre[cur.date] ? [...pre[cur.date], cur]: [cur]
    }), {} as Record<string, ScheduleItem[]>);
  }, [list]);
  return { list, dateEvent, add, remove }
}

const dot = <div className='dot'></div>

const Schedule = () => {
  const [selectDate, _changeSelected] = useState<Date | null>();
  const changeSelected = useCallback((date: Date | null) => {
    _changeSelected(date ? dayjs(date).startOf('day').toDate(): date);
  }, [_changeSelected]);
  const calendarRef = useRef<CalendarRef | null>(null);
  const inputRef = useRef<InputRef>(null);
  const { dateEvent, add, remove } = useScheduleList();
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
          placeholder={`${dayjs(selectDate).format('MM月DD日')}要干什么呀`}
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
        add({ date: +selectDate, event: val })
      }
    });
  }, [selectDate]);
  const goToday = useCallback(() => {
    calendarRef.current?.jumpToToday();
    changeSelected(dayjs().toDate())
  }, []);
  const todayEvents = useMemo(() => {
    if (!selectDate) return [];
    return dateEvent[+(selectDate)] || [];
  }, [selectDate, dateEvent]);
  return (
    <>
      <Calendar
        ref={calendarRef}
        className='calendar-blk-cal'
        selectionMode="single"
        prevMonthButton={<span>上一月</span>}
        nextMonthButton={<span>下一月</span>}
        prevYearButton={null}
        nextYearButton={null}
        renderLabel={(date) => dateEvent[+dayjs(date).startOf('day')]?.length ? dot : null}
        value={selectDate}
        onChange={changeSelected}
      />
      <ol className='calendar-blk-event-list'>
        {
          !todayEvents.length ? '今天没啥事儿哦' : todayEvents.map((event) => {
            return <li>
              <span>{event.event}</span>
              <span onClick={() => remove(event)}>删除</span>
            </li>
          })
        }
      </ol>
      <div className='calendar-blk-plus'>
        <div className='circle-button' onClick={addSchedule}>+</div>
        <div className='circle-button calendar-blk-today' onClick={goToday}>今</div>
      </div>
    </>
  )
}
export default Schedule;
