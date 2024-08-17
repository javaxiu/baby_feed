// import * as api from "@tauri-apps/api";
import { fetch } from '@tauri-apps/plugin-http';
import { FeedRecordOld, feedDataBase } from "../pages/feed/db";
import poopDb from '../pages/poop/db';
import scheduleDb from "../pages/schedule/db";
import { Toast } from 'antd-mobile';
import { last } from 'underscore';
import { MINUTE, getTimesOfList } from '@utils/helpers';
import { indexDb } from './database';
import { sleep, ID_TS_FMT } from './helpers';
import dayjs from 'dayjs';

export const upload = async () => {
  const r = await fetch("http://192.168.10.11:9000/api/data", {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      feed: localStorage.getItem('feed_records'),
      schedule: scheduleDb.get(),
      poop: poopDb.get(),
    }),
  }).then(r => r.text())
  .catch(e => {
    Toast.show(JSON.stringify(e));
    console.log(e);
  })
  Toast.show(typeof r === 'string' ? r : JSON.stringify(r));
}

// @ts-ignore
const mock = async () => {
  await indexedDB.deleteDatabase('MyDatabase');
  localStorage.removeItem('feed_records');
  let start = dayjs().subtract(30, 'day');
  const now = Date.now();
  const list = [];
  while (+start < now) {
    const v = ~~(Math.random() * 15 * MINUTE);
    list.push({
      id: start.format(ID_TS_FMT),
      times: [+start, +start + v],
      volumn: v,
      side: 'left',
    });
    start = start.add(3, 'hour');
  }
  localStorage.setItem('feed_records', JSON.stringify(list));
}

// sync data from localstorage
(async () => {
  // await mock()
  await sleep(1000);

  if ((await feedDataBase.reload()).length === 0) {
    const list: FeedRecordOld[] = JSON.parse(localStorage.getItem('feed_records') || '[]')
    feedDataBase.table.bulkAdd(list.map(x => {
      const volume = getTimesOfList(x.times, false, true);
      return {
        id: dayjs(x.id).format(ID_TS_FMT),
        timestamps: x.times[0] || 0,
        type: x.type,
        left: volume / 2,
        right: volume / 2,
        stop: last(x.times)!,
        volume,
      }
    }));
  }

  // @ts-ignore
  if (await indexDb.poop.count() === 0) {
    const list2 = JSON.parse(localStorage.getItem('poop') || '[]').map((x: any) => ({
      id: x.id || x.time,
      timestamps: x.time,
      ...x,
    }));
    // @ts-ignore
    indexDb.poop.bulkAdd(list2);
  }
  
  // @ts-ignore
  if (await indexDb.schedule.count() === 0) {
    const list3 = JSON.parse(localStorage.getItem('schedule') || '[]').map((x: any) => ({
      id: x.date,
      timestamps: x.date,
      ...x,
    }));
    // @ts-ignore
    indexDb.schedule.bulkAdd(list3);
  }

})()