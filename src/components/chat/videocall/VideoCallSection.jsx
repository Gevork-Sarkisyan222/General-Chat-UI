import { Button, Chip, Tooltip, IconButton } from "@mui/material";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import MicOffRoundedIcon from "@mui/icons-material/MicOffRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import VideocamOffRoundedIcon from "@mui/icons-material/VideocamOffRounded";
import ScreenShareRoundedIcon from "@mui/icons-material/ScreenShareRounded";
import StopScreenShareRoundedIcon from "@mui/icons-material/StopScreenShareRounded";
import CallEndRoundedIcon from "@mui/icons-material/CallEndRounded";
import CallGrid from "./CallGrid.jsx";
import "./videocall.scss";
import { useSelector } from "react-redux";

const VideoCallSection = ({
  participantsCount,
  setCallOpen,
  localVideoRef,
  localStream,
  camEnabled,
  micEnabled,
  remoteStreams,
  inCall,
  joinCall,
  toggleMic,
  toggleCam,
  screenOn,
  shareScreen,
  stopShareScreen,
  leaveCall,
}) => {
  const { background } = useSelector((state) => state.background);
  const { mobileBackBG } = useSelector((state) => state);

  const BLUE = "25, 118, 210"; // MUI blue[500] как база

  const normalizeBg = (bg) => {
    if (!bg) return 'url("https://cdn.wallpapersafari.com/73/33/P9b2gR.jpg")';
    const offWhite =
      "https://htmlcolorcodes.com/assets/images/colors/off-white-color-solid-background-1920x1080.png";
    if (typeof bg === "string" && bg.includes(offWhite)) {
      return 'url("https://cdn.wallpapersafari.com/73/33/P9b2gR.jpg")';
    }
    // если пришла чистая ссылка без url(...)
    if (
      typeof bg === "string" &&
      !bg.trim().startsWith("url(") &&
      !bg.includes("gradient(")
    ) {
      return `url("${bg}")`;
    }
    return bg;
  };

  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;

  return (
    <div
      style={{
        backgroundImage: normalizeBg(background),
        backgroundSize: "cover", // <<< ключевое изменение
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: isMobile ? "scroll" : "fixed", // фикс убираем на мобиле
        minHeight: "100dvh", // чтобы заполняло экран
        width: "100%",
      }}
      className="call-surface"
    >
      <div
        style={{
          background: "rgba(25, 118, 210, 0.06)",
          backdropFilter: "blur(6px)",
        }}
        className="call-topbar"
      >
        <div className="call-topbar__left">
          <strong style={{ color: "white" }}>Звонок</strong>
          <Chip
            size="small"
            sx={{ ml: 1, color: "black", background: "white" }}
            label={`${participantsCount} участник(а)`}
          />
        </div>
        <div className="call-topbar__right">
          <Button
            sx={
              {
                // ":hover": { background: "transparent", color: "grey" },
              }
            }
            variant="text"
            onClick={() => setCallOpen(false)}
          >
            Выйти
          </Button>
        </div>
      </div>

      <div className="call-main">
        <CallGrid
          localVideoRef={localVideoRef}
          localStream={localStream}
          camEnabled={camEnabled}
          micEnabled={micEnabled}
          remoteStreams={remoteStreams}
        />
      </div>

      <div
        className="call-toolbar"
        style={{
          position: "fixed",
          left: "50%",
          bottom: "max(16px, env(safe-area-inset-bottom))",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "8px 10px",
          borderRadius: 999,
          background: `linear-gradient(180deg, rgba(${BLUE},0.08), rgba(${BLUE},0.06))`,
          border: `1px solid rgba(${BLUE},0.22)`,
          boxShadow:
            "0 10px 30px rgba(17,24,39,0.12), inset 0 1px 0 rgba(255,255,255,0.25)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        {!inCall ? (
          <Button
            onClick={joinCall}
            startIcon={<VideoCallRoundedIcon />}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 2.2,
              py: 1,
              borderRadius: 999,
              boxShadow: "0 8px 20px rgba(25,118,210,0.35)",
              background: `linear-gradient(180deg, rgba(${BLUE},0.95), rgba(${BLUE},0.88))`,
              "&:hover": {
                background: `linear-gradient(180deg, rgba(${BLUE},1), rgba(${BLUE},0.95))`,
                boxShadow: "0 10px 24px rgba(25,118,210,0.45)",
              },
            }}
          >
            Присоединиться
          </Button>
        ) : (
          <>
            {/* Микрофон */}
            <Tooltip
              title={micEnabled ? "Выключить микрофон" : "Включить микрофон"}
            >
              <IconButton
                onClick={toggleMic}
                sx={{
                  width: 40,
                  height: 40,
                  color: micEnabled
                    ? `rgba(${BLUE},0.95)`
                    : "rgba(234, 88, 12, 0.95)", // orange-600
                  backgroundColor: micEnabled
                    ? `rgba(${BLUE},0.10)`
                    : "rgba(234, 88, 12, 0.10)",
                  "&:hover": {
                    backgroundColor: micEnabled
                      ? `rgba(${BLUE},0.18)`
                      : "rgba(234, 88, 12, 0.18)",
                  },
                }}
              >
                {micEnabled ? <MicRoundedIcon /> : <MicOffRoundedIcon />}
              </IconButton>
            </Tooltip>

            {/* Камера */}
            <Tooltip
              title={camEnabled ? "Выключить камеру" : "Включить камеру"}
            >
              <IconButton
                onClick={toggleCam}
                sx={{
                  width: 40,
                  height: 40,
                  color: camEnabled
                    ? `rgba(${BLUE},0.95)`
                    : "rgba(234, 88, 12, 0.95)",
                  backgroundColor: camEnabled
                    ? `rgba(${BLUE},0.10)`
                    : "rgba(234, 88, 12, 0.10)",
                  "&:hover": {
                    backgroundColor: camEnabled
                      ? `rgba(${BLUE},0.18)`
                      : "rgba(234, 88, 12, 0.18)",
                  },
                }}
              >
                {camEnabled ? (
                  <VideocamRoundedIcon />
                ) : (
                  <VideocamOffRoundedIcon />
                )}
              </IconButton>
            </Tooltip>

            {/* Шаринг экрана */}
            <Tooltip
              title={
                screenOn ? "Остановить показ экрана" : "Поделиться экраном"
              }
            >
              <IconButton
                onClick={screenOn ? stopShareScreen : shareScreen}
                sx={{
                  width: 40,
                  height: 40,
                  color: screenOn
                    ? "rgba(234, 88, 12, 0.95)"
                    : `rgba(${BLUE},0.95)`,
                  backgroundColor: screenOn
                    ? "rgba(234, 88, 12, 0.10)"
                    : `rgba(${BLUE},0.10)`,
                  "&:hover": {
                    backgroundColor: screenOn
                      ? "rgba(234, 88, 12, 0.18)"
                      : `rgba(${BLUE},0.18)`,
                  },
                }}
              >
                {screenOn ? (
                  <StopScreenShareRoundedIcon />
                ) : (
                  <ScreenShareRoundedIcon />
                )}
              </IconButton>
            </Tooltip>

            {/* Завершить */}
            <Tooltip title="Выйти из звонка">
              <IconButton
                onClick={leaveCall}
                sx={{
                  width: 40,
                  height: 40,
                  color: "white",
                  background:
                    "linear-gradient(180deg, rgba(239,68,68,0.95), rgba(220,38,38,0.95))", // красный градиент
                  boxShadow: "0 6px 16px rgba(220,38,38,0.35)",
                  "&:hover": {
                    background:
                      "linear-gradient(180deg, rgba(239,68,68,1), rgba(220,38,38,1))",
                  },
                }}
              >
                <CallEndRoundedIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoCallSection;
