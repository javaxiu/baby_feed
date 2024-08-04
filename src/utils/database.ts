import { useMemoizedFn } from "ahooks";
import { useEffect, useState } from "react";
import { isEqual, last } from "underscore";
import Dexie, { Table } from 'dexie';
import { asyncPrompt } from "./prompt";

export const indexDb = new Dexie("MyDatabase");

window.ii = indexDb;

window.onbeforeunload = () => {
  indexDb.close();
}

class DataBase<T extends Record<string, any>> {
  get table(): Table<T> {
    return (indexDb as any)[this.storageKey];
  };
  constructor(private storageKey: string, private initial: T[] = []) {
    indexDb.version(2).stores({
      [storageKey]: "id, timestamp",
    });
  }
  list: T[] = [];
  add = (newOne: T) => {
    this.list = [...this.list, newOne];
    this.table.add(newOne);
    return this.list;
  }
  remove = async (target: T) => {
    const result = await asyncPrompt({ title: '要删掉这个吗?'});
    if (!result) return this.list;
    this.list = this.list.filter(item => !isEqual(target, item));
    this.table.delete(target);
    return this.list;
  }
  async reload() {
    try {
      this.list = await this.table.toArray();
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
    const [list, updateList] = useState<T[]>([]);
    const add = useMemoizedFn((cur: T) => {
      updateList(this.add(cur));
    });
    const remove = useMemoizedFn(async (cur: T) => {
      await this.remove(cur);
      updateList(this.list);
    });
    const refresh = useMemoizedFn(async () => {
      await this.reload()
      updateList(this.list);
    });
    useEffect(() => {
      refresh();
    }, []);
    return { list, add, remove, refresh }
  }
}
export default DataBase;
