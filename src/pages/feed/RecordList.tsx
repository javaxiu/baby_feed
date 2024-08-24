import dayjs from "dayjs";
import { FeedRecord, feedDataBase } from "./db";
import { ftFormat, msFormat } from "@utils/helpers";
import { makeDetailDialog } from "@utils/prompt";
import TimeInput from "@components/TimeInput";
import TimePicker from "@components/TimePicker";

const showDetail = makeDetailDialog<FeedRecord>({
  title: '吃饭记录',
  fields: [
    { label: '开始时间', name: 'timestamps', render: ftFormat, editor: TimePicker },
    { label: '左边', name: 'left', render: msFormat, editor: TimeInput },
    { label: '右边', name: 'right', render: msFormat, editor: TimeInput },
    { label: '时长', name: 'volume', render: msFormat },
    { label: '喂完时间', name: 'stop', render: ftFormat, editor: TimePicker },
  ],
  onDelete(item) {
    feedDataBase.remove(item);
  },
  onSubmit(formData) {
    const volume = (formData.right || 0) + (formData.left || 0);
    feedDataBase.update({
      ...formData,
      volume: volume,
    });
  }
});

export const RecordList = () => {
  const list = feedDataBase.useDataBaseRange({ n: 2, unit: 'day' });

  return (
    <div className="feed-list">
      <ul>
        {
          list.map((r, i) => (
            <li key={i} data-id={r.id} onClick={() => showDetail(r)}>
              <div>        
                <span>{dayjs(r.timestamps).format('MM-DD HH:mm')}</span>
                <span>共:{msFormat(r.volume || 0)}</span>
              </div>
            </li>
          ))
        }
      </ul>
      <div className="feed-list-cover"></div>
    </div>
  );
}