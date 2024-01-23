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
import { io } from 'socket.io-client';

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

function Chat({ socket, messages, setMessages }) {
  const { background } = useSelector((state) => state.background);
  const { mobileBackBG } = useSelector((state) => state);
  // const randomOnline = useMemo(() => Math.floor(Math.random() * 30), []);
  const [online, setOnline] = useState(0);
  const [isOnlineUser, setIsOnlineUser] = useState([]);
  // const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [users, setUsers] = useState([]);
  // message for WriteArea
  const [message, setMessage] = useState('');
  const { currentUser } = useSelector((state) => state.user);
  const isAuthenticated = useSelector(isAuthUser);
  const { pageBackground } = useSelector((state) => state.pageBackground);
  const smallDevice = useMediaQuery('(max-width:600px)');
  const scrollRef = useRef();

  // when message changes adding new scroll will go down with css behavior 'smooth'
  useEffect(() => {
    const messagesContainer = scrollRef.current;
    const newScrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;

    messagesContainer.scrollTo({
      top: newScrollTop,
      behavior: 'smooth',
    });
  }, [messages]);
  // ============

  useEffect(() => {
    // socket.current = io('ws://localhost:8080');
    socket.current = io('https://socket-server-v9ni.onrender.com');
    socket.current.on('getMessage', (data) => {
      setArrivalMessage({
        _id: data.messageId,
        userId: data.userId,
        message: data.message,
        user: data.user,
        createdAt: Date.now(),
      });
    });
  }, []);

  // =================

  // sending message with socket
  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  // delete message with socket
  useEffect(() => {
    socket.current.on('messageDeleted', ({ messageId }) => {
      setMessages((prevMessages) => prevMessages.filter((message) => message._id !== messageId));
    });
  }, [socket]);
  // =================

  // update message with socket
  useEffect(() => {
    socket.current.on('messageUpdated', ({ messageId, editedMessage }) => {
      setMessages((prevMessages) => {
        return prevMessages.map((message) =>
          message._id === messageId ? { ...message, message: editedMessage } : message,
        );
      });
    });
  }, [socket, setMessages]);
  // =================

  useEffect(() => {
    isAuthenticated && socket.current?.emit('addUser', currentUser?._id);
    socket.current?.on('getUsers', (users) => {
      setOnline(users.length);
      console.log(
        'users id array',
        users,
        users.map((user) => user.userId),
      );
      setIsOnlineUser(users.map((user) => user.userId));
    });
  }, [currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get('/chat/message');
      setMessages(res.data);
    };
    fetchData();

    // const interval = setInterval(() => {
    //   fetchData();
    // }, 1000);

    // return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get('/users');
      setUsers(res.data);
    };
    fetchUsers();
  }, []);

  const createMessage = async () => {
    const res = await axios.post('/chat/message', { message: message });
    // console.log('res id in create', res.data._id);
    // const res = await axios.get('/chat/message');
    socket.current.emit('sendMessage', {
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
    // setMessages(res.data);
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
    setUsers(users.filter((user) => user?._id !== userId));
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

  const checkIfOnline = (userId) => {
    return isOnlineUser.includes(userId);
  };

  console.log(isOnlineUser);
  console.log(currentUser?._id === isOnlineUser.toString());
  console.log(currentUser?._id, isOnlineUser.toString());

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
              Онлайн всего {online}
              <span style={{ fontSize: '13px' }}>🟢</span>
            </h3>
            <div className="line"></div>
          </header>
          <div ref={scrollRef} style={{ backgroundImage: background }} className="chat-area">
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
                <h3 style={{ color: background ? 'white' : 'black' }}>Чат был очищен</h3>
              </div>
            )}
          </div>
        </div>
        {isAuthenticated ? (
          <WriteArea
            createMessage={createMessage}
            setMessage={setMessage}
            message={message}
            socket={socket}
            setMessages={setMessages}
          />
        ) : (
          ''
        )}
      </div>
    </>
  );
}

export default Chat;
