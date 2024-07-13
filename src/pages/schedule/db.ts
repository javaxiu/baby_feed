import dayjs from "dayjs";
import DataBase from "../../utils/database";

export interface Schedule {
  date: number
  event: string
}

const scheduleDb = new DataBase<Schedule>('schedule', [
  { date: +dayjs('2024-07-01'), event: '打乙肝疫苗' },
  { date: +dayjs('2024-07-22'), event: '打脊灰疫苗' },
]);
export default scheduleDb;
