import dayjs from "dayjs";
import { useCallback } from "react";
import { feedDataBase } from "./db";
import { msFormat } from "@utils/helpers";

export const RecordList = () => {
  const list = feedDataBase.useDataBaseRange({ n: 2, unit: 'day' });

  const onDelete = useCallback((e: React.MouseEvent) => {
    const id = e.currentTarget.parentElement?.parentElement?.dataset.id;
    feedDataBase.remove(list.find(r => r.id === id)!);
  }, [list]);

  return (
    <div className="feed-list">
      <div>宝宝吃饭笔记</div>
      <ul>
        {
          list.map((r, i) => (
            <li key={i} data-id={r.id}>
              <div>        
                <span>{dayjs(r.timestamps).format('MM-DD HH:mm')}</span>
                <span>共:{msFormat(r.volume || 0)}</span>
                <span>左:{msFormat(r.left || 0)}</span>
                <span>右:{msFormat(r.right || 0)}</span>
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