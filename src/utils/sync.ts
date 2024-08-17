// import * as api from "@tauri-apps/api";
import { fetch } from '@tauri-apps/plugin-http';
import { FeedRecordOld, feedDataBase } from "../pages/feed/db";
import poopDb from '../pages/poop/db';
import scheduleDb from "../pages/schedule/db";
import { Toast } from 'antd-mobile';
import { last } from 'underscore';
import { MINUTE, getTimesOfList } from '@utils/helpers';
import { indexDb } from './database';
import { sleep } from './helpers';
import dayjs from 'dayjs';

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
    console.log(e);
  })
  Toast.show(typeof r === 'string' ? r : JSON.stringify(r));
}

const mock = async () => {
  await indexedDB.deleteDatabase('MyDatabase');
  localStorage.removeItem('feed_records');
  let start = dayjs().subtract(30, 'day');
  const now = Date.now();
  const list = [];
  while (+start < now) {
    const v = ~~(Math.random() * 15 * MINUTE);
    list.push({
      id: start.format('YYYY_MM_DD_HH_mm_ss_SSS'),
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
    feedDataBase.table.bulkAdd(list.map(x => ({
      id: x.id,
      timestamps: last(x.times) || 0,
      type: x.type,
      ...(() => {
        const t = getTimesOfList(x.times, false, true);
        return {
          left: t / 2,
          right: t / 2,
          stop: (last(x.times) || 0) + t,
        };
      })(),
      volume: x.volumn,
    })));
  }

  if (await indexDb.poop.count() === 0) {
    const list2 = JSON.parse(localStorage.getItem('poop') || '[]').map(x => ({
      id: x.id || x.time,
      timestamps: x.time,
      ...x,
    }));
    indexDb.poop.bulkAdd(list2);
  }
  
  if (await indexDb.schedule.count() === 0) {
    const list3 = JSON.parse(localStorage.getItem('schedule') || '[]').map(x => ({
      id: x.date,
      timestamps: x.date,
      ...x,
    }));
    indexDb.schedule.bulkAdd(list3);
  }

})()