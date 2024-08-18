import dayjs from "dayjs";
import { FeedRecord, feedDataBase } from "./db";
import { msFormat } from "@utils/helpers";
import { makeDetailDialog } from "@utils/prompt";

const showDetail = makeDetailDialog<FeedRecord>({
  title: '吃饭记录',
  fields: [
    { label: '开始时间', name: 'timestamps', render: v => dayjs(v).format('YYYY-MM-DD HH:mm') },
    { label: '左边', name: 'left', render: msFormat },
    { label: '右边', name: 'right', render: msFormat },
    { label: '时长', name: 'volume', render: msFormat },
  ],
  onDelete(item) {
    feedDataBase.remove(item);
  }
});

export const RecordList = () => {
  const list = feedDataBase.useDataBaseRange({ n: 2, unit: 'day' });

  return (
    <div className="feed-list">
      <div>宝宝吃饭笔记</div>
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