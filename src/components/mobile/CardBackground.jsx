import React from 'react';
import './stylesSelect.scss';
import { useDispatch } from 'react-redux';
import { setBackground } from '../../redux/slice/backgroundSlice';

function CardBackgound({ backgroundUrlEach }) {
  const dispatch = useDispatch();

  const handleChangeBackground = (backgroundUrlEach) => {
    dispatch(setBackground(`url('${backgroundUrlEach}')`));
  };

  return (
    <div
      onClick={handleChangeBackground}
      style={{ backgroundImage: `url('${backgroundUrlEach}')` }}
      className="card red">
      <p className="tip">Выбрать</p>
      <p className="second-text">HD 4k фоны</p>
    </div>
  );
}

export default CardBackgound;
