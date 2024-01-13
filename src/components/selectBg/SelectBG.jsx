import React, { useState } from 'react';
import './selectBG.scss';
import { setBackground } from '../../redux/slice/backgroundSlice';
import { useDispatch } from 'react-redux';

function SelectBG() {
  const dispatch = useDispatch();

  const changeBackground = (backgroundUrl) => {
    dispatch(setBackground(backgroundUrl));
  };

  const deleteBackground = () => {
    localStorage.removeItem('background');
    window.location.reload();
  };

  return (
    <>
      <div
        style={{
          backgroundImage: `url('https://img.freepik.com/free-photo/abstract-surface-and-textures-of-white-concrete-stone-wall_74190-8189.jpg?size=626&ext=jpg&ga=GA1.1.1412446893.1705017600&semt=ais')`,
        }}
        class="card">
        <p class="heading" style={{ color: 'black' }}>
          default фон
        </p>
        <div class="overlay"></div>
        <button class="card-btn" onClick={deleteBackground}>
          Выбрать
        </button>
      </div>
      <div
        style={{
          backgroundImage: `url('https://i0.wp.com/lizzydavis.com/wp-content/uploads/2022/03/DSC_5981.jpg?resize=1024%2C618&ssl=1')`,
        }}
        class="card">
        <p class="heading">Выбрать фон</p>
        <div class="overlay"></div>
        <button
          class="card-btn"
          onClick={() =>
            changeBackground(
              `url('https://i0.wp.com/lizzydavis.com/wp-content/uploads/2022/03/DSC_5981.jpg?resize=1024%2C618&ssl=1')`,
            )
          }>
          Выбрать
        </button>
      </div>
      <div
        style={{
          backgroundImage: `url('https://png.pngtree.com/background/20230425/original/pngtree-abstract-image-taken-from-afar-as-the-sun-rises-over-the-picture-image_2476371.jpg')`,
        }}
        class="card">
        <p class="heading">Выбрать фон</p>
        <div class="overlay"></div>
        <button
          class="card-btn"
          onClick={() =>
            changeBackground(
              `url('https://png.pngtree.com/background/20230425/original/pngtree-abstract-image-taken-from-afar-as-the-sun-rises-over-the-picture-image_2476371.jpg')`,
            )
          }>
          Выбрать
        </button>
      </div>
      <div
        style={{
          backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOxwX0CFoiuwBThy2kO1z9chskc7ETMrYNihVTLjXpKX96Nk8nDnujFeTEk0s-Os_BtDg&usqp=CAU')`,
        }}
        class="card">
        <p class="heading">Выбрать фон</p>
        <div class="overlay"></div>
        <button
          class="card-btn"
          onClick={() =>
            changeBackground(
              `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOxwX0CFoiuwBThy2kO1z9chskc7ETMrYNihVTLjXpKX96Nk8nDnujFeTEk0s-Os_BtDg&usqp=CAU')`,
            )
          }>
          Выбрать
        </button>
      </div>
      <div
        style={{
          backgroundImage: `url('https://celes.club/uploads/posts/2022-11/1667402062_56-celes-club-p-kartinki-dlya-fona-chata-krasivo-58.jpg')`,
        }}
        class="card">
        <p class="heading">Выбрать фон</p>
        <div class="overlay"></div>
        <button
          class="card-btn"
          onClick={() =>
            changeBackground(
              `url('https://celes.club/uploads/posts/2022-11/1667402062_56-celes-club-p-kartinki-dlya-fona-chata-krasivo-58.jpg')`,
            )
          }>
          Выбрать
        </button>
      </div>
      <div
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/15837438/pexels-photo-15837438/free-photo-of-naturaleza-nubes-tiempo-cielo-azul.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')`,
        }}
        class="card">
        <p class="heading">Выбрать фон</p>
        <div class="overlay"></div>
        <button
          class="card-btn"
          onClick={() =>
            changeBackground(
              `url('https://images.pexels.com/photos/15837438/pexels-photo-15837438/free-photo-of-naturaleza-nubes-tiempo-cielo-azul.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')`,
            )
          }>
          Выбрать
        </button>
      </div>
      <div
        style={{
          backgroundImage: `url('https://unity3dschool.com/wp-content/uploads/2018/11/zakat-sunrise-1024x576.png')`,
        }}
        class="card">
        <p class="heading">Выбрать фон</p>
        <div class="overlay"></div>
        <button
          class="card-btn"
          onClick={() =>
            changeBackground(
              `url('https://unity3dschool.com/wp-content/uploads/2018/11/zakat-sunrise-1024x576.png')`,
            )
          }>
          Выбрать
        </button>
      </div>
      <div
        style={{
          backgroundImage: `url('https://art.kartinkof.club/uploads/posts/2023-07/1688878123_art-kartinkof-club-p-piksel-art-rassvet-65.jpg')`,
        }}
        class="card">
        <p class="heading">Выбрать фон</p>
        <div class="overlay"></div>
        <button
          class="card-btn"
          onClick={() =>
            changeBackground(
              `url('https://art.kartinkof.club/uploads/posts/2023-07/1688878123_art-kartinkof-club-p-piksel-art-rassvet-65.jpg')`,
            )
          }>
          Выбрать
        </button>
      </div>
      <div
        style={{
          backgroundImage: `url('https://fons.pibig.info/uploads/posts/2023-05/1685019004_fons-pibig-info-p-krasivie-pikselnie-foni-pinterest-63.png')`,
        }}
        class="card">
        <p class="heading">Выбрать фон</p>
        <div class="overlay"></div>
        <button
          class="card-btn"
          onClick={() =>
            changeBackground(
              `url('https://fons.pibig.info/uploads/posts/2023-05/1685019004_fons-pibig-info-p-krasivie-pikselnie-foni-pinterest-63.png')`,
            )
          }>
          Выбрать
        </button>
      </div>
      <div
        style={{
          backgroundImage: `url('https://celes.club/uploads/posts/2022-05/1653341082_52-celes-club-p-pikselnii-fon-les-krasivie-58.png')`,
        }}
        class="card">
        <p class="heading">Выбрать фон</p>
        <div class="overlay"></div>
        <button
          class="card-btn"
          onClick={() =>
            changeBackground(
              `url('https://celes.club/uploads/posts/2022-05/1653341082_52-celes-club-p-pikselnii-fon-les-krasivie-58.png')`,
            )
          }>
          Выбрать
        </button>
      </div>
      <div
        style={{
          backgroundImage: `url('https://bogatyr.club/uploads/posts/2023-02/thumbs/1677258950_bogatyr-club-p-fon-mainkraft-fon-vkontakte-5.jpg')`,
        }}
        class="card">
        <p class="heading">Выбрать фон</p>
        <div class="overlay"></div>
        <button
          class="card-btn"
          onClick={() =>
            changeBackground(
              `url('https://bogatyr.club/uploads/posts/2023-02/thumbs/1677258950_bogatyr-club-p-fon-mainkraft-fon-vkontakte-5.jpg')`,
            )
          }>
          Выбрать
        </button>
      </div>
      <div
        style={{
          backgroundImage: `url('https://99px.ru/sstorage/53/2012/08/tmb_47560_3790.jpg')`,
        }}
        class="card">
        <p class="heading">Выбрать фон</p>
        <div class="overlay"></div>
        <button
          class="card-btn"
          onClick={() =>
            changeBackground(`url('https://99px.ru/sstorage/53/2012/08/tmb_47560_3790.jpg')`)
          }>
          Выбрать
        </button>
      </div>
      <div
        style={{
          backgroundImage: `url('https://img.lovepik.com/background/20211022/large/lovepik-dream-forest-background-image_401746907.jpg')`,
        }}
        class="card">
        <p class="heading">Выбрать фон</p>
        <div class="overlay"></div>
        <button
          class="card-btn"
          onClick={() =>
            changeBackground(
              `url('https://img.lovepik.com/background/20211022/large/lovepik-dream-forest-background-image_401746907.jpg')`,
            )
          }>
          Выбрать
        </button>
      </div>
      <div
        style={{
          backgroundImage: `url('https://www.ssikombucha.com/images/slide-1.jpg')`,
        }}
        class="card">
        <p class="heading">Выбрать фон</p>
        <div class="overlay"></div>
        <button
          class="card-btn"
          onClick={() => changeBackground(`url('https://www.ssikombucha.com/images/slide-1.jpg')`)}>
          Выбрать
        </button>
      </div>
      <div
        style={{
          backgroundImage: `url('https://art.kartinkof.club/uploads/posts/2023-07/1688878123_art-kartinkof-club-p-piksel-art-rassvet-65.jpg')`,
        }}
        class="card">
        <p class="heading">Выбрать фон</p>
        <div class="overlay"></div>
        <button
          class="card-btn"
          onClick={() =>
            changeBackground(
              `url('https://art.kartinkof.club/uploads/posts/2023-07/1688878123_art-kartinkof-club-p-piksel-art-rassvet-65.jpg')`,
            )
          }>
          Выбрать
        </button>
      </div>
      <div
        style={{
          backgroundImage: `url('https://st2.depositphotos.com/3442145/7306/i/950/depositphotos_73064499-stock-photo-deep-space-website-banner-background.jpg')`,
        }}
        class="card">
        <p class="heading">Выбрать фон</p>
        <div class="overlay"></div>
        <button
          class="card-btn"
          onClick={() =>
            changeBackground(
              `url('https://st2.depositphotos.com/3442145/7306/i/950/depositphotos_73064499-stock-photo-deep-space-website-banner-background.jpg')`,
            )
          }>
          Выбрать
        </button>
      </div>
      <div
        style={{
          backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnMyBToUMYYsehrsOwBzh-P87GrBMG1pnyWhqIWev1r6E_I0s8nqGisFACSyk6Ga-uUJ0&usqp=CAU')`,
        }}
        class="card">
        <p class="heading">Выбрать фон</p>
        <div class="overlay"></div>
        <button
          class="card-btn"
          onClick={() =>
            changeBackground(
              `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnMyBToUMYYsehrsOwBzh-P87GrBMG1pnyWhqIWev1r6E_I0s8nqGisFACSyk6Ga-uUJ0&usqp=CAU')`,
            )
          }>
          Выбрать
        </button>
      </div>
      <div
        style={{
          backgroundImage: `url('https://img-fotki.yandex.ru/get/4116/41972460.4b/0_9374a_8261953c_orig')`,
        }}
        class="card">
        <p class="heading">Выбрать фон</p>
        <div class="overlay"></div>
        <button
          class="card-btn"
          onClick={() =>
            changeBackground(
              `url('https://img-fotki.yandex.ru/get/4116/41972460.4b/0_9374a_8261953c_orig')`,
            )
          }>
          Выбрать
        </button>
      </div>
    </>
  );
}

export default SelectBG;
