import React, { useState } from 'react';
import './chat.scss';
import { Avatar } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../../axios';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import { useSelector } from 'react-redux';
import ProfileModalJoy from '@mui/joy/Modal';
import OtherProfile from '.././Profile/OtherProfile';

const style = {
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function ChatSection({ message, isEdited }) {
  const [editModal, setEditModal] = useState(false);
  const [edit, setEdit] = useState('');

  const handleOpenEditModal = () => setEditModal(true);
  const handleCloseEditModal = () => setEditModal(false);

  const deleteMessage = async () => {
    const messageDelete = window.confirm('Вы действительно хотите удалить ваше сообшение?');

    if (messageDelete) {
      await axios.delete(`/chat/message/${message._id}`);
    }
  };

  const editMessage = async () => {
    await axios.put(`/chat/message/${message._id}`, { message: edit });
    setEditModal(false);
  };

  const { background } = useSelector((state) => state.background);

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
        <OtherProfile user={message.user} />
      </ProfileModalJoy>
      <Modal
        open={editModal}
        onClose={handleCloseEditModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Изменить сообшение <BorderColorIcon />
          </Typography>
          <TextField
            onChange={(e) => setEdit(e.target.value)}
            defaultValue={message.message}
            id="standard-basic"
            label="Напишите сообшение"
            variant="standard"
          />
          <Button onClick={editMessage} variant="contained">
            Сохранить
          </Button>
        </Box>
      </Modal>
      <div className="Chat-Section">
        <Avatar
          onClick={handleOpenProfileModal}
          alt={message.user.name}
          src={message.user.avatarUrl ? message.user.avatarUrl : '/broken-image.jpg'}
        />
        <div className="Message-Section">
          <p className="name">{message.user.name}</p>
          <p className="role">
            {message.user.role === 'Администратор' || message.user.role === 'Супер Админ'
              ? message.user.role
              : ''}
          </p>
          <div className="text-place">
            <p className="text">{message.message}</p>
            {message?.image && (
              <div className="image">
                <img style={{ width: '100px' }} src={message?.image} alt="" />
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: '11px',
            justifyContent: 'flex-end',
            color: background ? 'white' : 'black',
          }}>
          <p>
            {new Date(message.createdAt).getHours().toString().padStart(2, '0')}:
            {new Date(message.createdAt).getMinutes().toString().padStart(2, '0')}
          </p>
        </div>
        {isEdited && (
          <>
            <EditIcon
              onClick={handleOpenEditModal}
              sx={{ cursor: 'pointer', color: 'rgb(255, 102, 0)' }}
            />
            <DeleteIcon onClick={deleteMessage} sx={{ cursor: 'pointer', color: 'red' }} />
          </>
        )}
      </div>
    </>
  );
}

export default ChatSection;
