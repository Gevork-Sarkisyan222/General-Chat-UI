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

  // new States down

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

  // сколько участников в сетке
  const participants = 1 + remoteStreams.length;
  // кол-во колонок (best practice)
  const cols =
    participants >= 10 ? 4 : participants >= 5 ? 3 : participants >= 2 ? 2 : 1;
  // соло-режим
  const solo = participants === 1;

  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [screenOn, setScreenOn] = useState(false);

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

  // Если сокет переподключился — переизлучаем addUser и, если мы были в звонке, заново join
  useEffect(() => {
    if (!socket.current) return;

    const onConnect = () => {
      if (isAuthenticated) {
        socket.current.emit("addUser", currentUser?._id);
      }
      if (inCall) {
        bindCallSocketEvents();
        socket.current.emit("call:join", {
          roomId: CALL_ROOM_ID,
          meta: { name: currentUser?.name, avatarUrl: currentUser?.avatarUrl },
        });
      }
    };

    socket.current.on("connect", onConnect);
    return () => socket.current?.off("connect", onConnect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inCall, isAuthenticated, currentUser?._id]);

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
  // заменяем RTC_CONFIGURATION
  const RTC_CONFIGURATION = useMemo(
    () => ({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // прод: свой TURN
        // {
        //   urls: ["turn:YOUR_TURN_HOST:3478"], // или turns:... для TLS
        //   username: "turnUser",
        //   credential: "turnPass",
        // },
      ],
      // опционально:
      // iceTransportPolicy: "all",
    }),
    []
  );

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

    p.on("track", (track, stream) => {
      if (stream) upsertRemoteStream(peerSid, stream);
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
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      // иногда браузер не автоплеит — форсим
      localVideoRef.current.play?.().catch((err) => {
        console.log("error in webRtc", err);
      });
    }

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
    // список пиров в комнате — НОВЫЙ (вошедший) делает offer каждому
    socket.current.off("call:peers");
    socket.current.on("call:peers", async ({ peers }) => {
      for (const peerSid of peers) {
        const p = createPeer(peerSid, true); // инициатор

        const watchdog = setTimeout(() => {
          if (!remoteStreamsRef.current.has(peerSid)) {
            try {
              p.destroy();
            } catch {}
            peersRef.current.delete(peerSid);
          }
        }, 12000);
        p.on("stream", () => clearTimeout(watchdog));
        p.on("close", () => clearTimeout(watchdog));
        p.on("error", () => clearTimeout(watchdog));
      }
    });

    socket.current.off("call:peer-joined");
    socket.current.on("call:peer-joined", ({ socketId }) => {
      // инфо, если надо показать UI, offer придёт как 'call:offer'
    });

    socket.current.off("call:peer-left");
    socket.current.on("call:peer-left", ({ socketId }) => {
      destroyPeer(socketId);
    });

    // === Маппинг сигналов на simple-peer.signal ===
    // Получили OFFER -> мы не инициатор
    socket.current.off("call:offer");
    socket.current.on("call:offer", async ({ fromSocketId, sdp }) => {
      const p = createPeer(fromSocketId, false); // не инициатор

      const watchdog = setTimeout(() => {
        if (!remoteStreamsRef.current.has(fromSocketId)) {
          try {
            p.destroy();
          } catch {}
          peersRef.current.delete(fromSocketId);
        }
      }, 12000);
      p.on("stream", () => clearTimeout(watchdog));
      p.on("close", () => clearTimeout(watchdog));
      p.on("error", () => clearTimeout(watchdog));

      try {
        p.signal(sdp); // прокидываем OFFER в simple-peer
      } catch (e) {
        console.error("signal offer failed", e);
      }
    });

    // ⬇️ ЭТО ВАЖНО: инициатор должен принять ANSWER
    socket.current.off("call:answer");
    socket.current.on("call:answer", async ({ fromSocketId, sdp }) => {
      const p = peersRef.current.get(fromSocketId);
      if (!p) return;
      try {
        p.signal(sdp); // прокидываем ANSWER в simple-peer
      } catch (e) {
        console.error("signal answer failed", e);
      }
    });

    // Trickle ICE в обе стороны
    socket.current.off("call:ice");
    socket.current.on("call:ice", async ({ fromSocketId, candidate }) => {
      const p = peersRef.current.get(fromSocketId);
      if (!p) return;
      try {
        p.signal(candidate);
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
      {/* FULLSCREEN CALL SURFACE (вместо модалки) */}
      {callOpen && (
        <div className="call-surface">
          {/* Верхняя полоска */}
          <div className="call-topbar">
            <div className="call-topbar__left">
              <strong>Звонок</strong>
              <Chip
                size="small"
                sx={{ ml: 1 }}
                label={`${participantsCount} участник(а)`}
              />
            </div>
            <div className="call-topbar__right">
              <Button variant="text" onClick={() => setCallOpen(false)}>
                Закрыть
              </Button>
            </div>
          </div>

          {/* Центр: видеосетка */}
          <div className="call-main">
            <CallGrid
              localVideoRef={localVideoRef}
              localStream={localStreamRef.current} // <<< добавь это
              camEnabled={camEnabled}
              micEnabled={micEnabled}
              remoteStreams={remoteStreams}
            />
          </div>

          {/* Плавающая панель управления — как в Zoom/Teams */}
          <div className="call-toolbar">
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
                    {micEnabled ? <MicRoundedIcon /> : <MicOffRoundedIcon />}
                  </IconButton>
                </Tooltip>

                <Tooltip
                  title={camEnabled ? "Выключить камеру" : "Включить камеру"}
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
                    screenOn ? "Остановить показ экрана" : "Поделиться экраном"
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

// --- CallGrid.jsx (или прямо в вашем файле) ---
// --- CallGrid (универсальная авто-сетка для mobile/desktop) ---
function CallGrid({ localVideoRef, localStream, remoteStreams }) {
  const containerRef = React.useRef(null);
  const total = 1 + remoteStreams.length;

  // аудио-метры (подсветка говорящего)
  const [levels, setLevels] = React.useState({ self: 0 });
  const acRef = React.useRef(null);
  const metersRef = React.useRef(new Map());
  const rafRef = React.useRef(null);

  // раскладка
  const [layout, setLayout] = React.useState({
    cols: 1,
    rows: 1,
    w: 320,
    h: 180,
  });
  const ASPECT = 16 / 9;

  const tiles = React.useMemo(() => {
    const list = [{ id: "self", kind: "self", stream: localStream }];
    for (const r of remoteStreams)
      list.push({ id: r.peerId, kind: "remote", stream: r.stream });
    return list;
  }, [localStream, remoteStreams]);

  // макс. колонок по ширине вьюпорта (чтобы на мобиле не терять gap)
  // было:
  const maxColsForWidth = React.useCallback((W) => {
    if (W <= 340) return 1; // очень узкие экраны
    if (W <= 520) return 2; // типичный телефон — 2 колонки для 3+ участников
    if (W <= 900) return 3;
    return 4;
  }, []);

  // подбор наилучших размеров плитки так, чтобы ВСЁ влезало без скролла
  const computeBest = React.useCallback(
    (n, W, H) => {
      // ⬇️ если на телефоне 1–2 участника — форсим одну колонку (красиво стеком)
      const preferOneColOnPhone = n <= 2 && W <= 520;

      // gap на телефоне чуть больше заметен
      const GAP = W <= 520 ? 10 : 12;

      let best = { cols: 1, rows: 1, w: W, h: H },
        bestArea = 0;
      const maxCols = preferOneColOnPhone ? 1 : Math.min(n, maxColsForWidth(W));

      for (let cols = 1; cols <= maxCols; cols++) {
        const rows = Math.ceil(n / cols);

        let w = Math.floor((W - GAP * (cols - 1)) / cols);
        let h = Math.floor(w / (16 / 9));

        // поджать по высоте, если не влезает
        const totalH = rows * h + GAP * (rows - 1);
        if (totalH > H) {
          h = Math.floor((H - GAP * (rows - 1)) / rows);
          w = Math.floor(h * (16 / 9));
        }

        // страховка от переполнения
        const fitW = cols * w + GAP * (cols - 1);
        const fitH = rows * h + GAP * (rows - 1);
        const scale = Math.min(W / fitW, H / fitH, 1);
        w = Math.floor(w * scale);
        h = Math.floor(h * scale);

        const area = w * h;
        if (area > bestArea) {
          bestArea = area;
          best = { cols, rows, w, h };
        }
      }
      return best;
    },
    [maxColsForWidth]
  );

  const recalc = React.useCallback(() => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    setLayout(
      computeBest(total, Math.floor(r.width) - 2, Math.floor(r.height) - 2)
    );
  }, [computeBest, total]);

  React.useEffect(() => {
    recalc();
    window.addEventListener("resize", recalc);
    window.addEventListener("orientationchange", recalc);
    return () => {
      window.removeEventListener("resize", recalc);
      window.removeEventListener("orientationchange", recalc);
    };
  }, [recalc]);

  // аудио-метры (подсветка)
  const attachMeter = React.useCallback((id, stream) => {
    if (!stream) return;
    try {
      if (!acRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        acRef.current = new Ctx();
      }
      acRef.current.resume?.();
      if (metersRef.current.has(id)) return;

      const src = acRef.current.createMediaStreamSource(stream);
      const analyser = acRef.current.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      metersRef.current.set(id, { analyser, data });
    } catch {}
  }, []);

  React.useEffect(() => {
    // следим за актуальными сайтами
    const ids = new Set(tiles.map((t) => t.id));
    // добавить
    tiles.forEach((t) => attachMeter(t.id, t.stream));
    // убрать лишние
    for (const id of Array.from(metersRef.current.keys())) {
      if (!ids.has(id)) metersRef.current.delete(id);
    }

    const tick = () => {
      const next = {};
      metersRef.current.forEach(({ analyser, data }, id) => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        next[id] = Math.min(1, (levels[id] ?? 0) * 0.7 + rms * 0.3);
      });
      setLevels((prev) => ({ ...prev, ...next }));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles]);

  return (
    <div
      ref={containerRef}
      className="call-grid"
      style={{
        "--cols": layout.cols,
        "--tile-w": `${layout.w}px`,
        "--tile-h": `${layout.h}px`,
      }}
    >
      {tiles.map((t) => (
        <Tile
          key={t.id}
          id={t.id}
          kind={t.kind}
          stream={t.stream}
          videoRef={t.kind === "self" ? localVideoRef : undefined}
          self={t.kind === "self"}
          speaking={(levels[t.id] ?? 0) > 0.08}
        />
      ))}
    </div>
  );
}

// --- единая плитка
function Tile({ id, kind, stream, videoRef, speaking, self }) {
  const ref = videoRef || React.useRef(null);

  React.useEffect(() => {
    if (!ref.current || !stream) return;
    ref.current.srcObject = stream;
    ref.current.muted = kind === "self";
    ref.current.playsInline = true;
    ref.current.play?.().catch(() => {});
  }, [stream, kind, ref]);

  return (
    <div
      className={["tile", self && "tile--self", speaking && "tile--speaking"]
        .filter(Boolean)
        .join(" ")}
    >
      <video ref={ref} className="tile__video" autoPlay playsInline />
      <div className="tile__badges">
        <span className="pill">{self ? "Вы" : id.slice(0, 5)}</span>
      </div>
    </div>
  );
}

// function RemoteVideo({ peerId, stream, className = "" }) {
//   const ref = useRef(null);
//   const [needsTap, setNeedsTap] = useState(false);

//   useEffect(() => {
//     const el = ref.current;
//     if (!el) return;
//     el.srcObject = stream;
//     el.muted = false;
//     el.volume = 1;
//     el.playsInline = true;
//     el.play()
//       .then(() => setNeedsTap(false))
//       .catch(() => setNeedsTap(true));
//   }, [stream]);

//   return (
//     <div
//       className={`tile ${className}`}
//       onClick={() => ref.current?.play?.().catch(() => {})}
//     >
//       <video ref={ref} autoPlay playsInline className="tile__video" />
//       <div className="tile__badges">
//         <Chip size="small" label={peerId.slice(0, 5)} />
//         {needsTap && (
//           <Chip size="small" color="warning" label="Нажмите для звука" />
//         )}
//       </div>
//     </div>
//   );
// }

export default Chat;
