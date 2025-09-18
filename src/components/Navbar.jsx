import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import { Avatar, Chip } from "@mui/material"; // добавил Chip
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { isAuthUser } from "../redux/slice/userSlice";
import { logout } from "../redux/slice/userSlice";
import ChangeChatBG from "@mui/material/Modal";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import axios from ".././axios";
import SelectBG from "./selectBg/SelectBG";
import ProfileModal from "@mui/material/Modal";
import Profile from "./Profile/Profile";

import ProfileModalJoy from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import TypographyJoy from "@mui/joy/Typography";
import PageBgmodal from "./pageBg/PageBGmodal";
import { setBackground } from "../redux/slice/backgroundSlice";
import { setPageBackground } from "../redux/slice/pageBackgroundSlice";
import useMediaQuery from "@mui/material/useMediaQuery";
import MobileSelectBackground from "./mobile/MobileSelectBackground";

export const styleForBGModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "1000px",
  maxWidth: "92vw",
  maxHeight: "86vh",
  p: 0,
  bgcolor: "transparent",

  "& .bg-modal": {
    background:
      "linear-gradient(180deg, rgba(255,255,255,.85), rgba(255,255,255,.75))",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0,0,0,.25)",
    border: "1px solid var(--tag-theme-bg, rgba(0,0,0,.08))",
    display: "flex",
    flexDirection: "column",
    maxHeight: "inherit",
    height: "auto",
    overflow: "hidden",
  },

  "@media (max-width: 480px)": {
    maxWidth: "98vw",
    maxHeight: "92vh",
    "& .bg-modal": { borderRadius: "14px" },
  },
};

