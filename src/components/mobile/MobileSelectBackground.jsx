import React from "react";
import { useDispatch } from "react-redux";
import {
  setBackground,
  setMakeMirrorBg,
} from "../../redux/slice/backgroundSlice";

import Button from "@mui/joy/Button";
import List from "@mui/joy/List";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import DialogTitle from "@mui/joy/DialogTitle";
import Stack from "@mui/joy/Stack";
import Box from "@mui/joy/Box";
import Grid from "@mui/joy/Grid";
import Card from "@mui/joy/Card";
import AspectRatio from "@mui/joy/AspectRatio";
import Typography from "@mui/joy/Typography";
import IconButton from "@mui/joy/IconButton";
import Tooltip from "@mui/joy/Tooltip";
import CheckRounded from "@mui/icons-material/CheckRounded";
import RefreshRounded from "@mui/icons-material/RefreshRounded";

import "./stylesSelect.scss";

// вытащить чистый URL из CSS значения background: url('...')
const extractUrl = (cssValue) => {
  if (!cssValue) return null;
  const m = String(cssValue).match(/url\(['"]?(.*?)['"]?\)/i);
  return m ? m[1] : null;
};

// те же URL, что используются на десктопе (для мобильной сетки)
const MOBILE_PRESETS = [
  "https://abrakadabra.fun/uploads/posts/2022-02/1643695417_1-abrakadabra-fun-p-krutie-oboi-dlya-chata-1.jpg",
  "https://kartinki.pics/uploads/posts/2021-04/1617278823_38-p-fon-dlya-chata-42.jpg",
  "https://img.freepik.com/free-vector/vector-social-contact-seamless-pattern-white-blue_1284-41919.jpg?semt=ais_hybrid&w=740&q=80",
  "https://abrakadabra.fun/uploads/posts/2022-01/1641219128_1-abrakadabra-fun-p-oboi-dlya-chata-v-tg-1.jpg",
  "https://whatsapped.ru/assets/galleries/8043/priroda02.jpg",
  "https://pibig.info/uploads/posts/2022-11/1669660756_8-pibig-info-p-fon-dlya-chata-instagram-8.jpg",
  "https://masterpiecer-images.s3.yandex.net/c116883a59f811ee927d363fac71b015:upscaled",
  "https://kartin.papik.pro/uploads/posts/2023-06/1686671288_kartin-papik-pro-p-kartinki-krasivie-na-avu-vatsap-priroda-2.jpg",
  "https://zefirka.club/uploads/posts/2022-10/1666204637_1-zefirka-club-p-zastavka-v-vatsap-na-avatarku-dlya-devushe-1.jpg",
  "https://kartinki.pics/uploads/posts/2021-07/thumbs/1626160627_2-kartinkin-com-p-fon-dlya-chata-telegramm-krasivo-2.jpg",
  "https://kartinki.pics/uploads/posts/2021-07/thumbs/1626160694_51-kartinkin-com-p-fon-dlya-chata-telegramm-krasivo-51.jpg",
  "https://abrakadabra.fun/uploads/posts/2022-02/1645565234_2-abrakadabra-fun-p-zadnii-fon-dlya-chata-2.jpg",
  "https://img.lovepik.com/background/20211022/large/lovepik-dream-forest-background-image_401746907.jpg",
  "https://sneg.top/uploads/posts/2023-03/1679132623_sneg-top-p-fon-dlya-chata-lyubov-vkontakte-4.png",
  "https://png.pngtree.com/background/20221228/original/pngtree-love-chat-background-wallpaper-elements-pink-peach-heart-romantic-hand-painted-picture-image_1993082.jpg",
  "https://sotni.ru/wp-content/uploads/2023/08/subaru-impreza-1-1.webp",
  "https://img-fotki.yandex.ru/get/4116/41972460.4b/0_9374a_8261953c_orig",
  "https://kartinki.pics/uploads/posts/2021-07/1627085167_35-kartinkin-com-p-fon-dlya-teksta-voda-krasivo-35.jpg",
];

export default function DialogVerticalScroll({
  mobileLayout,
  setMobileLayout,
  mobileScroll,
  setMobileScroll,
}) {
  const dispatch = useDispatch();

  const changeBackground = (backgroundUrl) => {
    dispatch(setBackground(backgroundUrl));
  };

  const deleteBackground = () => {
    localStorage.removeItem("background");
    window.location.reload();
  };

  // --- mobile: выделяем выбранный фон
  const [selectedUrl, setSelectedUrl] = React.useState(null);
  React.useEffect(() => {
    if (mobileLayout) {
      const saved = extractUrl(localStorage.getItem("background"));
      setSelectedUrl(saved);
    }
  }, [mobileLayout]);

  const handleSelectMobile = (url) => {
    dispatch(setMakeMirrorBg(false));
    const value = `url('${url}')`;
    dispatch(setBackground(value));
    localStorage.setItem("background", value);
    setSelectedUrl(url);
    setMobileLayout(undefined);
  };

  const handleResetMobile = () => {
    dispatch(setBackground(""));
    localStorage.removeItem("background");
    setSelectedUrl(null);
    setMobileLayout(undefined);
  };

  const selectedBorder = "var(--joy-palette-success-500, #16a34a)";

  return (
    <>
      <Stack direction="row" spacing={1}></Stack>
      <Modal
        open={!!mobileLayout}
        onClose={() => {
          setMobileLayout(undefined);
        }}
      >
        <ModalDialog
          layout={mobileLayout}
          sx={{
            width: { xs: "100%", sm: 760, md: "800px" },
            p: { xs: 1.25, md: 2 },
          }}
        >
          <ModalClose />
          <DialogTitle>Выбор фона для чата</DialogTitle>

          {/* ===== MOBILE/TABLET (< md): большие превью ПО ОДНОМУ В РЯД ===== */}
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <Box
              sx={{
                overflowY: mobileScroll ? "auto" : "initial",
                maxHeight: { xs: "72vh", sm: "74vh" },
                mt: 1,
                p: 0.75,
                borderRadius: "lg",
                border: "1px solid rgba(0,0,0,.06)",
                bgcolor: "#fff",
              }}
            >
              <Grid container spacing={1.5}>
                {/* Сброс */}
                <Grid xs={12}>
                  <Card
                    variant="outlined"
                    sx={{
                      bgcolor: "#fff",
                      borderColor:
                        selectedUrl == null
                          ? selectedBorder
                          : "rgba(0,0,0,.08)",
                      borderWidth: selectedUrl == null ? 2 : 1,
                      transition: "border-color .2s, box-shadow .2s",
                      "&:hover": { boxShadow: "sm" },
                    }}
                  >
                    {/* БОЛЬШОЕ превью: 16/9 на всю ширину */}
                    <AspectRatio ratio="16/9" sx={{ borderRadius: "md" }}>
                      <Box
                        sx={{
                          display: "grid",
                          placeItems: "center",
                          gap: 0.5,
                          bgcolor: "#f8fafc",
                        }}
                        onClick={handleResetMobile}
                      >
                        <RefreshRounded />
                        <Typography level="body-sm">Сбросить фон</Typography>
                      </Box>
                    </AspectRatio>

                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <Typography level="body-md" sx={{ px: 0.5, flex: 1 }}>
                        Нет фона
                      </Typography>
                      {selectedUrl == null && (
                        <CheckRounded
                          fontSize="small"
                          sx={{ color: selectedBorder }}
                        />
                      )}
                    </Box>

                    <Button
                      size="md"
                      fullWidth
                      sx={{ mt: 1 }}
                      onClick={handleResetMobile}
                    >
                      Сбросить
                    </Button>
                  </Card>
                </Grid>

                {/* Пресеты — ОДИН В РЯД (xs=12) и крупнее */}
                {MOBILE_PRESETS.map((url, i) => {
                  const isSelected = url === selectedUrl;
                  return (
                    <Grid key={i} xs={12}>
                      <Card
                        variant="outlined"
                        sx={{
                          bgcolor: "#fff",
                          position: "relative",
                          borderColor: isSelected
                            ? selectedBorder
                            : "rgba(0,0,0,.08)",
                          borderWidth: isSelected ? 2 : 1,
                          overflow: "hidden",
                          transition:
                            "box-shadow .2s, transform .2s, border-color .2s",
                          "&:hover": {
                            boxShadow: "md",
                            transform: "translateY(-1px)",
                            borderColor: isSelected
                              ? selectedBorder
                              : "rgba(0,0,0,.16)",
                          },
                        }}
                      >
                        {/* БОЛЬШОЕ превью: 16/9 */}
                        <AspectRatio ratio="16/9" sx={{ borderRadius: "md" }}>
                          <Box
                            sx={{
                              backgroundImage: `url('${url}')`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                            onClick={() => handleSelectMobile(url)}
                          />
                        </AspectRatio>

                        <Box
                          sx={{ display: "flex", alignItems: "center", mt: 1 }}
                        >
                          <Typography
                            level="body-md"
                            sx={{
                              px: 0.5,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              flex: 1,
                            }}
                            title="Фон"
                          >
                            Фон
                          </Typography>

                          {isSelected && (
                            <CheckRounded
                              fontSize="small"
                              sx={{ color: selectedBorder }}
                              aria-label="Выбранный фон"
                            />
                          )}
                        </Box>

                        <Button
                          size="md"
                          fullWidth
                          sx={{ mt: 1 }}
                          onClick={() => handleSelectMobile(url)}
                        >
                          Выбрать
                        </Button>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Box>

          {/* ===== DESKTOP (≥ md): оставляем твою текущую верстку ===== */}
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <List
              sx={{
                overflow: mobileScroll ? "scroll" : "initial",
                mx: "calc(-1 * var(--ModalDialog-padding))",
                px: "var(--ModalDialog-padding)",
                display: "flex",
                flexDirection: "column",
                gap: "17px",
              }}
            >
              <div
                style={{
                  backgroundImage: `url('https://img.freepik.com/free-photo/abstract-surface-and-textures-of-white-concrete-stone-wall_74190-8189.jpg?size=626&ext=jpg&ga=GA1.1.1412446893.1705017600&semt=ais')`,
                }}
                className="card"
              >
                <p className="heading" style={{ color: "black" }}>
                  default фон
                </p>
                <div className="overlay"></div>
                <button
                  className="card-btn"
                  onClick={() => {
                    localStorage.removeItem("background");
                    window.location.reload();
                  }}
                >
                  Выбрать
                </button>
              </div>

              <div
                style={{
                  backgroundImage: `url('https://i0.wp.com/lizzydavis.com/wp-content/uploads/2022/03/DSC_5981.jpg?resize=1024%2C618&ssl=1')`,
                }}
                className="card"
              >
                <p className="heading">Выбрать фон</p>
                <div className="overlay"></div>
                <button
                  className="card-btn"
                  onClick={() =>
                    changeBackground(
                      `url('https://i0.wp.com/lizzydavis.com/wp-content/uploads/2022/03/DSC_5981.jpg?resize=1024%2C618&ssl=1')`
                    )
                  }
                >
                  Выбрать
                </button>
              </div>

              <div
                style={{
                  backgroundImage: `url('https://png.pngtree.com/background/20230425/original/pngtree-abstract-image-taken-from-afar-as-the-sun-rises-over-the-picture-image_2476371.jpg')`,
                }}
                className="card"
              >
                <p className="heading">Выбрать фон</p>
                <div className="overlay"></div>
                <button
                  className="card-btn"
                  onClick={() =>
                    changeBackground(
                      `url('https://png.pngtree.com/background/20230425/original/pngtree-abstract-image-taken-from-afar-as-the-sun-rises-over-the-picture-image_2476371.jpg')`
                    )
                  }
                >
                  Выбрать
                </button>
              </div>

              <div
                style={{
                  backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOxwX0CFoiuwBThy2kO1z9chskc7ETMrYNihVTLjXpKX96Nk8nDnujFeTEk0s-Os_BtDg&usqp=CAU')`,
                }}
                className="card"
              >
                <p className="heading">Выбрать фон</p>
                <div className="overlay"></div>
                <button
                  className="card-btn"
                  onClick={() =>
                    changeBackground(
                      `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOxwX0CFoiuwBThy2kO1z9chskc7ETMrYNihVTLjXpKX96Nk8nDnujFeTEk0s-Os_BtDg&usqp=CAU')`
                    )
                  }
                >
                  Выбрать
                </button>
              </div>

              <div
                style={{
                  backgroundImage: `url('https://celes.club/uploads/posts/2022-11/1667402062_56-celes-club-p-kartinki-dlya-fona-chata-krasivo-58.jpg')`,
                }}
                className="card"
              >
                <p className="heading">Выбрать фон</p>
                <div className="overlay"></div>
                <button
                  className="card-btn"
                  onClick={() =>
                    changeBackground(
                      `url('https://celes.club/uploads/posts/2022-11/1667402062_56-celes-club-p-kartinki-dlya-fona-chata-krasivo-58.jpg')`
                    )
                  }
                >
                  Выбрать
                </button>
              </div>

              <div
                style={{
                  backgroundImage: `url('https://images.pexels.com/photos/15837438/pexels-photo-15837438/free-photo-of-naturaleza-nubes-tiempo-cielo-azul.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')`,
                }}
                className="card"
              >
                <p className="heading">Выбрать фон</p>
                <div className="overlay"></div>
                <button
                  className="card-btn"
                  onClick={() =>
                    changeBackground(
                      `url('https://images.pexels.com/photos/15837438/pexels-photo-15837438/free-photo-of-naturaleza-nubes-tiempo-cielo-azul.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')`
                    )
                  }
                >
                  Выбрать
                </button>
              </div>

              <div
                style={{
                  backgroundImage: `url('https://unity3dschool.com/wp-content/uploads/2018/11/zakat-sunrise-1024x576.png')`,
                }}
                className="card"
              >
                <p className="heading">Выбрать фон</p>
                <div className="overlay"></div>
                <button
                  className="card-btn"
                  onClick={() =>
                    changeBackground(
                      `url('https://unity3dschool.com/wp-content/uploads/2018/11/zakat-sunrise-1024x576.png')`
                    )
                  }
                >
                  Выбрать
                </button>
              </div>

              <div
                style={{
                  backgroundImage: `url('https://art.kartinkof.club/uploads/posts/2023-07/1688878123_art-kartinkof-club-p-piksel-art-rassvet-65.jpg')`,
                }}
                className="card"
              >
                <p className="heading">Выбрать фон</p>
                <div className="overlay"></div>
                <button
                  className="card-btn"
                  onClick={() =>
                    changeBackground(
                      `url('https://art.kartinkof.club/uploads/posts/2023-07/1688878123_art-kartinkof-club-p-piksel-art-rassvet-65.jpg')`
                    )
                  }
                >
                  Выбрать
                </button>
              </div>

              <div
                style={{
                  backgroundImage: `url('https://fons.pibig.info/uploads/posts/2023-05/1685019004_fons-pibig-info-p-krasivie-pikselnie-foni-pinterest-63.png')`,
                }}
                className="card"
              >
                <p className="heading">Выбрать фон</p>
                <div className="overlay"></div>
                <button
                  className="card-btn"
                  onClick={() =>
                    changeBackground(
                      `url('https://fons.pibig.info/uploads/posts/2023-05/1685019004_fons-pibig-info-p-krasivie-pikselnie-foni-pinterest-63.png')`
                    )
                  }
                >
                  Выбрать
                </button>
              </div>

              <div
                style={{
                  backgroundImage: `url('https://celes.club/uploads/posts/2022-05/1653341082_52-celes-club-p-pikselnii-fon-les-krasivie-58.png')`,
                }}
                className="card"
              >
                <p className="heading">Выбрать фон</p>
                <div className="overlay"></div>
                <button
                  className="card-btn"
                  onClick={() =>
                    changeBackground(
                      `url('https://celes.club/uploads/posts/2022-05/1653341082_52-celes-club-p-pikselnii-fon-les-krasivie-58.png')`
                    )
                  }
                >
                  Выбрать
                </button>
              </div>

              <div
                style={{
                  backgroundImage: `url('https://bogatyr.club/uploads/posts/2023-02/thumbs/1677258950_bogatyr-club-p-fon-mainkraft-fon-vkontakte-5.jpg')`,
                }}
                className="card"
              >
                <p className="heading">Выбрать фон</p>
                <div className="overlay"></div>
                <button
                  className="card-btn"
                  onClick={() =>
                    changeBackground(
                      `url('https://bogatyr.club/uploads/posts/2023-02/thumbs/1677258950_bogatyr-club-p-fon-mainkraft-fon-vkontakte-5.jpg')`
                    )
                  }
                >
                  Выбрать
                </button>
              </div>

              <div
                style={{
                  backgroundImage: `url('https://99px.ru/sstorage/53/2012/08/tmb_47560_3790.jpg')`,
                }}
                className="card"
              >
                <p className="heading">Выбрать фон</p>
                <div className="overlay"></div>
                <button
                  className="card-btn"
                  onClick={() =>
                    changeBackground(
                      `url('https://99px.ru/sstorage/53/2012/08/tmb_47560_3790.jpg')`
                    )
                  }
                >
                  Выбрать
                </button>
              </div>

              <div
                style={{
                  backgroundImage: `url('https://img.lovepik.com/background/20211022/large/lovepik-dream-forest-background-image_401746907.jpg')`,
                }}
                className="card"
              >
                <p className="heading">Выбрать фон</p>
                <div className="overlay"></div>
                <button
                  className="card-btn"
                  onClick={() =>
                    changeBackground(
                      `url('https://img.lovepik.com/background/20211022/large/lovepik-dream-forest-background-image_401746907.jpg')`
                    )
                  }
                >
                  Выбрать
                </button>
              </div>

              <div
                style={{
                  backgroundImage: `url('https://www.ssikombucha.com/images/slide-1.jpg')`,
                }}
                className="card"
              >
                <p className="heading">Выбрать фон</p>
                <div className="overlay"></div>
                <button
                  className="card-btn"
                  onClick={() =>
                    changeBackground(
                      `url('https://www.ssikombucha.com/images/slide-1.jpg')`
                    )
                  }
                >
                  Выбрать
                </button>
              </div>

              <div
                style={{
                  backgroundImage: `url('https://art.kartinkof.club/uploads/posts/2023-07/1688878123_art-kartinkof-club-p-piksel-art-rassvet-65.jpg')`,
                }}
                className="card"
              >
                <p className="heading">Выбрать фон</p>
                <div className="overlay"></div>
                <button
                  className="card-btn"
                  onClick={() =>
                    changeBackground(
                      `url('https://art.kartinkof.club/uploads/posts/2023-07/1688878123_art-kartinkof-club-p-piksel-art-rassvet-65.jpg')`
                    )
                  }
                >
                  Выбрать
                </button>
              </div>

              <div
                style={{
                  backgroundImage: `url('https://st2.depositphotos.com/3442145/7306/i/950/depositphotos_73064499-stock-photo-deep-space-website-banner-background.jpg')`,
                }}
                className="card"
              >
                <p className="heading">Выбрать фон</p>
                <div className="overlay"></div>
                <button
                  className="card-btn"
                  onClick={() =>
                    changeBackground(
                      `url('https://st2.depositphotos.com/3442145/7306/i/950/depositphotos_73064499-stock-photo-deep-space-website-banner-background.jpg')`
                    )
                  }
                >
                  Выбрать
                </button>
              </div>

              <div
                style={{
                  backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnMyBToUMYYsehrsOwBzh-P87GrBMG1pnyWhqIWev1r6E_I0s8nqGisFACSyk6Ga-uUJ0&usqp=CAU')`,
                }}
                className="card"
              >
                <p className="heading">Выбрать фон</p>
                <div className="overlay"></div>
                <button
                  className="card-btn"
                  onClick={() =>
                    changeBackground(
                      `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnMyBToUMYYsehrsOwBzh-P87GrBMG1pnyWhqIWev1r6E_I0s8nqGisFACSyk6Ga-uUJ0&usqp=CAU')`
                    )
                  }
                >
                  Выбрать
                </button>
              </div>

              <div
                style={{
                  backgroundImage: `url('https://img-fotki.yandex.ru/get/4116/41972460.4b/0_9374a_8261953c_orig')`,
                }}
                className="card"
              >
                <p className="heading">Выбрать фон</p>
                <div className="overlay"></div>
                <button
                  className="card-btn"
                  onClick={() =>
                    changeBackground(
                      `url('https://img-fotki.yandex.ru/get/4116/41972460.4b/0_9374a_8261953c_orig')`
                    )
                  }
                >
                  Выбрать
                </button>
              </div>
            </List>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
}
