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
  return (
    <div className="call-surface">
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

      <div className="call-main">
        <CallGrid
          localVideoRef={localVideoRef}
          localStream={localStream}
          camEnabled={camEnabled}
          micEnabled={micEnabled}
          remoteStreams={remoteStreams}
        />
      </div>

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
              title={micEnabled ? "Выключить микрофон" : "Включить микрофон"}
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
  );
};

export default VideoCallSection;
