import React, { useState } from 'react';
import Button from '@mui/joy/Button';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Switch from '@mui/joy/Switch';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import DialogTitle from '@mui/joy/DialogTitle';
import Stack from '@mui/joy/Stack';
import './pageBg.scss';
import BgCard from './BgCard';

export default function DialogVerticalScroll({ layout, setLayout, scroll, setScroll }) {
  const backgroundList = {
    backgroundUrl1: 'https://cdn.wallpapersafari.com/73/33/P9b2gR.jpg',
    backgroundUrl2: 'https://wallpaperaccess.com/full/175969.jpg',
    backgroundUrl3:
      'https://images.unsplash.com/photo-1530293959042-0aac487c21e3?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ymx1ZSUyMGFuZCUyMHdoaXRlfGVufDB8fDB8fHww',
    backgroundUrl4:
      'https://wallpapercrafter.com/desktop1/650752-Pyrenees-top-view-clouds-Dublin-Bay-Girona-ryanair.jpg',
    backgroundUrl5:
      'https://2.bp.blogspot.com/-pal2afAdWgY/WAl95cx6UmI/AAAAAAAAC4c/3K4tYADhyW0BWa0ggw90AxkjS1QYEhL7QCLcB/s1600/Blue%2BSky%2BWallpapers%2B5.jpg',
    backgroundUrl6:
      'https://getwallpapers.com/wallpaper/full/0/a/4/1329865-free-desktop-wallpaper-night-sky-1920x1200.jpg',
    backgroundUrl7: 'https://wallpapercave.com/wp/wp5122798.jpg',
    backgroundUrl8:
      'https://www.wallpapers13.com/wp-content/uploads/2016/01/Ocean-transparent-water-blue-sky-with-white-clouds-computer-HD-Wallpaper-for-Desktop-3840x2160-1680x1050.jpg',
    backgroundUrl9:
      'https://images.pling.com/img/00/00/62/09/79/1632855/a40e4890b325125c900980cda7b190a3a6e063483d6c7b3491f92a2b4bbf03b5a5e6.jpg',
    backgroundUrl10: 'https://wallpapercave.com/wp/af8m9MM.jpg',
    backgroundUrl11:
      'https://wallpapercrafter.com/desktop2/707168-agua-azul-mar-naturaleza-1080P.jpg',
    backgroundUrl12:
      'https://www.pixelstalk.net/wp-content/uploads/images6/Awesome-Sky-Background.jpg',
    backgroundUrl13: 'https://wallpaper.dog/large/297263.jpg',
    backgroundUrl14: 'https://www.xtrafondos.com/en/descargar.php?id=56&resolucion=1920x1080',
    backgroundUrl15:
      'https://getwallpapers.com/wallpaper/full/3/e/9/772937-sunset-wallpaper-for-desktop-1920x1200-for-android-tablet.jpg',
    backgroundUrl16: 'https://wallpapercave.com/wp/1riTASZ.jpg',
    backgroundUrl17:
      'https://cutewallpaper.org/21/beach-pictures-wallpaper/Sunset-Beach-Wallpaper-Wallpaper-Stream.jpg',
    backgroundUrl17: 'https://bgfons.com/uploads/sky/sky_texture1998.jpg',
    backgroundUrl18:
      'https://img.freepik.com/premium-photo/best-forest-background-images_977375-21.jpg?w=2000',
    backgroundUrl19:
      'https://previews.123rf.com/images/betelgejze/betelgejze1602/betelgejze160200029/52161364-%D0%B2%D0%B5%D0%BA%D1%82%D0%BE%D1%80-%D0%B3%D0%BE%D1%80%D0%B8%D0%B7%D0%BE%D0%BD%D1%82%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B5-%D0%B1%D0%B5%D1%81%D1%88%D0%BE%D0%B2%D0%BD%D0%BE%D0%B3%D0%BE-%D1%84%D0%BE%D0%BD%D0%B0-%D1%81-%D0%B7%D0%B5%D0%BB%D0%B5%D0%BD%D0%BE%D0%B9-%D1%81%D0%BE%D1%81%D0%BD%D1%8B-%D0%B8%D0%BB%D0%B8-%D0%BF%D0%B8%D1%85%D1%82%D1%8B-%D0%BB%D0%B5%D1%81%D0%B0-%D0%BF%D1%80%D0%B8%D1%80%D0%BE%D0%B4%D0%B0-%D1%84%D0%BE%D0%BD-%D1%81-%D0%B2%D0%B5%D1%87%D0%BD%D0%BE%D0%B7%D0%B5%D0%BB%D0%B5%D0%BD%D1%8B%D1%85.jpg',
  };

  return (
    <>
      <Stack direction="row" spacing={1}></Stack>
      <Modal
        open={!!layout}
        onClose={() => {
          setLayout(undefined);
        }}>
        <ModalDialog sx={{ width: '800px' }} layout={layout}>
          <ModalClose />
          <DialogTitle>Выбор заднего фона</DialogTitle>
          <List
            sx={{
              overflow: scroll ? 'scroll' : 'initial',
              mx: 'calc(-1 * var(--ModalDialog-padding))',
              px: 'var(--ModalDialog-padding)',
            }}>
            <div className="cards">
              {Object.keys(backgroundList).map((key) => (
                <BgCard key={key} backgroundUrlEach={backgroundList[key]} />
              ))}
            </div>
          </List>
        </ModalDialog>
      </Modal>
    </>
  );
}
