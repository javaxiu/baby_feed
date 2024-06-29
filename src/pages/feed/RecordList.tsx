import { Dialog } from "antd-mobile";
import dayjs from "dayjs";
import { useCallback } from "react";
import { last } from "underscore";
import { FeedRecord, feedDataBase } from "./db";

export const RecordList = ({ records, refresh }: { records: FeedRecord[], refresh(): void }) => {
  const onDelete = useCallback((e: React.MouseEvent) => {
    const id = Number(e.currentTarget.parentElement?.parentElement?.dataset.id);
    Dialog.confirm({
      content: '要删掉吗'+id,
      onConfirm: async () => {
        feedDataBase.delete(id!);
        refresh();
      },
    })
  }, []);
  return (
    <div className="feed-list">
      <div>宝宝吃饭笔记</div>
      <ul>
        {
          [...records].reverse().map((r, i) => (
            <li key={i} data-id={r.id}>
              <div>        
                <span>{dayjs(last(r.times)).format('YYYY-MM-DD HH:mm')}</span>
                <span>{{'mon': '母乳', 'milk': '牛奶'}[r.type]}</span>
                <span>{r.volumn} {{'mon': '分钟', 'milk': '毫升'}[r.type]}</span>
              </div>
              <div>
                <span onClick={onDelete}>删除</span>
              </div>
            </li>
          ))
        }
      </ul>
      <div className="feed-list-cover"></div>
    </div>
  );
}