import DataBase from "@utils/database";

interface BodyData {
  tall: number,
  head: number,
  weight: number,
}

export const bodyDb = new DataBase<BodyData>('body_data');
