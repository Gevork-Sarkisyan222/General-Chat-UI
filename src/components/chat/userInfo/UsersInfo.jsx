import React, { useState } from "react";
import { useSelector } from "react-redux";
import { isAuthUser } from "../../../redux/slice/userSlice";
import axios from "../../../axios";

import {
  Avatar,
  Box,
  Card,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
  Badge,
  CircularProgress,
} from "@mui/material";

import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import AdminAddIcon from "@mui/icons-material/PersonAdd";
import RemoveAdminIcon from "@mui/icons-material/Backspace";
import CloseRounded from "@mui/icons-material/CloseRounded";
import { styled } from "@mui/material/styles";

import ProfileModalJoy from "@mui/joy/Modal";
import OtherProfile from "../../Profile/OtherProfile";

/* ==== Online badge with ripple ==== */
const OnlineBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    width: 12,
    height: 12,
    borderRadius: 20,
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
    "0%": { transform: "scale(.8)", opacity: 1 },
    "100%": { transform: "scale(2.4)", opacity: 0 },
  },
}));

/* ==== role → Chip ==== */
const RoleChip = ({ role }) => {
  if (role === "Супер Админ") {
    return (
      <Chip
        label="Супер-админ"
        color="secondary"
        size="small"
        variant="filled"
        sx={{ fontWeight: 600 }}
      />
    );
  }
  if (role === "Администратор") {
    return (
      <Chip
        label="Администратор"
        color="primary"
        size="small"
        variant="outlined"
        sx={{ fontWeight: 600 }}
      />
    );
  }
  return (
    <Chip
      label="Участник"
      size="small"
      variant="outlined"
      sx={{
        fontWeight: 500,
        borderColor: (t) => alpha(t.palette.text.primary, 0.15),
      }}
    />
  );
};

