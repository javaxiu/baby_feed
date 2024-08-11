export const getTimesOfList = (times: number[] | undefined, pad = false, ms = false) => {
  if (!times?.length) return 0
  let volumn = 0;
  let padTimes = times;
  if (times.length % 2 === 1 && pad) {
    padTimes = [...padTimes, Date.now()];
  }
  for (let i = 0; i < padTimes.length; i+=2) {
    if (padTimes[i+1] === undefined) continue;
    volumn += padTimes[i+1] - padTimes[i]
  }
  if (ms) {
    return volumn;
  }
  return +(volumn / 60000).toFixed(2);
}