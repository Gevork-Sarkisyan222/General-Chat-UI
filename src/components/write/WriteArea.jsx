import React, { useState, useRef, useEffect } from "react";
import "./write.scss";

import AddReactionIcon from "@mui/icons-material/AddReaction";
import ClipIcon from "@mui/icons-material/AttachFile";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import axios from "../../axios";
import app from "../../firebase";

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";

import { useSelector } from "react-redux";
import useMediaQuery from "@mui/material/useMediaQuery";
import EmojiPicker from "emoji-picker-react";

// Joy UI
import {
  Sheet,
  Input,
  IconButton,
  Button,
  Tooltip,
  LinearProgress,
  Chip,
} from "@mui/joy";

// MUI Material — для устойчивого поппера и клик-вне
import Popper from "@mui/material/Popper";
import Paper from "@mui/material/Paper";
import ClickAwayListener from "@mui/material/ClickAwayListener";

function WriteArea({
  createMessage,
  setMessage,
  message,
  socket,
  setMessages,
  edit,
}) {
  const { currentUser } = useSelector((state) => state.user);

  // ---- Emoji (через MUI Popper)
  const [emojiAnchor, setEmojiAnchor] = useState(null);
  const emojiBtnRef = useRef(null);
  const popperRef = useRef(null);
  const emojiOpen = Boolean(emojiAnchor);
  const handleEmojiOpen = (e) => setEmojiAnchor(e.currentTarget);
  const handleEmojiClose = () => setEmojiAnchor(null);

  // ---- Files
  const inputFileRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [fileLabel, setFileLabel] = useState(""); // красивое имя файла
  const [localPreview, setLocalPreview] = useState(""); // objectURL до загрузки
  const [uploadPct, setUploadPct] = useState(0);
  const [uploading, setUploading] = useState(false);

  // ---- Preview modal
  const [previewOpen, setPreviewOpen] = useState(false);

  // ---- Incoming image message (socket)
  const [arrivalImageMessage, setArrivalImageMessage] = useState(null);

  const disabledSend = (!message || message.trim().length === 0) && !imageUrl;

  // ---- Emoji click (не закрываем поппер)
  const onEmojiClick = (emojiData) => {
    setMessage((message || "") + (emojiData?.emoji || ""));
  };

  // Локальный objectURL для мини-превью до завершения загрузки
  useEffect(() => {
    if (!imageFile) {
      setLocalPreview("");
      setFileLabel("");
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setLocalPreview(url);
    setFileLabel(imageFile.name || "image");
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  // ---- Upload to Firebase
  const startUpload = (file) => {
    const storage = getStorage(app);
    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, fileName);
    const task = uploadBytesResumable(storageRef, file);

    setUploading(true);
    setUploadPct(0);

    task.on(
      "state_changed",
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        setUploadPct(pct);
      },
      (err) => {
        console.warn("Upload error:", err);
        setUploading(false);
        setUploadPct(0);
      },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          setImageUrl(url);
        } finally {
          setUploading(false);
        }
      }
    );
  };

  useEffect(() => {
    if (imageFile) startUpload(imageFile);
  }, [imageFile]);

  // ---- Send image (backend + socket)
  const [sendingImage, setSendingImage] = useState(false);

  const handleUploadSend = async () => {
    // нельзя, если файл ещё грузится в Firebase или уже идёт запрос на бэкенд
    if (uploading || sendingImage) return;

    // проверяем, что ссылка валидная (а не blob:)
    if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) {
      console.warn(
        "Нет валидного URL изображения — дождись завершения загрузки в Firebase."
      );
      return;
    }

    try {
      setSendingImage(true);
      handleEmojiClose();

      // если бэкенд ждёт JSON — этого достаточно
      const payload = {
        image: imageUrl,
        text: message && message.trim() ? message.trim() : undefined,
      };

      const res = await axios.post("/chat/message", payload, {
        headers: { "Content-Type": "application/json" },
      });

      const createdId = res?.data?._id;

      // оптимистично добавим сообщение в список (если у тебя это делает сокет — можно убрать)
      // setMessages((prev) => [
      //   ...prev,
      //   {
      //     _id: createdId || `tmp-${Date.now()}`,
      //     image: imageUrl,
      //     user: {
      //       _id: currentUser?._id,
      //       name: currentUser?.name,
      //       role: currentUser?.role,
      //       avatarUrl: currentUser?.avatarUrl,
      //     },
      //     createdAt: Date.now(),
      //   },
      // ]);

      // уведомляем по сокету (если сервер это использует)
      if (socket?.current) {
        socket.current.emit("uploadImage", {
          selectedImage: imageUrl,
          messageId: createdId,
          user: {
            _id: currentUser?._id,
            name: currentUser?.name,
            role: currentUser?.role,
            avatarUrl: currentUser?.avatarUrl,
          },
        });
      }

      // очистка полей после удачной отправки
      setMessage?.("");
      setImageUrl("");
      setImageFile(null);
      setFileLabel("");
      setUploadPct(0);
      setLocalPreview("");
      setPreviewOpen(false);
    } catch (e) {
      // полезные логи, чтобы понять что именно не так
      console.error(
        "Ошибка при отправке файла:",
        e?.response?.data || e.message || e
      );
    } finally {
      setSendingImage(false);
    }
  };
  // ---- Socket listener
  useEffect(() => {
    if (!socket?.current) return;
    const handler = ({ selectedImage, messageId, user }) => {
      setArrivalImageMessage({
        image: selectedImage,
        _id: messageId,
        user,
        createdAt: Date.now(),
      });
    };
    socket.current.on("uploadedImage", handler);
    return () => socket.current?.off("uploadedImage", handler);
  }, [socket]);

  // ---- Append new image message
  useEffect(() => {
    if (arrivalImageMessage) {
      setMessages((prev) => [...prev, arrivalImageMessage]);
    }
  }, [arrivalImageMessage, setMessages]);

  // ---- Keyboard: Enter to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEmojiClose();
      if (imageUrl) handleUploadSend();
      if (message && message.trim()) createMessage();
    }
  };

  const clearImage = () => {
    setImageUrl("");
    setImageFile(null);
    setFileLabel("");
    setUploadPct(0);
    setLocalPreview("");
  };

  const isSmall = useMediaQuery("(max-width:600px)");
  const previewSrc = imageUrl || localPreview;

  return (
    <>
      <div className="WriteArea">
        {/* file input (верхний) */}
        <input
          accept="image/*"
          type="file"
          ref={inputFileRef}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setImageFile(f);
              setFileLabel(f.name || "image");
              handleEmojiClose(); // закрыть эмодзи при выборе файла
            }
          }}
          hidden
        />

        {/* Мини-превью выбранного изображения + прогресс + красивый ярлык */}
        {(previewSrc || uploading) && (
          <Sheet
            variant="soft"
            sx={{
              maxWidth: 60,
              backgroundColor: "transparent",
            }}
          >
            <div
              style={{
                position: "relative",
                width: 60,
                height: 60,
                borderRadius: 14,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(0,0,0,.06)",
                background: "rgba(0,0,0,.03)",
                cursor: previewSrc ? "pointer" : "default",
              }}
              onClick={() => previewSrc && setPreviewOpen(true)}
              title={previewSrc ? "Открыть предпросмотр" : ""}
            >
              {previewSrc ? (
                <img
                  src={previewSrc}
                  alt="preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <span style={{ fontSize: 12, opacity: 0.6 }}>Нет превью</span>
              )}

              {/* Иконка X поверх картинки gocadz */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    width: "14px",
                    height: "2px",
                    backgroundColor: "white",
                    transform: "rotate(45deg)",
                    borderRadius: "2px",
                    boxShadow: "0 0 4px rgba(0,0,0,0.4)",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    width: "14px",
                    height: "2px",
                    backgroundColor: "white",
                    transform: "rotate(-45deg)",
                    borderRadius: "2px",
                    boxShadow: "0 0 4px rgba(0,0,0,0.4)",
                  }}
                />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 160 }}>
              {uploading ? (
                <LinearProgress determinate value={uploadPct} />
              ) : imageUrl ? (
                <></>
              ) : null}
            </div>
          </Sheet>
        )}

        {/* Поле ввода */}
        <Input
          placeholder="Напишите сообщение…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleEmojiClose}
          variant="soft"
          size="lg"
          sx={{
            "--Input-radius": "16px",
            "--Input-gap": "10px",
            "--Input-decoratorChildHeight": "40px",
            marginBottom: "12px",
            bgcolor: "var(--block-bg-color, #fff)",
            width: "100%",
            paddingRight: "30px",
            color: "var(--text-color, #0f172a)",
            border: "1px solid",
            borderColor: "neutral.outlinedBorder",
            boxShadow: "0 4px 14px rgba(0,0,0,.05)",
            transition:
              "box-shadow .18s ease, border-color .18s ease, background-color .18s ease",
            "&:hover": {
              borderColor: "neutral.outlinedHoverBorder",
              boxShadow: "0 6px 18px rgba(0,0,0,.08)",
              backgroundColor:
                "color-mix(in oklab, var(--block-bg-color, #fff) 92%, #000 8%)",
            },
            "&::before": { display: "none" },
            "&:focus-within": {
              borderColor: "primary.softActiveBg",
              boxShadow:
                "0 8px 22px rgba(0,0,0,.10), 0 0 0 3px color-mix(in oklab, var(--tag-theme-bg, #c7d2fe) 55%, #fff 45%)",
              backgroundColor:
                "color-mix(in oklab, var(--block-bg-color, #fff) 96%, #000 4%)",
            },
            alignItems: "center",
            minHeight: 56,
            "& input::placeholder": {
              color: "var(--inactive-color, #9aa4b2)",
              opacity: 1,
            },
            "& input": {
              caretColor: "currentColor",
              fontSize: 16,
              lineHeight: 1.3,
            },
            "& .MuiIconButton-root": {
              transition: "transform .15s ease, background-color .15s ease",
            },
            "& .MuiIconButton-root:hover": {
              transform: "translateY(-1px)",
            },
          }}
          startDecorator={
            <>
              <Tooltip title="Эмодзи">
                <IconButton
                  ref={emojiBtnRef}
                  variant="soft"
                  onClick={handleEmojiOpen}
                  sx={{ borderRadius: "12px", mr: "24px", ml: "0px" }}
                >
                  <AddReactionIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Прикрепить файл">
                <IconButton
                  variant="soft"
                  onClick={() => {
                    handleEmojiClose();
                    inputFileRef.current?.click();
                  }}
                  sx={{ borderRadius: "12px" }}
                >
                  <AttachFileIcon />
                </IconButton>
              </Tooltip>

              {/* второй файл-инпут (как у тебя) */}
              <input
                accept="image/*"
                type="file"
                ref={inputFileRef}
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setImageFile(f);
                    setFileLabel(f.name || "image");
                    handleEmojiClose();
                  }
                }}
              />
            </>
          }
          endDecorator={
            <Button
              variant="solid"
              color="primary"
              disabled={disabledSend}
              onClick={() => {
                handleEmojiClose();
                if (imageUrl) handleUploadSend();
                if (message && message.trim()) createMessage();
              }}
              sx={{
                borderRadius: "12px",
                px: 1.5,
                boxShadow: "0 6px 16px rgba(59,130,246,.25)",
                transition: "transform .12s ease, box-shadow .18s ease",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 10px 24px rgba(59,130,246,.30)",
                },
                "&:active": { transform: "translateY(0)" },
              }}
            >
              <SendIcon />
            </Button>
          }
        />

        {/* EMOJI POPPER (закрывается по клику вне, не закрывается при выборе) */}
        <Popper
          open={emojiOpen}
          anchorEl={emojiAnchor}
          placement="top-start"
          style={{ zIndex: 1300 }}
          modifiers={[
            { name: "offset", options: { offset: [0, 8] } },
            { name: "preventOverflow", options: { padding: 8 } },
          ]}
        >
          <ClickAwayListener onClickAway={handleEmojiClose}>
            <Paper
              ref={popperRef}
              elevation={8}
              sx={{
                borderRadius: "14px",
                overflow: "hidden",
                p: 0,
              }}
            >
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  onEmojiClick(emojiData);
                  // если хочешь закрывать сразу после выбора — раскомментируй:
                  // handleEmojiClose();
                }}
                searchDisabled
                skinTonesDisabled
                lazyLoadEmojis
              />
            </Paper>
          </ClickAwayListener>
        </Popper>
      </div>

      {/* FULLSCREEN PREVIEW */}
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        aria-labelledby="image-preview-title"
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Sheet
          variant="outlined"
          sx={{
            bgcolor: "var(--block-bg-color, #fff)",
            color: "var(--text-color, #0f172a)",
            borderRadius: "16px",
            p: 2,
            maxWidth: isSmall ? "95vw" : "80vw",
            maxHeight: "85vh",
            boxShadow: "lg",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            marginInline: "12px",
          }}
        >
          <ModalClose />
          <Typography id="image-preview-title" level="title-lg" sx={{ mb: 1 }}>
            Предпросмотр изображения
          </Typography>
          {previewSrc ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                maxHeight: "74vh",
                borderRadius: 12,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,.02)",
              }}
            >
              <img
                src={previewSrc}
                alt="full"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          ) : (
            <Typography level="body-md" sx={{ opacity: 0.7 }}>
              Нет изображения для предпросмотра
            </Typography>
          )}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            {imageUrl && (
              <Button
                variant="solid"
                color="primary"
                onClick={handleUploadSend}
              >
                Отправить изображение
              </Button>
            )}
            <Button variant="outlined" onClick={() => setPreviewOpen(false)}>
              Закрыть
            </Button>
          </div>
        </Sheet>
      </Modal>
    </>
  );
}

export default WriteArea;