export default function MenuAppBar({ socket, setMessages }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [chatInfo, setChatInfo] = React.useState(null);

  const currentUser = useSelector((state) => state.user.currentUser);
  const isAuthenticated = useSelector(isAuthUser);
  const dispatch = useDispatch();
  const smallDevice = useMediaQuery("(max-width:600px)");
  const [clickedCleared, setClickedCleared] = React.useState("noCleared");

  useEffect(() => {
    if (socket.current) {
      socket.current.on("chatCleared", ({ userId }) => {
        console.log(
          `Функция chatCleared сработало и ваш чат был очишен ${userId}`
        );
        setMessages([]);
      });
    }
  }, [clickedCleared === "cleared"]);

  const clearChat = async () => {
    const message = window.confirm("Вы действительно хотите очистить чат?");
    if (message) {
      console.log("its our id gevs", currentUser?._id);
      await axios.delete("/chat/messages");
      socket.current.emit("clearChat", { userId: currentUser?._id });
      setClickedCleared("cleared");
      setChatInfo(null);
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuChat = (event) => {
    setChatInfo(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCloseChatInfo = () => {
    setChatInfo(null);
  };

  const handleLogout = () => {
    const deleteMessage = window.confirm(
      "Вы действительно хотите выйти с аккаунта?"
    );
    if (deleteMessage) {
      dispatch(logout());
      setAnchorEl(null);
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("background");
      window.localStorage.removeItem("pageBackground");
      window.location.reload();
      if (smallDevice) {
        dispatch(
          setPageBackground(
            `url('https://bogatyr.club/uploads/posts/2023-03/thumbs/1678443872_bogatyr-club-p-kristalno-belii-fon-foni-oboi-57.jpg')`
          )
        );
      } else {
        return null;
      }
    }
  };

  const [selectedBGModal, setSelectedBGModal] = useState(false);

  const handleOpenBGModal = () => {
    setSelectedBGModal(true);
    setChatInfo(null);
  };
  const handleCloseBGModal = () => {
    setSelectedBGModal(false);
  };

  const [profileModal, setProfileModal] = useState(false);
  const handleOpenProfileModal = () => {
    setProfileModal(true);
    setAnchorEl(null);
  };
  const handleCloseProfileModal = () => {
    setProfileModal(false);
  };

  const [layout, setLayout] = React.useState(undefined);
  const [scroll, setScroll] = React.useState(true);

  const [mobileLayout, setMobileLayout] = React.useState(undefined);
  const [mobileScroll, setMobileScroll] = React.useState(true);

  const handleForMobileBackground = () => {
    setMobileLayout("center");
    setChatInfo(null);
  };

  /* ======= MODERN NAVBAR UI ONLY BELOW ======= */

  return (
    <>
      <PageBgmodal
        layout={layout}
        setLayout={setLayout}
        scroll={scroll}
        setScroll={setScroll}
      />
      <MobileSelectBackground
        mobileLayout={mobileLayout}
        setMobileLayout={setMobileLayout}
        mobileScroll={mobileScroll}
        setMobileScroll={setMobileScroll}
      />
      <ProfileModalJoy
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={profileModal}
        onClose={handleCloseProfileModal}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Profile />
      </ProfileModalJoy>

      <ChangeChatBG
        style={{
          transition: "opacity 0.5s ease",
          padding: "20px",
          marginTop: "20px",
          borderRadius: "12px",
          color: "#fff",
          fontWeight: "600",
          textAlign: "center",
        }}
        open={selectedBGModal}
        onClose={handleCloseBGModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={styleForBGModal}>
          <div className="bg-modal">
            <SelectBG onClose={handleCloseBGModal} />
          </div>
        </Box>
      </ChangeChatBG>

      {/* NAVBAR */}
      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,.92) 0%, rgba(255,255,255,.82) 100%)",
            color: "rgba(17, 24, 39, .9)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(17, 24, 39, .08)",
          }}
        >
          <Toolbar
            sx={{
              minHeight: { xs: 56, sm: 64 },
              px: { xs: 1, sm: 2 },
              gap: 1,
            }}
          >
            {/* Left: burger */}
            <IconButton
              onClick={handleMenuChat}
              size="large"
              edge="start"
              sx={{
                color: "inherit",
                mr: { xs: 0.5, sm: 1.5 },
                borderRadius: 2,
                "&:hover": { bgcolor: "rgba(17,24,39,.06)" },
              }}
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>

            {/* Center: title */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexGrow: 1,
                minWidth: 0,
              }}
            >
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 800,
                  letterSpacing: 0.2,
                  lineHeight: 1,
                  fontSize: { xs: 16, sm: 18, md: 20 },
                }}
              >
                Общый чат
              </Typography>

              {/* роль — компактный чип, чтобы не прыгал макет */}
              {currentUser?.role && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={currentUser?.role}
                  sx={{
                    ml: 0.5,
                    fontWeight: 700,
                    height: 24,
                    borderColor: "rgba(17,24,39,.14)",
                  }}
                />
              )}
            </Box>

            {/* Right: avatar */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                sx={{
                  color: "inherit",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "rgba(17,24,39,.06)" },
                }}
              >
                <Avatar
                  alt={currentUser?.name}
                  src={
                    currentUser?.avatarUrl
                      ? currentUser?.avatarUrl
                      : "/broken-image.jpg"
                  }
                  sx={{ width: 36, height: 36 }}
                />
              </IconButton>
            </Box>

            {/* CHAT MENU (бургер) */}
            <Menu
              id="menu-appbar"
              anchorEl={chatInfo}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              open={Boolean(chatInfo)}
              onClose={handleCloseChatInfo}
              PaperProps={{
                elevation: 0,
                sx: {
                  mt: 1,
                  overflow: "hidden",
                  borderRadius: 2,
                  backdropFilter: "blur(10px)",
                  background: "linear-gradient(180deg,#ffffff,#f7f7f9)",
                  border: "1px solid rgba(17,24,39,.08)",
                  boxShadow:
                    "0 10px 30px rgba(17,24,39,.12), 0 0 0 1px rgba(17,24,39,.04)",
                },
              }}
              MenuListProps={{ sx: { py: 0.5 } }}
            >
              {isAuthenticated && (
                <MenuItem
                  onClick={
                    smallDevice ? handleForMobileBackground : handleOpenBGModal
                  }
                  sx={{ py: 1.1, px: 2 }}
                >
                  Поменять фон чата
                </MenuItem>
              )}

              {smallDevice
                ? ""
                : isAuthenticated && (
                    <MenuItem
                      onClick={() => {
                        setLayout("center");
                        setChatInfo(null);
                      }}
                      sx={{ py: 1.1, px: 2 }}
                    >
                      Поменять задний фон
                    </MenuItem>
                  )}

              {currentUser?.role === "Администратор" ||
              currentUser?.role === "Супер Админ" ? (
                <MenuItem onClick={clearChat} sx={{ py: 1.1, px: 2 }}>
                  Очистить чат
                </MenuItem>
              ) : (
                ""
              )}

              <MenuItem
                onClick={() => {
                  alert("Пожалуйста останься");
                }}
                sx={{ py: 1.1, px: 2 }}
              >
                Покинуть чат
              </MenuItem>
            </Menu>

            {/* USER MENU (аватар) */}
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  mt: 1,
                  overflow: "hidden",
                  borderRadius: 2,
                  backdropFilter: "blur(10px)",
                  background: "linear-gradient(180deg,#ffffff,#f7f7f9)",
                  border: "1px solid rgba(17,24,39,.08)",
                  boxShadow:
                    "0 10px 30px rgba(17,24,39,.12), 0 0 0 1px rgba(17,24,39,.04)",
                  minWidth: 180,
                },
              }}
              MenuListProps={{ sx: { py: 0.5 } }}
            >
              {isAuthenticated && (
                <MenuItem
                  onClick={handleOpenProfileModal}
                  sx={{ py: 1.1, px: 2 }}
                >
                  Профиль
                </MenuItem>
              )}
              <MenuItem onClick={handleClose} sx={{ py: 1.1, px: 2 }}>
                {isAuthenticated ? (
                  <Link
                    onClick={handleLogout}
                    style={{ color: "inherit", textDecoration: "none" }}
                    to="#"
                  >
                    Выйти с аккаунта
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    Войти
                  </Link>
                )}
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
      </Box>
    </>
  );
}
