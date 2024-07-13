import { useMemoizedFn } from "ahooks";
import { useState } from "react";
import { isEqual, last } from "underscore";
import { asyncPrompt } from "../../utils/prompt";

class DataBase<T extends Record<string, any>> {
  constructor(private storageKey: string, private initial: T[] = []) {
    this.reload();
  }
  list: T[] = [];
  private commit = () => {
    localStorage.setItem(this.storageKey, JSON.stringify(this.list));
  }
  add = (newOne: T) => {
    this.list = [...this.list, newOne];
    this.commit();
    return this.list;
  }
  remove = async (target: T) => {
    const result = await asyncPrompt({ title: '要删掉这个吗?'});
    if (!result) return this.list;
    this.list = this.list.filter(item => !isEqual(target, item));
    this.commit();
    return this.list;
  }
  reload = () => {
    try {
      this.list = JSON.parse(localStorage.getItem(this.storageKey) || '[]')
    } catch {
      this.list = this.list || this.initial;
    }
    return this.list;
  }
  get = () => {
    return this.list;
  }
  latest = () => {
    return last(this.list);
  }
  useDataBaseList = () => {
    const [list, updateList] = useState(() => {
      return this.get()
    });
    const add = useMemoizedFn((cur: T) => {
      updateList(this.add(cur));
    });
    const remove = useMemoizedFn(async (cur: T) => {
      await this.remove(cur);
      updateList(this.list);
    });
    const refresh = useMemoizedFn(() => {
      updateList(this.reload());
    })
    return { list, add, remove, refresh }
  }
}
export default DataBase;
