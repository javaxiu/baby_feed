import dayjs from "dayjs";

export const HOUR = 60 * 60 * 1000;
export const MINUTE = 60 * 1000;
export const ID_TS_FMT = 'YYYY_MM_DD_HH_mm_ss_SSS';

export const sleep = (n: number) => new Promise(res => setTimeout(res, n));

/** 毫秒转时分 */
export const msFormat = (n: number, showHours = false) => {
  const hour = Math.floor(n / HOUR);
  const minute = Math.floor((n - hour * HOUR) / MINUTE);
  const second = Math.floor(n % MINUTE / 1000);
  return ((showHours || hour) ? [hour, minute, second] : [minute, second]).map(n => n < 10 ? `0${n}` : n).join(':');
}

/** 分转时分 */
export const secFormat = (n: number) => {
  const hour = Math.floor(n / HOUR);
  const minute = Math.floor((n - hour * HOUR) / MINUTE);
  return [hour, minute].map(n => n < 10 ? `0${n}` : n).join(':');
} 

export const ftFormat = (n: dayjs.ConfigType) => {
  return dayjs(n).format('YYYY-MM-DD HH:mm:ss')
}

export const getTimesOfList = (times: number[] | undefined, pad = false, ms = false) => {
  if (!times?.length) return 0
  let volume = 0;
  let padTimes = times;
  if (times.length % 2 === 1 && pad) {
    padTimes = [...padTimes, Date.now()];
  }
  for (let i = 0; i < padTimes.length; i+=2) {
    if (padTimes[i+1] === undefined) continue;
    volume += padTimes[i+1] - padTimes[i]
  }
  if (ms) {
    return volume;
  }
  return +(volume / 60000).toFixed(2);
}

export const isDev = location.hostname.startsWith('localhost') || location.hostname.startsWith('192');