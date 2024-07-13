import { useCallback } from 'react';
import poopGif from '../../assets/poop.gif';
import { ButtomButton, Button } from '../../components/Button';
import './index.scss';
import db from './db';

export default () => {
  const { list, add, remove } = db.useDataBaseList();
  return (
    <div className='poop-page'>
      <img src={poopGif} />
      <ButtomButton className='buttom-button'>
        <Button>+</Button>
      </ButtomButton>
    </div>
  );
}