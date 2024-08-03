// import * as api from "@tauri-apps/api";
import { fetch } from '@tauri-apps/plugin-http';
import { feedDataBase } from "../pages/feed/db";
import poopDb from '../pages/poop/db';
import scheduleDb from "../pages/schedule/db";
import { Toast } from 'antd-mobile';

export const upload = async () => {
  const r = await fetch("http://192.168.10.11:9000/api/data", {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      feed: feedDataBase.get(),
      schedule: scheduleDb.get(),
      poop: poopDb.get(),
    }),
  }).then(r => r.text())
  .catch(e => {
    Toast.show(JSON.stringify(e));
    throw new Error(e);
  })
  Toast.show(typeof r === 'string' ? r : JSON.stringify(r));
}