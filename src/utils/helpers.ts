export const HOUR = 60 * 60 * 1000;
export const MINUTE = 60 * 1000;

export const sleep = (n: number) => new Promise(res => setTimeout(res, n));

/** 毫秒转时分 */
export const msFormat = (n: number, showHours = false) => {
  const hour = Math.floor(n / HOUR);
  const minute = Math.floor((n - hour * HOUR) / MINUTE);
  const second = Math.floor(n % MINUTE / 1000);
  return (showHours ? [hour, minute, second] : [minute, second]).map(n => n < 10 ? `0${n}` : n).join(':');
}