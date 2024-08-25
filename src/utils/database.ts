import { useDeepCompareEffect, useMemoizedFn } from "ahooks";
import { useEffect, useState } from "react";
import Dexie, { Table } from 'dexie';
import { asyncPrompt } from "./prompt";
import dayjs from "dayjs";
import mitt from "mitt";
import _ from "underscore";
import { ID_TS_FMT } from "./helpers";


export const indexDb = new Dexie("MyDatabase3");

export type Range = 'day' | 'week' | 'month' | 'year';
type CustomRange = { n: number, unit: Range };

window.onbeforeunload = () => {
  indexDb.close();
}

type WithBasicInfo<T> = T & { id: number | string, timestamps: number };

class DataBase<T extends Record<string, any>> {

  get table(): Table<WithBasicInfo<T>> {
    return (indexDb as any)[this.storageKey];
  };

  event = mitt();

  constructor(private storageKey: string) {
    indexDb.version(2).stores({
      [storageKey]: "id, timestamps",
    });
  }

  add = async (newOne: WithBasicInfo<T>) => {
    await this.table.add(newOne);
    this.event.emit('add');
    return this;
  }
  
  remove = async (target: WithBasicInfo<T>) => {
    const result = await asyncPrompt({ title: '要删掉这个吗?', content: dayjs(target.timestamps).format('YYYY-MM-DD HH:mm:ss') });
    if (!result) return this;
    await this.table.delete(target.id);
    this.event.emit('remove');
    return this;
  }

  update = async (updateOne: WithBasicInfo<T>) => {
    await this.table.update(updateOne.id, updateOne);
    this.event.emit('update');
    return this;
  }

  async reload() {
    try {
      return await this.table.orderBy('timestamps').reverse().toArray();
    } catch {
    }
  }

  latest = () => {
    return this.table.orderBy('timestamps').reverse().limit(1).first();
  }

  useDataBaseList = () => {
    const [list, updateList] = useState<WithBasicInfo<T>[]>([]);
    const refresh = useMemoizedFn(async () => {
      const newList = await this.reload()
      updateList(newList!);
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

  useDataBaseRange: IUseDataBaseRange<T> = (range: Range | CustomRange = 'day', groupBy?: (rangeList: T[]) => any) => {
    const [list, setList] = useState<WithBasicInfo<T>[]>([]);
    const refresh = useMemoizedFn(() => {
      let back = 1;
      let unit: Range = range as any;
      if (typeof range !== 'string') {
        back = range.n;
        unit = range.unit;
      }
      const start = +dayjs().subtract(back, unit).endOf('day');
      const end = +dayjs();
      this.table.where("timestamps").between(start, end).reverse().sortBy('timestamps').then(resp => {
        if (groupBy) {
          const fmt = ({'day': 'minute', 'week': 'day', 'month': 'day', 'year': 'month'} as const)[unit];
          const groupList = _.groupBy(resp, item => String(dayjs(item.timestamps).startOf(fmt).valueOf()));
          const newList = Object.keys(groupList).map(groupTime => {
            return {
              id: dayjs(+groupTime).format(ID_TS_FMT),
              timestamps: +groupTime,
              ...groupBy(groupList[groupTime]),
            }
          });
          setList(newList);
        } else {
          setList(resp);
        }
      });
    });

    useDeepCompareEffect(refresh, [range])

    useEffect(() => {
      this.event.on('*', refresh);
      return () => this.event.off('*', refresh);
    }, []);

    return list;
  }

  useLatest = (): WithBasicInfo<T> | undefined => {
    const [latest, setLatest] = useState<WithBasicInfo<T>>();
    const refresh = useMemoizedFn(() => {
      this.table.reverse().limit(1).sortBy('timestamps').then((resp) => {
        setLatest(resp?.[0]);
      })
    });
    useEffect(refresh, []);
    useEffect(() => {
      this.event.on('*', refresh);
      return () => this.event.off('*', refresh);
    }, []);
    return latest;
  }
}

interface IUseDataBaseRange<T> {
  <U>(range: Range | CustomRange, groupBy?: (rangeList: T[]) => U): (U & WithBasicInfo<T>)[]
  (range?: Range | CustomRange): WithBasicInfo<T>[],
}

export default DataBase;
