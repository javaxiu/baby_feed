import DataBase from "../../utils/database";

export interface Schedule {
  date: number
  event: string
}

const scheduleDb = new DataBase<Schedule>('schedule');
export default scheduleDb;
