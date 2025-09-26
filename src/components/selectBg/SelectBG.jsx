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
    id: "01",
    label: "askert фон",
    preview:
      "https://abrakadabra.fun/uploads/posts/2022-02/1643695417_1-abrakadabra-fun-p-krutie-oboi-dlya-chata-1.jpg",
    bgValue:
      "url('https://abrakadabra.fun/uploads/posts/2022-02/1643695417_1-abrakadabra-fun-p-krutie-oboi-dlya-chata-1.jpg')",
  },
  {
    id: "1",
    label: "Горы на рассвете",
    preview:
      "https://kartinki.pics/uploads/posts/2021-04/1617278823_38-p-fon-dlya-chata-42.jpg",
    bgValue:
      "url('https://kartinki.pics/uploads/posts/2021-04/1617278823_38-p-fon-dlya-chata-42.jpg')",
  },
  {
    id: "2",
    label: "Абстрактный рассвет",
    preview:
      "https://img.freepik.com/free-vector/vector-social-contact-seamless-pattern-white-blue_1284-41919.jpg?semt=ais_hybrid&w=740&q=80",
    bgValue:
      "url('https://img.freepik.com/free-vector/vector-social-contact-seamless-pattern-white-blue_1284-41919.jpg?semt=ais_hybrid&w=740&q=80')",
  },
  {
    id: "3",
    label: "Небо и облака",
    preview:
      "https://abrakadabra.fun/uploads/posts/2022-01/1641219128_1-abrakadabra-fun-p-oboi-dlya-chata-v-tg-1.jpg",
    bgValue:
      "url('https://abrakadabra.fun/uploads/posts/2022-01/1641219128_1-abrakadabra-fun-p-oboi-dlya-chata-v-tg-1.jpg')",
  },
  {
    id: "4",
    label: "Пиксель-закат",
    preview: "https://whatsapped.ru/assets/galleries/8043/priroda02.jpg",
    bgValue: "url('https://whatsapped.ru/assets/galleries/8043/priroda02.jpg')",
  },
  {
    id: "5",
    label: "Космос",
    preview:
      "https://pibig.info/uploads/posts/2022-11/1669660756_8-pibig-info-p-fon-dlya-chata-instagram-8.jpg",
    bgValue:
      "url('https://pibig.info/uploads/posts/2022-11/1669660756_8-pibig-info-p-fon-dlya-chata-instagram-8.jpg')",
  },
  {
    id: "6",
    label: "Лес мечты",
    preview:
      "https://masterpiecer-images.s3.yandex.net/c116883a59f811ee927d363fac71b015:upscaled",
    bgValue:
      "url('https://masterpiecer-images.s3.yandex.net/c116883a59f811ee927d363fac71b015:upscaled')",
  },
  {
    id: "7",
    label: "Волны океана",
    preview:
      "https://kartin.papik.pro/uploads/posts/2023-06/1686671288_kartin-papik-pro-p-kartinki-krasivie-na-avu-vatsap-priroda-2.jpg",
    bgValue:
      "url('https://kartin.papik.pro/uploads/posts/2023-06/1686671288_kartin-papik-pro-p-kartinki-krasivie-na-avu-vatsap-priroda-2.jpg')",
  },
  {
    id: "8",
    label: "Глубокий космос",
    preview:
      "https://zefirka.club/uploads/posts/2022-10/1666204637_1-zefirka-club-p-zastavka-v-vatsap-na-avatarku-dlya-devushe-1.jpg",
    bgValue:
      "url('https://zefirka.club/uploads/posts/2022-10/1666204637_1-zefirka-club-p-zastavka-v-vatsap-na-avatarku-dlya-devushe-1.jpg')",
  },
  {
    id: "9",
    label: "Неон-абстракция",
    preview:
      "https://kartinki.pics/uploads/posts/2021-07/thumbs/1626160627_2-kartinkin-com-p-fon-dlya-chata-telegramm-krasivo-2.jpg",
    bgValue:
      "url('https://kartinki.pics/uploads/posts/2021-07/thumbs/1626160627_2-kartinkin-com-p-fon-dlya-chata-telegramm-krasivo-2.jpg')",
  },
  {
    id: "10",
    label: "Яндекс-пейзаж",
    preview:
      "https://kartinki.pics/uploads/posts/2021-07/thumbs/1626160694_51-kartinkin-com-p-fon-dlya-chata-telegramm-krasivo-51.jpg",
    bgValue:
      "url('https://kartinki.pics/uploads/posts/2021-07/thumbs/1626160694_51-kartinkin-com-p-fon-dlya-chata-telegramm-krasivo-51.jpg')",
  },

  // новые элементы, чтобы задействовать все оставшиеся ссылки
  {
    id: "11",
    label: "Задний фон для чата",
    preview:
      "https://abrakadabra.fun/uploads/posts/2022-02/1645565234_2-abrakadabra-fun-p-zadnii-fon-dlya-chata-2.jpg",
    bgValue:
      "url('https://abrakadabra.fun/uploads/posts/2022-02/1645565234_2-abrakadabra-fun-p-zadnii-fon-dlya-chata-2.jpg')",
  },
  {
    id: "12",
    label: "Лес мечты (2)",
    preview:
      "https://img.lovepik.com/background/20211022/large/lovepik-dream-forest-background-image_401746907.jpg",
    bgValue:
      "url('https://img.lovepik.com/background/20211022/large/lovepik-dream-forest-background-image_401746907.jpg')",
  },
  {
    id: "13",
    label: "Любовный фон",
    preview:
      "https://sneg.top/uploads/posts/2023-03/1679132623_sneg-top-p-fon-dlya-chata-lyubov-vkontakte-4.png",
    bgValue:
      "url('https://sneg.top/uploads/posts/2023-03/1679132623_sneg-top-p-fon-dlya-chata-lyubov-vkontakte-4.png')",
  },
  {
    id: "14",
    label: "Персиковые сердца",
    preview:
      "https://png.pngtree.com/background/20221228/original/pngtree-love-chat-background-wallpaper-elements-pink-peach-heart-romantic-hand-painted-picture-image_1993082.jpg",
    bgValue:
      "url('https://png.pngtree.com/background/20221228/original/pngtree-love-chat-background-wallpaper-elements-pink-peach-heart-romantic-hand-painted-picture-image_1993082.jpg')",
  },
  {
    id: "15",
    label: "Subaru Impreza",
    preview:
      "https://sotni.ru/wp-content/uploads/2023/08/subaru-impreza-1-1.webp",
    bgValue:
      "url('https://sotni.ru/wp-content/uploads/2023/08/subaru-impreza-1-1.webp')",
  },
  {
    id: "16",
    label: "Яндекс-пейзаж (оригинал)",
    preview:
      "https://img-fotki.yandex.ru/get/4116/41972460.4b/0_9374a_8261953c_orig",
    bgValue:
      "url('https://img-fotki.yandex.ru/get/4116/41972460.4b/0_9374a_8261953c_orig')",
  },
  {
    id: "17",
    label: "Вода и текст",
    preview:
      "https://kartinki.pics/uploads/posts/2021-07/1627085167_35-kartinkin-com-p-fon-dlya-teksta-voda-krasivo-35.jpg",
    bgValue:
      "url('https://kartinki.pics/uploads/posts/2021-07/1627085167_35-kartinkin-com-p-fon-dlya-teksta-voda-krasivo-35.jpg')",
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
