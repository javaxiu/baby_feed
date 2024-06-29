import poopGif from '../../assets/poop.gif';
import './index.scss';

export default () => {
  return (
    <div className='poop-page'>
      <div>爸爸还没做完</div>
      <img src={poopGif} />
    </div>
  );
}