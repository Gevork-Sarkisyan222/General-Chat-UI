import React from "react";
import "./pageBg.scss";
import { useDispatch } from "react-redux";
import { setPageBackground } from "../../redux/slice/pageBackgroundSlice";
import { setMobileBackBackground } from "../../redux/slice/mobileBackBG.slice";
import { useMediaQuery } from "@mui/material";

function BgCard({ backgroundUrlEach }) {
  const dispatch = useDispatch();
  const smallDevice = useMediaQuery("(max-width:600px)");

  const handleChangePageBg = (backgroundUrlEach) => {
    dispatch(setPageBackground(`url('${backgroundUrlEach}')`));
  };

  const handleChangeMobileBackBg = (backgroundUrlEach) => {
    dispatch(setMobileBackBackground(`url('${backgroundUrlEach}')`));
    localStorage.removeItem("pageBackground");
  };

  return (
    <div
      onClick={() =>
        smallDevice
          ? handleChangeMobileBackBg(backgroundUrlEach)
          : handleChangePageBg(backgroundUrlEach)
      }
      style={{ backgroundImage: `url('${backgroundUrlEach}')` }}
      className="card red"
    >
      <p className="tip">Выбрать</p>
      <p className="second-text">HD 4k фоны</p>
    </div>
  );
}

export default BgCard;