function UsersInfo({ user, onDeleteUser, alreadyOnline }) {
  const isAuthenticated = useSelector(isAuthUser);
  const { currentUser } = useSelector((state) => state.user);

  /* локальная роль — чтобы UI мгновенно менялся */
  const [role, setRole] = useState(user.role);
  const [isRoleUpdating, setIsRoleUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [profileModal, setProfileModal] = useState(false);
  const handleOpenProfileModal = () => setProfileModal(true);
  const handleCloseProfileModal = () => setProfileModal(false);

  const canManage =
    (isAuthenticated && currentUser?.role === "Администратор") ||
    currentUser?.role === "Супер Админ";

  const showRemoveAdmin =
    isAuthenticated &&
    currentUser?.role === "Супер Админ" &&
    role === "Администратор";

  /* === ДЕЙСТВИЯ (оптимистично) === */

  const handleDeleteUser = async () => {
    const ok = window.confirm(
      `Вы действительно хотите удалить ${user.name} из чата?`
    );
    if (!ok) return;
    try {
      setIsDeleting(true);
      // оповещаем родителя/список сразу
      onDeleteUser(user._id);
      await axios.delete(`/user/${user._id}`);
    } catch (e) {
      // если нужно — можно откатить наружу, но обычно список повторно загрузится
      console.error(e);
      alert("Не удалось удалить. Попробуйте ещё раз.");
    } finally {
      setIsDeleting(false);
    }
  };

  const makeAdmin = async () => {
    const ok = window.confirm(`Сделать ${user.name} администратором чата?`);
    if (!ok) return;
    const prev = role;
    try {
      setIsRoleUpdating(true);
      setRole("Администратор"); // UI сразу
      await axios.put(`/user/role/admin/${user._id}`); // сервер
    } catch (e) {
      setRole(prev); // откат при ошибке
      console.error(e);
      alert("Не удалось выдать права администратора.");
    } finally {
      setIsRoleUpdating(false);
    }
  };

  const removeAdmin = async () => {
    const ok = window.confirm(`Снять ${user.name} с поста администратора?`);
    if (!ok) return;
    const prev = role;
    try {
      setIsRoleUpdating(true);
      setRole("Участник"); // UI сразу
      await axios.put(`/user/role/admin/lower/${user._id}`); // сервер
    } catch (e) {
      setRole(prev); // откат при ошибке
      console.error(e);
      alert("Не удалось снять права администратора.");
    } finally {
      setIsRoleUpdating(false);
    }
  };

  return (
    <>
      {/* Профиль */}
      <ProfileModalJoy
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={profileModal}
        onClose={handleCloseProfileModal}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Box sx={{ position: "relative", maxWidth: 560, width: "95%" }}>
          <IconButton
            onClick={handleCloseProfileModal}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              bgcolor: (t) => alpha(t.palette.background.paper, 0.9),
            }}
          >
            <CloseRounded />
          </IconButton>
          <OtherProfile
            alreadyOnline={alreadyOnline}
            user={{ ...user, role }}
          />
        </Box>
      </ProfileModalJoy>

      {/* Карточка пользователя */}
      <Card
        elevation={2}
        sx={{
          p: 1.5,
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          bgcolor: (t) =>
            t.palette.mode === "dark"
              ? alpha(t.palette.background.paper, 0.7)
              : t.palette.background.paper,
          border: (t) =>
            `1px solid ${alpha(
              t.palette.divider,
              t.palette.mode === "dark" ? 1 : 0.6
            )}`,
          transition: "transform .2s ease, box-shadow .2s ease",
          "&:hover": { transform: "translateY(-1px)", boxShadow: 6 },
        }}
      >
        <Box sx={{ position: "relative" }}>
          {alreadyOnline ? (
            <OnlineBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar
                onClick={handleOpenProfileModal}
                sx={{ cursor: "pointer", width: 48, height: 48 }}
                alt={user.name}
                src={user.avatarUrl || "/broken-image.jpg"}
              />
            </OnlineBadge>
          ) : (
            <Avatar
              onClick={handleOpenProfileModal}
              sx={{ cursor: "pointer", width: 48, height: 48 }}
              alt={user.name}
              src={user.avatarUrl || "/broken-image.jpg"}
            />
          )}
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ flex: 1, gap: 1 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={user.name}
            >
              {user.name}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 0.5 }}
            >
              <RoleChip role={role} />
            </Stack>
          </Box>

          <Stack direction="row" alignItems="center" spacing={0.5}>
            {/* снять админа: только супер-админ и когда роль = Администратор */}
            {canManage && showRemoveAdmin && (
              <Tooltip title="Снять с админа">
                <span>
                  <IconButton
                    onClick={removeAdmin}
                    size="small"
                    disabled={isRoleUpdating}
                  >
                    {isRoleUpdating ? (
                      <CircularProgress size={18} />
                    ) : (
                      <RemoveAdminIcon fontSize="small" />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {/* удалить пользователя: нельзя удалять админов/супера */}
            {canManage &&
              !(role === "Администратор" || role === "Супер Админ") && (
                <Tooltip title="Удалить из чата">
                  <span>
                    <IconButton
                      onClick={handleDeleteUser}
                      size="small"
                      sx={{ color: "error.main" }}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <CircularProgress size={18} />
                      ) : (
                        <PersonRemoveIcon fontSize="small" />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              )}

            {/* выдать админа: доступно, если сейчас участник */}
            {canManage && role === "Участник" && (
              <Tooltip title="Сделать админом">
                <span>
                  <IconButton
                    onClick={makeAdmin}
                    size="small"
                    sx={{ color: "primary.main" }}
                    disabled={isRoleUpdating}
                  >
                    {isRoleUpdating ? (
                      <CircularProgress size={18} />
                    ) : (
                      <AdminAddIcon fontSize="small" />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </Card>

      <Divider sx={{ my: 1.25 }} />
    </>
  );
}

export default UsersInfo;
