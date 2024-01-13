import React from 'react';
import './pageBg.scss';
import { useDispatch } from 'react-redux';
import { setPageBackground } from '../../redux/slice/pageBackgroundSlice';

function BgCard({ backgroundUrlEach }) {
  const dispatch = useDispatch();

  const handleChangePageBg = (backgroundUrlEach) => {
    dispatch(setPageBackground(`url('${backgroundUrlEach}')`));
  };

  return (
    <div
      onClick={() => handleChangePageBg(backgroundUrlEach)}
      style={{ backgroundImage: `url('${backgroundUrlEach}')` }}
      className="card red">
      <p className="tip">Выбрать</p>
      <p className="second-text">HD 4k фоны</p>
    </div>
  );
}

export default BgCard;
