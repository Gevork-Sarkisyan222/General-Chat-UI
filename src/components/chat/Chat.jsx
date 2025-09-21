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
import { Card, Stack, alpha, IconButton, Tooltip, Chip } from "@mui/material";
import { Link } from "react-router-dom";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";

// NEW(WebRTC): иконки управления звонком
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import CallEndRoundedIcon from "@mui/icons-material/CallEndRounded";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import MicOffRoundedIcon from "@mui/icons-material/MicOffRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import VideocamOffRoundedIcon from "@mui/icons-material/VideocamOffRounded";
import ScreenShareRoundedIcon from "@mui/icons-material/ScreenShareRounded";
import StopScreenShareRoundedIcon from "@mui/icons-material/StopScreenShareRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";

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

  // =========================================================
  // NEW(WebRTC): состояние/рефы видеозвонка
  // =========================================================

  // Настройка ICE: добавь свой TURN в urls для продакшена
  const RTC_CONFIGURATION = useMemo(
    () => ({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // { urls: "turn:YOUR_TURN_HOST:3478", username: "user", credential: "pass" },
      ],
      // optional: iceTransportPolicy: "all",
    }),
    []
  );

  // Общий roomId звонка: для общего чата пусть будет "general"
  const CALL_ROOM_ID = "general";

  const [callOpen, setCallOpen] = useState(false); // модалка звонка
  const [inCall, setInCall] = useState(false); // внутри комнаты звонка
  const [participantsCount, setParticipantsCount] = useState(1);

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  // pc и remote стримы по ключу peer socketId
  const pcsRef = useRef(new Map()); // Map<string, RTCPeerConnection>
  const [remoteStreams, setRemoteStreams] = useState([]); // [{peerId, stream}]
  const remoteStreamsRef = useRef(new Map()); // Map<string, MediaStream>

  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [screenOn, setScreenOn] = useState(false);

  // Утилиты обновления списков потоков
  const upsertRemoteStream = (peerId, stream) => {
    remoteStreamsRef.current.set(peerId, stream);
    setRemoteStreams(
      Array.from(remoteStreamsRef.current.entries()).map(([id, st]) => ({
        peerId: id,
        stream: st,
      }))
    );
    setParticipantsCount(1 + remoteStreamsRef.current.size);
  };
  const removeRemoteStream = (peerId) => {
    remoteStreamsRef.current.delete(peerId);
    setRemoteStreams(
      Array.from(remoteStreamsRef.current.entries()).map(([id, st]) => ({
        peerId: id,
        stream: st,
      }))
    );
    setParticipantsCount(1 + remoteStreamsRef.current.size);
  };

  // Создание/получение PC на конкретного пира
  const ensurePC = (peerId) => {
    if (pcsRef.current.has(peerId)) return pcsRef.current.get(peerId);
    const pc = new RTCPeerConnection(RTC_CONFIGURATION);

    // Отправляем ICE адресно
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.current.emit("call:ice", {
          toSocketId: peerId,
          candidate: e.candidate,
          roomId: CALL_ROOM_ID,
        });
      }
    };

    pc.ontrack = (e) => {
      // Берём первый поток
      const [stream] = e.streams && e.streams.length ? e.streams : [null];
      if (stream) {
        upsertRemoteStream(peerId, stream);
      } else {
        // собираем вручную
        const s = remoteStreamsRef.current.get(peerId) || new MediaStream();
        s.addTrack(e.track);
        upsertRemoteStream(peerId, s);
      }
    };

    // Если локальный стрим уже есть — добавляем треки
    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((t) => pc.addTrack(t, localStreamRef.current));
    }

    pcsRef.current.set(peerId, pc);
    return pc;
  };

  // Вход в звонок
  const joinCall = async () => {
    if (!socket.current) return;

    // 1) Получаем локальные медиа
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    // начальные состояния треков
    stream.getAudioTracks().forEach((t) => (t.enabled = true));
    stream.getVideoTracks().forEach((t) => (t.enabled = true));
    setMicEnabled(true);
    setCamEnabled(true);

    // 2) Подписываемся на сигнальные события
    bindCallSocketEvents();

    // 3) Входим в комнату (новичку вернётся список peers)
    socket.current.emit("call:join", {
      roomId: CALL_ROOM_ID,
      meta: { name: currentUser?.name, avatarUrl: currentUser?.avatarUrl },
    });

    setInCall(true);
    setParticipantsCount(1); // мы сами
  };

  // Выход из звонка
  const leaveCall = () => {
    if (socket.current && inCall) {
      socket.current.emit("call:leave", { roomId: CALL_ROOM_ID });
    }
    cleanupCall();
    setInCall(false);
    setParticipantsCount(1);
  };

  // Полная очистка
  const cleanupCall = () => {
    // Закрыть PC
    pcsRef.current.forEach((pc) => {
      try {
        pc.getSenders().forEach((s) => s.track && s.track.stop());
        pc.close();
      } catch {}
    });
    pcsRef.current.clear();

    // Остановить локальные треки
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;

    // Остановить шэринг
    if (screenStreamRef.current) {
      try {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch {}
      screenStreamRef.current = null;
      setScreenOn(false);
    }

    // Очистить удалённые
    remoteStreamsRef.current.clear();
    setRemoteStreams([]);
  };

  // Навеска/снятие событий сигналинга
  const bindCallSocketEvents = () => {
    // peers список уже в комнате (мы инициатор офферов)
    socket.current.off("call:peers");
    socket.current.on("call:peers", async ({ peers }) => {
      // Создаём офферы КАЖДОМУ существующему участнику
      for (const peerSid of peers) {
        const pc = ensurePC(peerSid);
        // Убедимся, что локальные треки добавлены
        if (localStreamRef.current) {
          const hasVideo = pc
            .getSenders()
            .some((s) => s.track && s.track.kind === "video");
          if (!hasVideo) {
            localStreamRef.current
              .getTracks()
              .forEach((t) => pc.addTrack(t, localStreamRef.current));
          }
        }
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);
        socket.current.emit("call:offer", {
          toSocketId: peerSid,
          sdp: offer,
          roomId: CALL_ROOM_ID,
        });
      }
    });

    // Когда кто-то вошёл — он сам пришлёт оффер нам; мы просто покажем подсказку/счётчик
    socket.current.off("call:peer-joined");
    socket.current.on("call:peer-joined", ({ socketId }) => {
      // счётчик обновится, когда придёт ontrack
      // можно показывать тост/чип — здесь делаем это через setParticipantsCount лениво
    });

    socket.current.off("call:peer-left");
    socket.current.on("call:peer-left", ({ socketId }) => {
      // закрываем PC и удаляем поток
      const pc = pcsRef.current.get(socketId);
      if (pc) {
        try {
          pc.getSenders().forEach((s) => s.track && s.track.stop());
          pc.close();
        } catch {}
        pcsRef.current.delete(socketId);
      }
      removeRemoteStream(socketId);
    });

    // Получили оффер — создаём PC если нужно, сетим remote, отвечаем answer
    socket.current.off("call:offer");
    socket.current.on("call:offer", async ({ fromSocketId, sdp }) => {
      const pc = ensurePC(fromSocketId);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));

      // добавим локальные треки если вдруг не добавлены
      if (localStreamRef.current) {
        const hasVideo = pc
          .getSenders()
          .some((s) => s.track && s.track.kind === "video");
        if (!hasVideo) {
          localStreamRef.current
            .getTracks()
            .forEach((t) => pc.addTrack(t, localStreamRef.current));
        }
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.current.emit("call:answer", {
        toSocketId: fromSocketId,
        sdp: answer,
        roomId: CALL_ROOM_ID,
      });
    });

    // Получили answer — ставим как remote
    socket.current.off("call:answer");
    socket.current.on("call:answer", async ({ fromSocketId, sdp }) => {
      const pc = ensurePC(fromSocketId);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    // Пришёл ICE-кандидат
    socket.current.off("call:ice");
    socket.current.on("call:ice", async ({ fromSocketId, candidate }) => {
      const pc = ensurePC(fromSocketId);
      try {
        await pc.addIceCandidate(candidate);
      } catch (e) {
        console.error("ICE add failed", e);
      }
    });

    // Hangup (опционально)
    socket.current.off("call:hangup");
    socket.current.on("call:hangup", ({ fromSocketId }) => {
      const pc = pcsRef.current.get(fromSocketId);
      if (pc) {
        try {
          pc.getSenders().forEach((s) => s.track && s.track.stop());
          pc.close();
        } catch {}
        pcsRef.current.delete(fromSocketId);
      }
      removeRemoteStream(fromSocketId);
    });
  };

  // Переключатели
  const toggleMic = () => {
    const s = localStreamRef.current;
    if (!s) return;
    s.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMicEnabled((m) => !m);
  };

  const toggleCam = () => {
    const s = localStreamRef.current;
    if (!s) return;
    s.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCamEnabled((v) => !v);
  };

  const shareScreen = async () => {
    if (screenOn) return stopShareScreen();
    const display = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });
    const videoTrack = display.getVideoTracks()[0];
    screenStreamRef.current = display;

    // Заменяем исходящий видео-трек во всех PC
    pcsRef.current.forEach((pc) => {
      const sender = pc
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");
      if (sender && videoTrack) sender.replaceTrack(videoTrack);
    });

    // Локально меняем превью
    if (localVideoRef.current) localVideoRef.current.srcObject = display;
    setScreenOn(true);

    // Когда юзер остановил шэринг — вернём камеру
    videoTrack.onended = () => stopShareScreen();
  };

  const stopShareScreen = async () => {
    if (!screenStreamRef.current) return;
    try {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
    } catch {}
    screenStreamRef.current = null;

    // Вернём камеру
    const camTrack = localStreamRef.current?.getVideoTracks()[0];
    pcsRef.current.forEach((pc) => {
      const sender = pc
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");
      if (sender && camTrack) sender.replaceTrack(camTrack);
    });
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    setScreenOn(false);
  };

  // При закрытии модалки — чистим звонок, если был
  useEffect(() => {
    if (!callOpen && inCall) {
      leaveCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callOpen]);

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

              <div
                className="chat-header__online"
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <span className="dot" />
                <span className="count">{online}</span>
                <span className="label">онлайн</span>

                {/* NEW(WebRTC): кнопка видеозвонка и счётчик участников звонка */}
                <Tooltip title="Видеозвонок (общая комната)">
                  <IconButton
                    onClick={() => setCallOpen(true)}
                    size="small"
                    sx={{ ml: 1, bgcolor: "rgba(59,130,246,.12)" }}
                  >
                    <VideoCallRoundedIcon />
                  </IconButton>
                </Tooltip>
                {inCall && (
                  <Chip
                    icon={<PeopleAltRoundedIcon />}
                    label={`${participantsCount}`}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
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

      {/* NEW(WebRTC): модалка звонка */}
      {callOpen && (
        <div
          className="call-modal"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.65)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 12,
          }}
          onClick={(e) => {
            // закрывать по клику вне карточки
            if (e.target === e.currentTarget) setCallOpen(false);
          }}
        >
          <div
            className="call-card"
            style={{
              width: "min(1000px, 95vw)",
              height: "min(700px, 90vh)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,.98), rgba(247,247,249,.98))",
              borderRadius: 16,
              overflow: "hidden",
              display: "grid",
              gridTemplateRows: "1fr auto",
              boxShadow: "0 24px 64px rgba(0,0,0,.35)",
            }}
          >
            {/* Видеосетка */}
            <div
              style={{
                padding: 12,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
                alignContent: "start",
              }}
            >
              {/* Локальное превью */}
              <div
                style={{
                  position: "relative",
                  background: "#000",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    height: 240,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: 8,
                    display: "flex",
                    gap: 6,
                  }}
                >
                  <Chip size="small" label="Вы" />
                  {!camEnabled && (
                    <Chip size="small" color="warning" label="Камера выкл." />
                  )}
                  {!micEnabled && (
                    <Chip size="small" color="warning" label="Микрофон выкл." />
                  )}
                </div>
              </div>

              {/* Удалённые участники */}
              {remoteStreams.map(({ peerId, stream }) => (
                <RemoteVideo key={peerId} peerId={peerId} stream={stream} />
              ))}
            </div>

            {/* Панель управления */}
            <div
              style={{
                borderTop: "1px solid rgba(17,24,39,.08)",
                background: "rgba(255,255,255,.9)",
                padding: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <PeopleAltRoundedIcon />
                <b>{participantsCount}</b>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {!inCall ? (
                  <Button
                    variant="contained"
                    startIcon={<VideoCallRoundedIcon />}
                    onClick={joinCall}
                  >
                    Присоединиться
                  </Button>
                ) : (
                  <>
                    <Tooltip
                      title={
                        micEnabled ? "Выключить микрофон" : "Включить микрофон"
                      }
                    >
                      <IconButton
                        onClick={toggleMic}
                        color={micEnabled ? "primary" : "warning"}
                      >
                        {micEnabled ? (
                          <MicRoundedIcon />
                        ) : (
                          <MicOffRoundedIcon />
                        )}
                      </IconButton>
                    </Tooltip>

                    <Tooltip
                      title={
                        camEnabled ? "Выключить камеру" : "Включить камеру"
                      }
                    >
                      <IconButton
                        onClick={toggleCam}
                        color={camEnabled ? "primary" : "warning"}
                      >
                        {camEnabled ? (
                          <VideocamRoundedIcon />
                        ) : (
                          <VideocamOffRoundedIcon />
                        )}
                      </IconButton>
                    </Tooltip>

                    <Tooltip
                      title={
                        screenOn
                          ? "Остановить показ экрана"
                          : "Поделиться экраном"
                      }
                    >
                      <IconButton
                        onClick={screenOn ? stopShareScreen : shareScreen}
                        color={screenOn ? "warning" : "primary"}
                      >
                        {screenOn ? (
                          <StopScreenShareRoundedIcon />
                        ) : (
                          <ScreenShareRoundedIcon />
                        )}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Выйти из звонка">
                      <IconButton onClick={leaveCall} color="error">
                        <CallEndRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </div>

              <div>
                <Button variant="text" onClick={() => setCallOpen(false)}>
                  Закрыть
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
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

// NEW(WebRTC): компонент удалённого видео (простая обёртка)
function RemoteVideo({ peerId, stream }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return (
    <div
      style={{
        position: "relative",
        background: "#000",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <video
        ref={ref}
        autoPlay
        playsInline
        style={{
          width: "100%",
          height: 240,
          objectFit: "cover",
          display: "block",
        }}
      />
      <div style={{ position: "absolute", bottom: 8, left: 8 }}>
        <Chip size="small" label={peerId.slice(0, 6)} />
      </div>
    </div>
  );
}

export default Chat;
