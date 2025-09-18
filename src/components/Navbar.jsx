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
import { Avatar } from "@mui/material";
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

const styleForBGModal = {
  position: "absolute",
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  width: "962px",
  gap: "15px",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  maxWidth: "85vw",
  maxHeight: "85vh",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  overflow: "auto",
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
        open={selectedBGModal}
        onClose={handleCloseBGModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={styleForBGModal}>
          <SelectBG />
        </Box>
      </ChangeChatBG>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              onClick={handleMenuChat}
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={chatInfo}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(chatInfo)}
              onClose={handleCloseChatInfo}
            >
              {isAuthenticated && (
                <MenuItem
                  onClick={
                    smallDevice ? handleForMobileBackground : handleOpenBGModal
                  }
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
                    >
                      Поменять задний фон
                    </MenuItem>
                  )}
              {currentUser?.role === "Администратор" ||
              currentUser?.role === "Супер Админ" ? (
                <>
                  <MenuItem onClick={clearChat}>Очистить чат</MenuItem>
                </>
              ) : (
                ""
              )}
              <MenuItem
                onClick={() => {
                  alert("Пожалуйста останься");
                }}
              >
                Покинуть чат
              </MenuItem>
            </Menu>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Общый чат
            </Typography>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Typography variant="p" component="div" sx={{ flexGrow: 1 }}>
                {/* Администратор // Участник */}
                {currentUser?.role}
              </Typography>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar
                  alt={currentUser?.name}
                  src={
                    currentUser?.avatarUrl
                      ? currentUser?.avatarUrl
                      : "/broken-image.jpg"
                  }
                />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {isAuthenticated && (
                  <MenuItem onClick={handleOpenProfileModal}>Профиль</MenuItem>
                )}
                <MenuItem onClick={handleClose}>
                  {isAuthenticated ? (
                    <Link
                      onClick={handleLogout}
                      style={{ color: "black", textDecoration: "none" }}
                    >
                      Выйти с аккаунта
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      style={{ color: "black", textDecoration: "none" }}
                    >
                      Войти
                    </Link>
                  )}
                </MenuItem>
              </Menu>
            </div>
          </Toolbar>
        </AppBar>
      </Box>
    </>
  );
}
