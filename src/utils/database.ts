import { useMemoizedFn } from "ahooks";
import { useEffect, useState } from "react";
import { last } from "underscore";
import Dexie, { Table } from 'dexie';
import { asyncPrompt } from "./prompt";
import dayjs from "dayjs";
import mitt from "mitt";
import _ from "underscore";


export const indexDb = new Dexie("MyDatabase");

export type Range = 'day' | 'week' | 'month';

window.onbeforeunload = () => {
  indexDb.close();
}

type WithBasicInfo<T> = T & { id: number | string, timestamps: number };

class DataBase<T extends Record<string, any>> {

  get table(): Table<WithBasicInfo<T>> {
    return (indexDb as any)[this.storageKey];
  };

  event = mitt();

  constructor(private storageKey: string, private initial: WithBasicInfo<T>[] = []) {
    indexDb.version(2).stores({
      [storageKey]: "id, timestamps",
    });
  }

  list: WithBasicInfo<T>[] = [];

  add = async (newOne: WithBasicInfo<T>) => {
    this.list = [...this.list, newOne];
    await this.table.add(newOne);
    this.event.emit('add');
    return this.list;
  }
  
  remove = async (target: WithBasicInfo<T>) => {
    const result = await asyncPrompt({ title: '要删掉这个吗?', content: dayjs(target.timestamps).format('YYYY-MM-DD HH:mm:ss') });
    if (!result) return this.list;
    this.list = this.list.filter(item => item.id !== target.id);
    await this.table.delete(target.id);
    this.event.emit('remove');
    return this.list;
  }

  async reload() {
    try {
      this.list = await this.table.orderBy('timestamps').reverse().toArray();
    } catch {
    }
    this.list = this.list?.length ? this.list : this.initial;
    return this.list;
  }

  get = () => {
    if (!this.list?.length) {
      this.reload();
    }
    return this.list;
  }

  latest = () => {
    return last(this.list);
  }

  useDataBaseList = () => {
    const [list, updateList] = useState<WithBasicInfo<T>[]>([]);
    const refresh = useMemoizedFn(async () => {
      await this.reload()
      updateList(this.list);
    });

    useEffect(() => {
      refresh();
      this.event.on('*', () => {
        refresh();
      })
    }, []);

    return {
      list,
      add: this.add,
      remove: this.remove,
      refresh,
    }
  }

  useDataBaseRange: IUseDataBaseRange<T> = (range: Range = 'day', groupBy?: (rangeList: T[]) => any) => {
    const [list, setList] = useState<WithBasicInfo<T>[]>([]);
    const refresh = useMemoizedFn(() => {
      const start = +dayjs().subtract(1, range).endOf('day');
      const end = +dayjs();
      this.table.where("timestamps").between(start, end).reverse().sortBy('timestamps').then(resp => {
        if (groupBy) {
          const fmt = ({'day': 'minute', 'week': 'day', 'month': 'day'} as const)[range];
          const groupList = _.groupBy(resp, item => String(dayjs(item.timestamps).startOf(fmt).format()));
          const newList = Object.keys(groupList).map(groupTime => {
            return {
              id: groupTime,
              timestamps: groupTime,
              ...groupBy(groupList[groupTime]),
            }
          });
          setList(newList);
        } else {
          setList(resp);
        }
      });
    });

    useEffect(refresh, [range])

    useEffect(() => {
      this.event.on('*', refresh);
      return () => this.event.off('*', refresh);
    }, []);

    return list;
  } 
}

interface IUseDataBaseRange<T> {
  <U>(range: Range, groupBy?: (rangeList: T[]) => U): (U & WithBasicInfo<T>)[]
  (range?: Range): T[],
}

export default DataBase;
