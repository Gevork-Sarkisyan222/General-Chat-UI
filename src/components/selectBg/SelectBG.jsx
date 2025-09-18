import React from "react";
import "./selectBG.scss";
import { setBackground } from "../../redux/slice/backgroundSlice";
import { useDispatch } from "react-redux";

const BACKGROUNDS = [
  {
    id: "default",
    label: "Default фон",
    preview:
      "https://htmlcolorcodes.com/assets/images/colors/off-white-color-solid-background-1920x1080.png",
    bgValue:
      "url('https://htmlcolorcodes.com/assets/images/colors/off-white-color-solid-background-1920x1080.png')",
  },
  {
    id: "1",
    label: "Горы на рассвете",
    preview:
      "https://i0.wp.com/lizzydavis.com/wp-content/uploads/2022/03/DSC_5981.jpg?resize=1024%2C618&ssl=1",
    bgValue:
      "url('https://i0.wp.com/lizzydavis.com/wp-content/uploads/2022/03/DSC_5981.jpg?resize=1024%2C618&ssl=1')",
  },
  {
    id: "2",
    label: "Абстрактный рассвет",
    preview:
      "https://png.pngtree.com/background/20230425/original/pngtree-abstract-image-taken-from-afar-as-the-sun-rises-over-the-picture-image_2476371.jpg",
    bgValue:
      "url('https://png.pngtree.com/background/20230425/original/pngtree-abstract-image-taken-from-afar-as-the-sun-rises-over-the-picture-image_2476371.jpg')",
  },
  {
    id: "3",
    label: "Небо и облака",
    preview:
      "https://images.pexels.com/photos/15837438/pexels-photo-15837438/free-photo-of-naturaleza-nubes-tiempo-cielo-azul.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    bgValue:
      "url('https://images.pexels.com/photos/15837438/pexels-photo-15837438/free-photo-of-naturaleza-nubes-tiempo-кйелло-azul.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')",
  },
  {
    id: "4",
    label: "Пиксель-закат",
    preview:
      "https://unity3dschool.com/wp-content/uploads/2018/11/zakat-sunrise-1024x576.png",
    bgValue:
      "url('https://unity3dschool.com/wp-content/uploads/2018/11/zakat-sunrise-1024x576.png')",
  },
  {
    id: "5",
    label: "Космос",
    preview: "https://99px.ru/sstorage/53/2012/08/tmb_47560_3790.jpg",
    bgValue: "url('https://99px.ru/sstorage/53/2012/08/tmb_47560_3790.jpg')",
  },
  {
    id: "6",
    label: "Лес мечты",
    preview:
      "https://img.lovepik.com/background/20211022/large/lovepik-dream-forest-background-image_401746907.jpg",
    bgValue:
      "url('https://img.lovepik.com/background/20211022/large/lovepik-dream-forest-background-image_401746907.jpg')",
  },
  {
    id: "7",
    label: "Волны океана",
    preview: "https://www.ssikombucha.com/images/slide-1.jpg",
    bgValue: "url('https://www.ssikombucha.com/images/slide-1.jpg')",
  },
  {
    id: "8",
    label: "Глубокий космос",
    preview:
      "https://st2.depositphotos.com/3442145/7306/i/950/depositphotos_73064499-stock-photo-deep-space-website-banner-background.jpg",
    bgValue:
      "url('https://st2.depositphotos.com/3442145/7306/i/950/depositphotos_73064499-stock-photo-deep-space-website-banner-background.jpg')",
  },
  {
    id: "9",
    label: "Неон-абстракция",
    preview:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnMyBToUMYYsehrsOwBzh-P87GrBMG1pnyWhqIWev1r6E_I0s8nqGisFACSyk6Ga-uUJ0&usqp=CAU",
    bgValue:
      "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnMyBToUMYYsehrsOwBzh-P87GrBMG1pnyWhqIWev1r6E_I0s8nqGisFACSyk6Ga-uUJ0&usqp=CAU')",
  },
  {
    id: "10",
    label: "Яндекс-пейзаж",
    preview:
      "https://img-fotki.yandex.ru/get/4116/41972460.4b/0_9374a_8261953c_orig",
    bgValue:
      "url('https://img-fotki.yandex.ru/get/4116/41972460.4b/0_9374a_8261953c_orig')",
  },
];

function SelectBG({ onClose }) {
  const dispatch = useDispatch();

  const changeBackground = (bgValue) => {
    onClose();
    dispatch(setBackground(bgValue));
  };

  const deleteBackground = () => {
    onClose();
    localStorage.removeItem("background");
  };

  return (
    <div className="bg-picker">
      <header className="bg-picker__header">
        <h3>Выбрать фон</h3>
        <button className="ghost-btn" onClick={onClose} aria-label="Закрыть">
          ✕
        </button>
      </header>

      <div className="bg-grid">
        {BACKGROUNDS.map((item) => (
          <button
            key={item.id}
            className="card"
            style={{ backgroundImage: `${item.bgValue}` }}
            onClick={() =>
              item.isDefault
                ? deleteBackground()
                : changeBackground(item.bgValue)
            }
            aria-label={
              item.isDefault ? "Сбросить фон" : `Выбрать фон: ${item.label}`
            }
          >
            <span className="overlay" />
            <span className="card__meta">
              <span className="card__label" title={item.label}>
                {item.label}
              </span>
              <span className="pill">
                {item.isDefault ? "Сбросить" : "Выбрать"}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SelectBG;
