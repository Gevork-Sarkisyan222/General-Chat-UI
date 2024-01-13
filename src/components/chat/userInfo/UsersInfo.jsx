import React, { useState } from 'react';
import './userInfo.scss';
import { Avatar } from '@mui/material';
import { useSelector } from 'react-redux';
import { isAuthUser } from '../../../redux/slice/userSlice';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import AdminAddIcon from '@mui/icons-material/PersonAdd';
import Button from '@mui/material/Button';
import axios from '../../../axios';
import RemoveAdminIcon from '@mui/icons-material/Backspace';

import ProfileModalJoy from '@mui/joy/Modal';
import OtherProfile from '../../Profile/OtherProfile';

function UsersInfo({ user, onDeleteUser }) {
  const isAuthenticated = useSelector(isAuthUser);
  const { currentUser } = useSelector((state) => state.user);
  const [userButton, setUserButton] = useState(true);
  const [adminButton, setAdminButton] = useState(false);
  const [removeAdminState, setRemoveAdminState] = useState(true);

  const changeUserButtonIntoAdmin = () => {
    setUserButton(false);
    setAdminButton(true);
  };

  const handleDeleteUser = async () => {
    const message = window.confirm(`Вы действительно хотите удалить ${user.name} из чата?`);
    if (message) {
      const res = await axios.delete(`/user/${user._id}`);
      onDeleteUser(user._id);
      return res.data;
    }
  };

  const makeAdmin = async () => {
    const messageAdmin = window.confirm(
      `Вы действительно хотите сделать участника ${user.name} администратором чата?`,
    );

    if (messageAdmin) {
      await axios.put(`/user/role/admin/${user._id}`);
      changeUserButtonIntoAdmin();
    }
  };

  const removeAdmin = async () => {
    const removeMessage = window.confirm(
      `Вы действительно хотите снять ${user.name} с поста администратора`,
    );
    if (removeMessage) {
      await axios.put(`/user/role/admin/lower/${user._id}`);
      setRemoveAdminState(false);
    }
  };

  const [profileModal, setProfileModal] = useState(false);
  const handleOpenProfileModal = () => {
    setProfileModal(true);
  };
  const handleCloseProfileModal = () => {
    setProfileModal(false);
  };

  return (
    <>
      <ProfileModalJoy
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={profileModal}
        onClose={handleCloseProfileModal}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <OtherProfile user={user} />
      </ProfileModalJoy>
      <div className="section">
        <Avatar
          onClick={handleOpenProfileModal}
          sx={{ cursor: 'pointer' }}
          alt={user.name}
          src={user.avatarUrl ? user.avatarUrl : '/broken-image.jpg'}
        />
        <h1>{user.name}</h1>

        {removeAdminState && user.role === 'Администратор' && (
          <>
            {user.role === 'Администратор' && (
              <button className="admin-btn" style={{ marginLeft: '4px' }}>
                {user.role}
              </button>
            )}
          </>
        )}
        {user.role === 'Супер Админ' && (
          <>
            {user.role === 'Супер Админ' && (
              <button
                className="super-admin-button"
                style={{
                  marginLeft: '4px',
                }}>
                {user.role}
              </button>
            )}
          </>
        )}
        {isAuthUser &&
          currentUser?.role === 'Супер Админ' &&
          user.role === 'Администратор' &&
          removeAdminState && (
            <RemoveAdminIcon onClick={removeAdmin} style={{ cursor: 'pointer' }} />
          )}
        {(isAuthenticated && currentUser?.role === 'Администратор') ||
        currentUser?.role === 'Супер Админ' ? (
          <>
            {user.role === 'Администратор' || user.role === 'Супер Админ' ? (
              ''
            ) : (
              <PersonRemoveIcon
                onClick={handleDeleteUser}
                sx={{ color: 'red', cursor: 'pointer' }}
              />
            )}
            {userButton && user.role === 'Участник' && (
              <>
                <button className="make-admin" onClick={makeAdmin}>
                  Сделать админом
                </button>
                {/* admin button */}
              </>
            )}
            {!removeAdminState && (
              <button className="make-admin" onClick={makeAdmin}>
                Сделать админом
              </button>
            )}
            {adminButton && (
              <button className="admin-btn" style={{ marginLeft: '4px' }}>
                Администратор
              </button>
            )}
          </>
        ) : (
          ''
        )}
      </div>
    </>
  );
}

export default UsersInfo;
