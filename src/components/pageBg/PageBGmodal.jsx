import React, { useState } from "react";
import Button from "@mui/joy/Button";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Switch from "@mui/joy/Switch";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import DialogTitle from "@mui/joy/DialogTitle";
import Stack from "@mui/joy/Stack";
import "./pageBg.scss";
import BgCard from "./BgCard";

export default function DialogVerticalScroll({
  layout,
  setLayout,
  scroll,
  setScroll,
}) {
  const backgroundList = {
    backgroundUrl1: "https://cdn.wallpapersafari.com/73/33/P9b2gR.jpg",
    backgroundUrl2: "https://wallpaperaccess.com/full/175969.jpg",
    backgroundUrl3:
      "https://images.unsplash.com/photo-1530293959042-0aac487c21e3?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ymx1ZSUyMGFuZCUyMHdoaXRlfGVufDB8fDB8fHww",
    backgroundUrl4:
      "https://wallpapercrafter.com/desktop1/650752-Pyrenees-top-view-clouds-Dublin-Bay-Girona-ryanair.jpg",
    backgroundUrl5:
      "https://2.bp.blogspot.com/-pal2afAdWgY/WAl95cx6UmI/AAAAAAAAC4c/3K4tYADhyW0BWa0ggw90AxkjS1QYEhL7QCLcB/s1600/Blue%2BSky%2BWallpapers%2B5.jpg",
    backgroundUrl6:
      "https://getwallpapers.com/wallpaper/full/0/a/4/1329865-free-desktop-wallpaper-night-sky-1920x1200.jpg",
    backgroundUrl7: "https://wallpapercave.com/wp/wp5122798.jpg",
    backgroundUrl13: "https://wallpaper.dog/large/297263.jpg",
    backgroundUrl15:
      "https://getwallpapers.com/wallpaper/full/3/e/9/772937-sunset-wallpaper-for-desktop-1920x1200-for-android-tablet.jpg",
    backgroundUrl16: "https://wallpapercave.com/wp/1riTASZ.jpg",
    backgroundUrl9:
      "https://wallpapers.com/images/featured/nature-2ygv7ssy2k0lxlzu.jpg",
    backgroundUrl8:
      "https://abrakadabra.fun/uploads/posts/2021-12/1639964550_1-abrakadabra-fun-p-standartnie-foni-telegramma-1.png",
    backgroundUrl10:
      "https://kartinki.pics/uploads/posts/2021-07/1626126151_29-kartinkin-com-p-fon-dlya-telegramma-krasivo-30.jpg",
    backgroundUrl11:
      "https://images.wallpaperscraft.ru/image/single/gradient_abstraktsiia_sinij_205793_1920x1080.jpg",
    backgroundUrl12:
      "https://marketplace.canva.com/EAGBzICL4nk/1/0/1600w/canva-pink-and-blue-cute-desktop-wallpaper-EQcU9lTQ_-Q.jpg",

    backgroundUrl14:
      "https://zastavki.gas-kvas.com/uploads/posts/2024-06/zastavki-gas-kvas-com-kqij-p-zastavki-v-chat-25.jpg",

    backgroundUrl17:
      "https://cutewallpaper.org/21/beach-pictures-wallpaper/Sunset-Beach-Wallpaper-Wallpaper-Stream.jpg",
    backgroundUrl17: "https://bgfons.com/uploads/sky/sky_texture1998.jpg",
    backgroundUrl18:
      "https://abrakadabra.fun/uploads/posts/2022-03/1647518106_12-abrakadabra-fun-p-telegram-oboi-dlya-pk-16.png",
    backgroundUrl19:
      "https://zefirka.club/uploads/posts/2022-09/1663555596_1-zefirka-club-p-oboi-dlya-chata-telegramm-1.jpg",
  };

  return (
    <>
      <Stack direction="row" spacing={1}></Stack>
      <Modal
        open={!!layout}
        onClose={() => {
          setLayout(undefined);
        }}
      >
        <ModalDialog sx={{ width: "800px" }} layout={layout}>
          <ModalClose />
          <DialogTitle>Выбор заднего фона</DialogTitle>
          <List
            sx={{
              overflow: scroll ? "scroll" : "initial",
              mx: "calc(-1 * var(--ModalDialog-padding))",
              px: "var(--ModalDialog-padding)",
            }}
          >
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
