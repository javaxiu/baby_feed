import dayjs from "dayjs";
import { isEqual } from "underscore";

export interface Schedule {
  date: number
  event: string
}

const scheduleDb = new class {
  list: Schedule[] = [
    { date: +dayjs('2024-07-01'), event: '打乙肝疫苗' },
    { date: +dayjs('2024-07-22'), event: '打脊灰疫苗' },
  ];
  add = (newOne: Schedule) => {
    this.list = [...this.list, newOne];
    localStorage.setItem('schedule', JSON.stringify(this.list));
    return this.list;
  }
  remove = (target: Schedule) => {
    this.list = this.list.filter(item => isEqual(target, item));
    return this.list;
  }
  get = () => {
    if (!this.list) {
      try {
        this.list = JSON.parse(localStorage.getItem('schedule') || '[]')
      } catch {
        this.list = [];
      }
    }
    return this.list;
  }
}
export default scheduleDb;
