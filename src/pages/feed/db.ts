import React from "react"
import { createRef } from "react"
import ReactDOM from "react-dom/client"
import mamaMp3 from '../../assets/mama.mp3';
import { Dialog } from "antd-mobile";
import { last } from "underscore";
import DataBase from "../../utils/database";

export const HOUR = 60 * 60 * 1000;
export const MINUTE = 60 * 1000;

export interface FeedRecord {
  id: number
  times: number[]
  volumn: number
  type: 'mon' | 'milk'
  side?: 'left' | 'right'
}

export const feedDataBase = new DataBase<FeedRecord>('feed_records');

export const ring = new class Ring {
  nextNotifyTime = 0;
  navigate?: Function;
  el = createRef<HTMLAudioElement>();
  init(navigate: Function) {
    this.navigate = navigate;
    this.nextNotifyTime = last(feedDataBase.latest()?.times || []) || 0;
    this.nextNotifyTime += 2.8 * HOUR;
    const container = document.createElement('div');
    document.body.append(container);
    ReactDOM.createRoot(container).render(React.createElement('audio', {
      src: mamaMp3,
      ref: this.el,
    }));
    setTimeout(() => {
      this.check();
    }, 3000);
  }
  feed() {
    this.nextNotifyTime = Date.now() + 2.8 * HOUR;
  }
  play = (play: boolean) => {
    if (!this.el.current) return;
    const status = !this.el.current.paused;
    if (status && !play) {
      this.el.current.pause();
      this.el.current.currentTime = 0
    }
    if (!status && play) {
      this.el.current?.play();
    }
  }
  delay = (delay: number) => {
    this.nextNotifyTime = Date.now() + delay;
    this.check();
    this.play(false);
    this.navigate?.('/feed');
  }
  check = () => {
    if (this.nextNotifyTime < Date.now()) {
      this.play(true);
      Dialog.confirm({
        title: '该喂宝宝了哦',
        cancelText: '再等30分钟',
        confirmText: '现在喂',
        onCancel: () => {
          this.delay(0.5 * HOUR);
        },
        onConfirm: () =>{
          this.delay(1 * MINUTE);
        }
      })
      return;
    }
    this.play(false);
    setTimeout(() => {
      this.check();
    }, 1000);
  }
}
