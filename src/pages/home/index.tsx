import feedGif from '../../assets/feed.gif';
import './index.scss';
import dayjs from 'dayjs';

export default () => {
  return (
    <div className='home-page'>
      <div>小满已经出生 {dayjs().diff(dayjs('2024-05-20'), 'day')} 天啦</div>
      <div>妈妈们辛苦啦!</div>
      <img src={feedGif} />
    </div>
  );
}