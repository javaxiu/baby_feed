export interface FeedRecord {
  id: number
  times: number[]
  volumn: number
  type: 'mon' | 'milk'
}

export const feedDataBase = {
  list: [] as FeedRecord[],
  read(): FeedRecord[] {
    if (!feedDataBase.list?.length) {
      try {
        feedDataBase.list = JSON.parse(localStorage.getItem('feed_records') || '');
      } catch {
        //
      }
    }
    return feedDataBase.list;
  },
  write(record: FeedRecord) {
    feedDataBase.list.push(record);
    localStorage.setItem('feed_records', JSON.stringify(feedDataBase.list))
  },
  delete(id: number) {
    feedDataBase.list = feedDataBase.list.filter(x => x.id !== id);
    localStorage.setItem('feed_records', JSON.stringify(feedDataBase.list))
  }
}