import React, { useState, useEffect, useMemo, useRef } from 'react';
import './chat.scss';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import ChatSection from './ChatSection';
import WriteArea from '../write/WriteArea';
import axios from '../../axios';
import Box from '@mui/material/Box';
import UserListModal from '@mui/material/Modal';
import UsersInfo from './userInfo/UsersInfo';
import { useSelector } from 'react-redux';
import { isAuthUser } from '../../redux/slice/userSlice';
import EditGroupIcon from '@mui/icons-material/EditCalendar';
import ChangeGroupModal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import useMediaQuery from '@mui/material/useMediaQuery';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  maxWidth: '85vw',
  maxHeight: '85vh',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflow: 'auto',
};

const styleForGroupModal = {
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  maxWidth: '85vw',
  maxHeight: '85vh',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflow: 'auto',
};

function Chat() {
  const { background } = useSelector((state) => state.background);
  const { mobileBackBG } = useSelector((state) => state);
  const randomOnline = useMemo(() => Math.floor(Math.random() * 30), []);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  // message for WriteArea
  const [message, setMessage] = useState('');
  const { currentUser } = useSelector((state) => state.user);
  const isAuthenticated = useSelector(isAuthUser);
  const { pageBackground } = useSelector((state) => state.pageBackground);
  const smallDevice = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get('/chat/message');
      setMessages(res.data);
    };
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get('/users');
      setUsers(res.data);
    };
    fetchUsers();
  }, []);

  const createMessage = async () => {
    await axios.post('/chat/message', { message: message });
    const res = await axios.get('/chat/message');
    setMessages(res.data);
    setMessage('');
  };

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const onDeleteUser = (userId) => {
    setUsers(users.filter((user) => user._id !== userId));
  };

  const [groupName, setGroup] = useState(
    localStorage.getItem('group') ? localStorage.getItem('group') : 'Ровные пацаны',
  );
  const [groupModal, setGroupModal] = useState(false);

  const handleOpenGroupModal = () => {
    const openMessage = window.confirm('Вы действительно хотите изменить название группы?');

    if (openMessage) {
      setGroupModal(true);
    }
  };
  const handleCloseGroupModal = () => setGroupModal(false);

  const saveInfoLSgroup = () => {
    setGroupModal(false);
    localStorage.setItem('group', groupName);
  };

  return (
    <>
      <ChangeGroupModal
        open={groupModal}
        onClose={handleCloseGroupModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
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
          sx={{ overflow: 'auto' }}
          aria-labelledby="parent-modal-title"
          aria-describedby="parent-modal-description">
          <Box
            sx={{
              ...style,
              width: 295,
              display: 'flex',
            }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <section className="scroll-place">
                  {users.map((user) => (
                    <UsersInfo key={user.id} user={user} onDeleteUser={onDeleteUser} />
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
            backgroundImage: smallDevice && isAuthenticated ? mobileBackBG.mobileBackBG : '',
            color: mobileBackBG.mobileBackBG ? 'white' : 'black',
          }}
          className="Wrapper">
          <header>
            <h2 style={{ fontSize: '20px' }}>
              {groupName}{' '}
              {isAuthenticated && (
                <EditGroupIcon
                  onClick={handleOpenGroupModal}
                  sx={{ cursor: 'pointer', color: 'grey' }}
                />
              )}
            </h2>
            <AvatarGroup
              sx={{
                display: 'flex',
                justifyContent: 'center',
                '& .MuiAvatar-root': {
                  width: '35px',
                  height: '35px',
                },
              }}
              total={users.length}>
              {users.map((user) => (
                <Avatar
                  onClick={handleOpen}
                  sx={{ cursor: 'pointer' }}
                  alt={user.name}
                  src={user.avatarUrl ? user.avatarUrl : '/broken-image.jpg'}
                />
              ))}
            </AvatarGroup>
            <h3 style={{ fontSize: '18px' }}>
              Онлайн всего {randomOnline}
              <span style={{ fontSize: '13px' }}>🟢</span>
            </h3>
            <div className="line"></div>
          </header>
          <div style={{ backgroundImage: background }} className="chat-area">
            {messages.length > 0 ? (
              messages.map((message) => (
                <ChatSection
                  key={message._id}
                  message={message}
                  isEdited={currentUser?._id === message.user._id}
                />
              ))
            ) : (
              <div>
                <h3 style={{ color: background ? 'white' : 'black' }}>Чат был очищен</h3>
              </div>
            )}
          </div>
        </div>
        {isAuthenticated ? (
          <WriteArea createMessage={createMessage} setMessage={setMessage} message={message} />
        ) : (
          ''
        )}
      </div>
    </>
  );
}

export default Chat;
