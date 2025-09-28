import React, { useEffect, useState } from "react";
import "./chat.scss";
import { Avatar } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "../../axios";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import { useSelector } from "react-redux";
import ProfileModalJoy from "@mui/joy/Modal";
import ImageViewModal from "@mui/joy/Modal";
import OtherProfile from ".././Profile/OtherProfile";

import Badge from "@mui/material/Badge";
import { styled } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { IconButton } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    width: "10px",
    height: "10px",
    borderRadius: "20px",
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

function ChatSection({
  message,
  isEdited,
  setMessages,
  socket,
  alreadyOnline,
}) {
  const smallDevice = useMediaQuery("(max-width:500px)");
  const [edit, setEdit] = useState("");
  const [editModal, setEditModal] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

  const handleOpenEditModal = () => setEditModal(true);
  const handleCloseEditModal = () => setEditModal(false);

  const deleteMessage = async () => {
    const messageDelete = window.confirm(
      "Вы действительно хотите удалить ваше сообшение?"
    );

    if (messageDelete) {
      socket.current.emit("deleteMessage", { messageId: message._id });

      await axios.delete(`/chat/message/${message._id}`);
      // const res = await axios.get('/chat/message');
      // setMessages(res.data);
    }
  };

  const editMessage = async () => {
    await axios.put(`/chat/message/${message._id}`, { message: edit });
    setEditModal(false);
    // update chat and then getting users from DB
    socket.current.emit("updateMessage", {
      messageId: message._id,
      editedMessage: edit,
    });
    // const res = await axios.get('/chat/message');
    // setMessages(res.data);
  };

  // new function not used
  // const updateChatInClick = async () => {
  //   const res = await axios.get('/chat/message');
  //   setMessages(res.data);
  //   setEditModal(true);
  // };

  const { background } = useSelector((state) => state.background);

  const [profileModal, setProfileModal] = useState(false);
  const handleOpenProfileModal = () => {
    setProfileModal(true);
  };
  const handleCloseProfileModal = () => {
    setProfileModal(false);
  };

  const style = {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: smallDevice ? 240 : 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  const imageViewStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    maxWidth: smallDevice ? "90vw" : "80vw", // ограничение по ширине экрана
    maxHeight: "85vh", // ограничение по высоте экрана
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 2, // чуть меньше паддинга, чтобы не съедало место
    display: "flex",
    justifyContent: "center",
    alignItems: "center", // центрирование по вертикали
    overflow: "auto", // если картинка больше окна — можно скроллить
  };

  const [imageView, setImageView] = React.useState(false);
  const [imageUrlView, setImageUrlView] = useState("");
  const handleOpenImageView = (imageUrl) => {
    setImageView(true);
    setImageUrlView(imageUrl);
  };
  const handleCloseImageView = () => setImageView(false);

  // Тот самый off-white URL
  const OFF_WHITE_URL =
    "https://htmlcolorcodes.com/assets/images/colors/off-white-color-solid-background-1920x1080.png";

  // Достаём чистый URL из значения background/backgroundImage
  function extractUrl(bg) {
    if (!bg) return "";
    const s = String(bg).trim();
    // матчим url("...") / url('...') / url(...)
    const m = s.match(/url\((?:'|")?([^'")]+)(?:'|")?\)/i);
    const raw = m ? m[1] : s; // если не найдено url(...), считаем что уже чистый URL
    return raw.replace(/^['"]|['"]$/g, ""); // убираем крайние кавычки на всякий
  }

  // Проверка именно этого фона
  function isOffWhiteBackground(bg) {
    const url = extractUrl(bg);
    // Точно совпадает или хотя бы оканчивается на нужный файл (на случай относительных путей/параметров)
    return (
      url === OFF_WHITE_URL ||
      url.endsWith("off-white-color-solid-background-1920x1080.png")
    );
  }

  // Основная функция выбора цвета текста
  function getTextColor(bg) {
    return isOffWhiteBackground(bg) ? "black" : "white";
  }

  // Пример использования
  // background может быть: "url('https://htmlcolorcodes.com/...png')" или просто URL строка
  const textColor = getTextColor(background);

  return (
    <>
      <ImageViewModal open={imageView} onClose={handleCloseImageView}>
        <div
          role="dialog"
          aria-modal="true"
          onClick={handleCloseImageView}
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(2px)",
            /* воздух по краям + вырезы */
            "--pad": "clamp(8px, 3vw, 24px)",
            paddingTop: "calc(env(safe-area-inset-top) + var(--pad))",
            paddingRight: "calc(env(safe-area-inset-right) + var(--pad))",
            paddingBottom: "calc(env(safe-area-inset-bottom) + var(--pad))",
            paddingLeft: "calc(env(safe-area-inset-left) + var(--pad))",
            boxSizing: "border-box",
            overflow: "hidden",
            zIndex: 1300,
          }}
        >
          {/* Якорь равен РЕАЛЬНОМУ размеру картинки */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              display: "inline-block",
              lineHeight: 0,
              /* не шире/выше доступного окна */
              maxWidth:
                "calc(100vw - (2 * var(--pad)) - env(safe-area-inset-left) - env(safe-area-inset-right))",
              maxHeight:
                "calc(100dvh - (2 * var(--pad)) - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
            }}
          >
            {/* Крестик — ВНУТРИ картинки, всегда виден */}
            <IconButton
              aria-label="Закрыть изображение"
              onClick={handleCloseImageView}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                bgcolor: "rgba(0,0,0,0.5)",
                color: "#fff",
                "&:hover": { bgcolor: "rgba(0,0,0,0.65)" },
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                zIndex: 1,
              }}
            >
              <CloseRoundedIcon />
            </IconButton>

            {/* Картинка: вписать С ЦЕЛОСТНОСТЬЮ */}
            <img
              src={imageUrlView}
              alt="view image"
              draggable={false}
              style={{
                display: "block",
                /* магия полного вписывания для любых пропорций */
                maxWidth:
                  "calc(100vw - (2 * var(--pad)) - env(safe-area-inset-left) - env(safe-area-inset-right))",
                maxHeight:
                  "calc(100dvh - (2 * var(--pad)) - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                userSelect: "none",
                touchAction: "pan-y pinch-zoom",
              }}
            />
          </div>
        </div>
      </ImageViewModal>

      <ProfileModalJoy
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={profileModal}
        onClose={handleCloseProfileModal}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <OtherProfile alreadyOnline={alreadyOnline} user={message?.user} />
      </ProfileModalJoy>
      <Modal
        open={editModal}
        onClose={handleCloseEditModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Изменить сообшение <BorderColorIcon />
          </Typography>
          <TextField
            onChange={(e) => setEdit(e.target.value)}
            defaultValue={message?.message}
            id="standard-basic"
            label="Напишите сообшение"
            variant="standard"
          />
          <Button onClick={editMessage} variant="contained">
            Сохранить
          </Button>
        </Box>
      </Modal>
      <div
        style={{
          flexDirection:
            message.user?._id === currentUser?._id ? "row-reverse" : "",
        }}
        className="Chat-Section"
      >
        {alreadyOnline ? (
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            variant="dot"
          >
            <Avatar
              sx={{ cursor: "pointer" }}
              onClick={handleOpenProfileModal}
              alt={message.user?.name}
              src={
                message.user?.avatarUrl
                  ? message.user?.avatarUrl
                  : "/broken-image.jpg"
              }
            />
          </StyledBadge>
        ) : (
          <Avatar
            sx={{ cursor: "pointer" }}
            onClick={handleOpenProfileModal}
            alt={message.user?.name}
            src={
              message.user?.avatarUrl
                ? message.user?.avatarUrl
                : "/broken-image.jpg"
            }
          />
        )}

        <div
          style={{
            background:
              message.user?._id === currentUser?._id
                ? "linear-gradient(0deg, #57ffe3 0%, #ededed 100%)"
                : "#efefef",
          }}
          className="Message-Section"
        >
          <p className="name">{message.user?.name}</p>
          <p className="role">
            {message.user?.role === "Администратор" ||
            message.user?.role === "Супер Админ"
              ? message.user?.role
              : ""}
          </p>
          <div className="text-place">
            <p className="text">{message?.message}</p>
            {message?.image && (
              <div
                onClick={() => handleOpenImageView(message?.image)}
                className="image"
                style={{
                  display: "inline-block",
                  cursor: "pointer",
                  maxWidth: "100%", // ограничение по ширине контейнера
                }}
              >
                <img
                  src={message?.image}
                  alt=""
                  style={{
                    maxWidth: "100%", // чтобы не вылезала за экран
                    height: "auto", // сохраняет пропорции
                    borderRadius: "8px", // опционально — скругление углов
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "11px",
            justifyContent: "flex-end",
            color: textColor,
          }}
        >
          <p>
            {new Date(message.createdAt).getHours().toString().padStart(2, "0")}
            :
            {new Date(message.createdAt)
              .getMinutes()
              .toString()
              .padStart(2, "0")}
          </p>
        </div>
        {isEdited && (
          <>
            <EditIcon
              onClick={handleOpenEditModal}
              sx={{ cursor: "pointer", color: "rgb(255, 102, 0)" }}
            />
            <DeleteIcon
              onClick={deleteMessage}
              sx={{ cursor: "pointer", color: "red" }}
            />
          </>
        )}
      </div>
    </>
  );
}

export default ChatSection;
