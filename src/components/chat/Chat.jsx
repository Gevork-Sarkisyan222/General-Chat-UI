import React, { useState, useEffect, useMemo, useRef } from "react";
import "./chat.scss";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import ChatSection from "./ChatSection";
import WriteArea from "../write/WriteArea";
import axios from "../../axios";
import Box from "@mui/material/Box";
import UserListModal from "@mui/material/Modal";
import UsersInfo from "./userInfo/UsersInfo";
import { useSelector } from "react-redux";
import { isAuthUser } from "../../redux/slice/userSlice";
import EditGroupIcon from "@mui/icons-material/EditCalendar";
import ChangeGroupModal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import useMediaQuery from "@mui/material/useMediaQuery";
import { io } from "socket.io-client";
import { Card, Stack, alpha } from "@mui/material";
import { Link } from "react-router-dom";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";

const style = {
  position: "absolute",
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

function Chat({ socket, messages, setMessages }) {
  const { background } = useSelector((state) => state.background);
  const { mobileBackBG } = useSelector((state) => state);
  const [online, setOnline] = useState(0);
  const [isOnlineUser, setIsOnlineUser] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const { currentUser } = useSelector((state) => state.user);
  const isAuthenticated = useSelector(isAuthUser);
  const { pageBackground } = useSelector((state) => state.pageBackground);
  const smallDevice = useMediaQuery("(max-width:600px)");
  const scrollRef = useRef(null);

  const styleForGroupModal = {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: smallDevice ? 240 : 400,
    maxWidth: "85vw",
    maxHeight: "85vh",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    overflow: "auto",
  };

  // when message changes adding new scroll will go down with css behavior 'smooth'
  // (оставил как у тебя, но добавил безопасные проверки)
  useEffect(() => {
    if (!isAuthenticated) return; // нет чата — нет скролла
    const messagesContainer = scrollRef.current;
    if (!messagesContainer) return; // DOM ещё не смонтирован

    const newScrollTop =
      messagesContainer.scrollHeight - messagesContainer.clientHeight;

    messagesContainer.scrollTo({
      top: newScrollTop,
      behavior: "smooth",
    });
  }, [isAuthenticated, messages]);

  // socket подключение
  useEffect(() => {
    // socket.current = io('ws://localhost:8080');
    socket.current = io("https://socket-server-v9ni.onrender.com");
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        _id: data.messageId,
        userId: data.userId,
        message: data.message,
        user: data.user,
        createdAt: Date.now(),
      });
    });
  }, []);

  // sending message with socket
  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  // delete message with socket
  useEffect(() => {
    const handler = ({ messageId }) => {
      setMessages((prevMessages) =>
        prevMessages.filter((message) => message._id !== messageId)
      );
    };
    socket.current.on("messageDeleted", handler);
    return () => socket.current?.off("messageDeleted", handler);
  }, [socket, setMessages]);

  // update message with socket
  useEffect(() => {
    const handler = ({ messageId, editedMessage }) => {
      setMessages((prevMessages) => {
        return prevMessages.map((message) =>
          message._id === messageId
            ? { ...message, message: editedMessage }
            : message
        );
      });
    };
    socket.current.on("messageUpdated", handler);
    return () => socket.current?.off("messageUpdated", handler);
  }, [socket, setMessages]);

  useEffect(() => {
    isAuthenticated && socket.current?.emit("addUser", currentUser?._id);
    socket.current?.on("getUsers", (users) => {
      setOnline(users.length);
      setIsOnlineUser(users.map((user) => user.userId));
    });
  }, [currentUser, isAuthenticated, socket]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("/chat/message");
      setMessages(res.data);
    };
    fetchData();
  }, [setMessages]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get("/users");
      setUsers(res.data);
    };
    fetchUsers();
  }, []);

  const createMessage = async () => {
    const res = await axios.post("/chat/message", { message: message });
    socket.current.emit("sendMessage", {
      messageId: res.data._id,
      userId: currentUser?._id,
      user: {
        _id: currentUser?._id,
        name: currentUser?.name,
        role: currentUser?.role,
        avatarUrl: currentUser?.avatarUrl,
      },
      message: message,
    });
    setMessage("");
  };

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const onDeleteUser = (userId) => {
    setUsers(users.filter((user) => user?._id !== userId));
  };

  const [groupName, setGroup] = useState(
    localStorage.getItem("group")
      ? localStorage.getItem("group")
      : "Ровные пацаны"
  );
  const [groupModal, setGroupModal] = useState(false);

  const handleOpenGroupModal = () => {
    const openMessage = window.confirm(
      "Вы действительно хотите изменить название группы?"
    );

    if (openMessage) {
      setGroupModal(true);
    }
  };
  const handleCloseGroupModal = () => setGroupModal(false);

  const saveInfoLSgroup = () => {
    setGroupModal(false);
    localStorage.setItem("group", groupName);
  };

  const checkIfOnline = (userId) => {
    return isOnlineUser.includes(userId);
  };

  // Дополнительный безопасный автоскролл через rAF (оставил, но с проверками)
  useEffect(() => {
    if (!isAuthenticated) return;
    const el = scrollRef.current;
    if (!el) return;

    const rafId = requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });

    return () => cancelAnimationFrame(rafId);
  }, [isAuthenticated, messages]);

  return isAuthenticated ? (
    <>
      <ChangeGroupModal
        open={groupModal}
        onClose={handleCloseGroupModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={styleForGroupModal}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Изменить название чата <BorderColorIcon />
          </Typography>
          <TextField
            onChange={(e) => setGroup(e.target.value)}
            defaultValue={groupName}
            id="standard-basic"
            label="Напишите новое название"
            variant="standard"
          />
          <Button variant="contained" onClick={saveInfoLSgroup}>
            Сохранить
          </Button>
        </Box>
      </ChangeGroupModal>
      <div>
        <UserListModal
          open={open}
          onClose={handleClose}
          sx={{ overflow: "auto" }}
          aria-labelledby="parent-modal-title"
          aria-describedby="parent-modal-description"
        >
          <Box
            sx={{
              ...style,
              width: 295,
              display: "flex",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <section className="scroll-place">
                  {users.map((user) => (
                    <UsersInfo
                      key={user.id}
                      user={user}
                      onDeleteUser={onDeleteUser}
                      alreadyOnline={checkIfOnline(user?._id)}
                    />
                  ))}
                </section>
              </div>
            </div>
          </Box>
        </UserListModal>
      </div>
      <div className="Chat">
        <div
          style={{
            backgroundImage:
              smallDevice && isAuthenticated ? mobileBackBG.mobileBackBG : "",
            color: mobileBackBG.mobileBackBG ? "white" : "black",
          }}
          className="Wrapper"
        >
          <header className="chat-header">
            <div className="chat-header__top">
              <div className="chat-header__title">
                <h2 className="chat-header__name">{groupName}</h2>
                {isAuthenticated && (
                  <EditGroupIcon
                    onClick={handleOpenGroupModal}
                    className="chat-header__edit"
                  />
                )}
              </div>

              <div className="chat-header__online">
                <span className="dot" />
                <span className="count">{online}</span>
                <span className="label">онлайн</span>
              </div>
            </div>

            <div className="chat-header__avatars">
              <AvatarGroup
                max={10}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 0.5,
                  "& .MuiAvatar-root": {
                    width: { xs: 30, sm: 34, md: 36 },
                    height: { xs: 30, sm: 34, md: 36 },
                    boxShadow: "0 1px 3px rgba(0,0,0,.15)",
                    border: "2px solid #fff",
                  },
                }}
                total={users.length}
              >
                {users.map((user) => (
                  <Avatar
                    key={user._id || user.name}
                    onClick={handleOpen}
                    sx={{ cursor: "pointer" }}
                    alt={user.name}
                    src={user.avatarUrl ? user.avatarUrl : "/broken-image.jpg"}
                  />
                ))}
              </AvatarGroup>
            </div>
          </header>

          <div className="down-chat-section">
            <div
              ref={scrollRef}
              style={{ backgroundImage: background }}
              className="chat-area"
            >
              {messages.length > 0 ? (
                messages.map((message) => (
                  <ChatSection
                    key={message?._id}
                    message={message}
                    isEdited={currentUser?._id === message.user?._id}
                    setMessages={setMessages}
                    socket={socket}
                    alreadyOnline={checkIfOnline(message.user?._id)}
                  />
                ))
              ) : (
                <div>
                  <h3 style={{ color: background ? "white" : "black" }}>
                    Чат был очищен
                  </h3>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="write-area">
                <WriteArea
                  createMessage={createMessage}
                  setMessage={setMessage}
                  message={message}
                  socket={socket}
                  setMessages={setMessages}
                />
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </>
  ) : (
    <Box
      sx={{
        minHeight: { xs: "calc(100vh - 120px)", sm: "70vh" },
        display: "grid",
        placeItems: "center",
        px: { xs: 1.5, sm: 2 },
        py: { xs: 2, sm: 0 },
        mx: "24px",
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: { xs: 400, sm: 520 },
          p: { xs: 2.5, sm: 4 },
          borderRadius: { xs: 2, sm: 3 },
          background:
            "linear-gradient(180deg, rgba(255,255,255,.92), rgba(247,247,249,.92))",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(17,24,39,.08)",
          boxShadow:
            "0 18px 48px rgba(17,24,39,.12), 0 0 0 1px rgba(17,24,39,.04)",
        }}
      >
        <Stack
          spacing={{ xs: 2, sm: 2.5 }}
          alignItems="center"
          textAlign="center"
        >
          <Box
            sx={{
              width: { xs: 56, sm: 64 },
              height: { xs: 56, sm: 64 },
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              backgroundColor: (t) => alpha(t.palette.primary.main, 0.08),
              color: "primary.main",
            }}
          >
            <LockOpenRoundedIcon
              sx={{ fontSize: { xs: 26, sm: 28, md: 30 } }}
            />
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              lineHeight: 1.2,
              fontSize: { xs: 20, sm: 22, md: 24 },
            }}
          >
            Приглашение в виде ссылки получено
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              fontSize: { xs: 14, sm: 16 },
              px: { xs: 1, sm: 0 },
            }}
          >
            Войдите в аккаунт, чтобы присоединиться к чату, видеть участников и
            отправлять сообщения.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ mt: 1, width: "100%", justifyContent: "center" }}
          >
            <Button
              component={Link}
              to="/login"
              variant="contained"
              size="large"
              sx={{
                px: { xs: 2, sm: 3 },
                fontWeight: 700,
                borderRadius: 2,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Войти
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
}

export default Chat;
