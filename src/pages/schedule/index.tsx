import { Calendar, CalendarRef, Dialog, Input, InputRef, Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ButtomButton, Button } from '../../components/Button';
import '../../main.scss';
import db, { Schedule as ScheduleItem } from './db';
import './index.scss';

const dot = <div className='dot'></div>

const Schedule = () => {
  const [selectDate, _changeSelected] = useState<Date | null>();
  const changeSelected = useCallback((date: Date | null) => {
    if (!date) return;
    _changeSelected(date ? dayjs(date).startOf('day').toDate(): date);
  }, [_changeSelected]);

  const calendarRef = useRef<CalendarRef | null>(null);

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
        add({ date: +selectedDayjs, event: val })
      }
    });
  }, [selectedDayjs]);

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
          !todayEvents.length ? (
            selectDate ? (
              selectedDayjs.isSame(new Date(), 'day') ? '今天没事儿哦' : `${selectedDayjs.date()}号没啥事儿哦`
            ) : '想看哪天呀,点一下呗'
          ) : todayEvents.map((event) => {
            return <li>
              <div>
                <span>{event.event}</span>
                <span onClick={() => remove(event)}>删除</span>
              </div>
            </li>
          })
        }
      </ol>
      <ButtomButton className='calendar-blk-plus'>
        <Button onClick={addSchedule}>+</Button>
        <Button className='calendar-blk-today' onClick={goToday}>今</Button>
      </ButtomButton>
    </>
  )
}
export default Schedule;
