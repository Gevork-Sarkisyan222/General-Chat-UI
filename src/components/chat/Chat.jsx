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

// NEW(WebRTC + simple-peer)
import Peer from "simple-peer";
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
  useEffect(() => {
    if (!isAuthenticated) return;
    const messagesContainer = scrollRef.current;
    if (!messagesContainer) return;
    const newScrollTop =
      messagesContainer.scrollHeight - messagesContainer.clientHeight;
    messagesContainer.scrollTo({ top: newScrollTop, behavior: "smooth" });
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
      setMessages((prevMessages) =>
        prevMessages.map((m) =>
          m._id === messageId ? { ...m, message: editedMessage } : m
        )
      );
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
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
    if (openMessage) setGroupModal(true);
  };
  const handleCloseGroupModal = () => setGroupModal(false);

  const saveInfoLSgroup = () => {
    setGroupModal(false);
    localStorage.setItem("group", groupName);
  };

  const checkIfOnline = (userId) => isOnlineUser.includes(userId);

  // Дополнительный безопасный автоскролл через rAF
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
  // NEW(WebRTC + simple-peer): состояние/рефы видеозвонка
  // =========================================================

  // ICE конфиг (добавь свой TURN для продакшена)
  const RTC_CONFIGURATION = useMemo(
    () => ({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // { urls: "turn:YOUR_TURN_HOST:3478", username: "user", credential: "pass" },
      ],
    }),
    []
  );

  // Общий roomId звонка
  const CALL_ROOM_ID = "general";

  const [callOpen, setCallOpen] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(1);

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  // simple-peer инстансы по socketId
  const peersRef = useRef(new Map()); // Map<peerSid, Peer>
  const [remoteStreams, setRemoteStreams] = useState([]); // [{peerId, stream}]
  const remoteStreamsRef = useRef(new Map()); // Map<peerSid, MediaStream>

  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [screenOn, setScreenOn] = useState(false);

  const refreshRemoteStreamsState = () => {
    setRemoteStreams(
      Array.from(remoteStreamsRef.current.entries()).map(([id, st]) => ({
        peerId: id,
        stream: st,
      }))
    );
    setParticipantsCount(1 + remoteStreamsRef.current.size);
  };

  const upsertRemoteStream = (peerId, stream) => {
    remoteStreamsRef.current.set(peerId, stream);
    refreshRemoteStreamsState();
  };
  const removeRemoteStream = (peerId) => {
    remoteStreamsRef.current.delete(peerId);
    refreshRemoteStreamsState();
  };

  // Создание simple-peer для конкретного пира
  const createPeer = (peerSid, initiator) => {
    if (peersRef.current.has(peerSid)) return peersRef.current.get(peerSid);

    const p = new Peer({
      initiator,
      trickle: true, // будем пересылать 'ice' по мере появления
      stream: localStreamRef.current || undefined,
      config: RTC_CONFIGURATION,
    });

    // simple-peer -> сигнал наружу (маппим на твои call:* события)
    p.on("signal", (data) => {
      if (data?.type === "offer") {
        socket.current.emit("call:offer", {
          toSocketId: peerSid,
          sdp: data,
          roomId: CALL_ROOM_ID,
        });
      } else if (data?.type === "answer") {
        socket.current.emit("call:answer", {
          toSocketId: peerSid,
          sdp: data,
          roomId: CALL_ROOM_ID,
        });
      } else if (data?.candidate) {
        socket.current.emit("call:ice", {
          toSocketId: peerSid,
          candidate: data,
          roomId: CALL_ROOM_ID,
        });
      }
    });

    // Получили удалённый стрим (когда remote добавил свою медию)
    p.on("stream", (stream) => {
      upsertRemoteStream(peerSid, stream);
    });

    p.on("connect", () => {
      // data-channel готов (можно чат/сигналы поверх p.send)
      // console.log("P2P connected with", peerSid);
    });

    p.on("close", () => {
      p.removeAllListeners();
      peersRef.current.delete(peerSid);
      removeRemoteStream(peerSid);
    });

    p.on("error", (err) => {
      console.warn("peer error", peerSid, err?.message || err);
    });

    peersRef.current.set(peerSid, p);
    return p;
  };

  // Войти в звонок
  const joinCall = async () => {
    if (!socket.current) return;

    // 1) Получаем локальные медиа
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    stream.getAudioTracks().forEach((t) => (t.enabled = true));
    stream.getVideoTracks().forEach((t) => (t.enabled = true));
    setMicEnabled(true);
    setCamEnabled(true);

    // 2) Подписываемся на сигнальные события
    bindCallSocketEvents();

    // 3) Входим в комнату
    socket.current.emit("call:join", {
      roomId: CALL_ROOM_ID,
      meta: { name: currentUser?.name, avatarUrl: currentUser?.avatarUrl },
    });

    setInCall(true);
    setParticipantsCount(1);
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

  const destroyPeer = (peerSid) => {
    const p = peersRef.current.get(peerSid);
    if (p) {
      try {
        p.destroy();
      } catch {}
      peersRef.current.delete(peerSid);
    }
    removeRemoteStream(peerSid);
  };

  // Полная очистка
  const cleanupCall = () => {
    peersRef.current.forEach((p) => {
      try {
        p.destroy();
      } catch {}
    });
    peersRef.current.clear();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;

    if (screenStreamRef.current) {
      try {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch {}
      screenStreamRef.current = null;
      setScreenOn(false);
    }

    remoteStreamsRef.current.clear();
    setRemoteStreams([]);
  };

  // Навеска/снятие событий сигналинга (через твой Socket.IO)
  const bindCallSocketEvents = () => {
    // существующие участники — мы инициаторы
    socket.current.off("call:peers");
    socket.current.on("call:peers", async ({ peers }) => {
      for (const peerSid of peers) {
        const p = createPeer(peerSid, true);
        // инициатор сам сгенерирует offer и отправит через p.on('signal')
      }
    });

    socket.current.off("call:peer-joined");
    socket.current.on("call:peer-joined", ({ socketId }) => {
      // Новый участник сам пришлёт offer -> обработаем в 'call:offer'
      // Счётчик обновится при появлении его стрима
    });

    socket.current.off("call:peer-left");
    socket.current.on("call:peer-left", ({ socketId }) => {
      destroyPeer(socketId);
    });

    // === Маппинг сигналов на simple-peer.signal ===
    socket.current.off("call:offer");
    socket.current.on("call:offer", async ({ fromSocketId, sdp }) => {
      const p = createPeer(fromSocketId, false); // не инициатор
      try {
        p.signal(sdp); // передаём offer в simple-peer
      } catch (e) {
        console.error("signal offer failed", e);
      }
    });

    socket.current.off("call:answer");
    socket.current.on("call:answer", async ({ fromSocketId, sdp }) => {
      const p = peersRef.current.get(fromSocketId);
      if (!p) return;
      try {
        p.signal(sdp); // answer
      } catch (e) {
        console.error("signal answer failed", e);
      }
    });

    socket.current.off("call:ice");
    socket.current.on("call:ice", async ({ fromSocketId, candidate }) => {
      const p = peersRef.current.get(fromSocketId);
      if (!p) return;
      try {
        p.signal(candidate); // trickle ICE
      } catch (e) {
        console.error("signal ice failed", e);
      }
    });

    socket.current.off("call:hangup");
    socket.current.on("call:hangup", ({ fromSocketId }) => {
      destroyPeer(fromSocketId);
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

  // Шаринг экрана через замену видео-трека во всех peer-соединениях
  const shareScreen = async () => {
    if (screenOn) return stopShareScreen();
    const display = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });
    const screenTrack = display.getVideoTracks()[0];
    screenStreamRef.current = display;

    // Поменяем исходящий видео-трек у всех пиров
    peersRef.current.forEach((p) => {
      const sender =
        p?._pc
          ?.getSenders?.()
          .find((s) => s.track && s.track.kind === "video") || null;
      if (sender && screenTrack) sender.replaceTrack(screenTrack);
    });

    // Локально отображаем экран
    if (localVideoRef.current) localVideoRef.current.srcObject = display;
    setScreenOn(true);

    screenTrack.onended = () => stopShareScreen();
  };

  const stopShareScreen = async () => {
    if (!screenStreamRef.current) return;
    try {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
    } catch {}
    screenStreamRef.current = null;

    // Вернуть камеру как исходящий трек
    const camTrack = localStreamRef.current?.getVideoTracks()[0] || null;
    peersRef.current.forEach((p) => {
      const sender =
        p?._pc
          ?.getSenders?.()
          .find((s) => s.track && s.track.kind === "video") || null;
      if (sender && camTrack) sender.replaceTrack(camTrack);
    });

    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    setScreenOn(false);
  };

  // Если закрываем модалку — выходим из звонка
  useEffect(() => {
    if (!callOpen && inCall) leaveCall();
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
          <Box sx={{ ...style, width: 295, display: "flex" }}>
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

                {/* NEW(WebRTC + simple-peer): кнопка видеозвонка и счётчик */}
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

      {/* NEW(WebRTC + simple-peer): модалка звонка */}
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

// NEW(WebRTC + simple-peer): компонент удалённого видео
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
