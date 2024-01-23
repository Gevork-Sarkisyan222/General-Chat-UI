import React, { useState, useRef, useEffect } from 'react';
import './write.scss';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import ClipIcon from '@mui/icons-material/AttachFile';
import axios from '../../axios';
import Input from '@mui/joy/Input';
import { Button } from '@mui/joy';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import app from '../../firebase';
import Emojis from '../emojis/Emojis';
import { useSelector } from 'react-redux';

function WriteArea({ createMessage, setMessage, message, socket, setMessages, edit }) {
  const { currentUser } = useSelector((state) => state.user);
  const [arrivalImageMessage, setArrivalImageMessage] = useState(null);
  const [open, setOpen] = React.useState(false);
  const inputFileRef = useRef();

  const clearInputIcon = () => {
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      createMessage();
    }
  };

  // adding into firebase storage

  const [image, setImage] = useState(undefined);
  const [imageUrl, setImageUrl] = useState('');
  console.log('this imageUrl', imageUrl);

  const uploadFile = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
        }
      },
      (error) => {
        console.warn(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            console.log('File available at', downloadURL);
            alert('Файл успешно выбран и загружен');
            setImageUrl(downloadURL);
          })
          .catch((error) => {
            console.error('Error getting download URL:', error);
          });
      },
    );
  };

  useEffect(() => {
    image && uploadFile(image);
  }, [image]);

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/chat/message', { image: imageUrl });
      socket.current.emit('uploadImage', {
        selectedImage: imageUrl,
        messageId: res.data?._id,
        user: {
          _id: currentUser?._id,
          name: currentUser?.name,
          role: currentUser?.role,
          avatarUrl: currentUser?.avatarUrl,
        },
      });
      setImageUrl('');
    } catch (error) {
      console.error('Ошибка при отправке файла:', error);
    }
  };

  useEffect(() => {
    socket.current.on('uploadedImage', ({ selectedImage, messageId, user }) => {
      setArrivalImageMessage({
        image: selectedImage,
        _id: messageId,
        user: user,
        createdAt: Date.now(),
      });
    });
  }, [arrivalImageMessage]);

  // upload file imageUrl
  useEffect(() => {
    arrivalImageMessage && setMessages((prev) => [...prev, arrivalImageMessage]);
  }, [arrivalImageMessage]);

  // useEffect(() => {
  //   socket.current.on('uploadedImage', ({ selectedImage }) => {
  //     console.log(selectedImage);
  //     setMessages(selectedImage);
  //   });
  // }, [setMessages]);

  console.log('message id arrival', arrivalImageMessage?._id);

  return (
    <>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Emojis />
      </Modal>
      <div className="WriteArea">
        <input
          accept="image/*"
          type="file"
          ref={inputFileRef}
          onChange={(e) => setImage(e.target.files[0])}
          hidden
        />
        <Input
          startDecorator={
            <div style={{ display: 'flex', gap: '5px' }}>
              <AddReactionIcon onClick={() => setOpen(true)} sx={{ cursor: 'pointer' }} />{' '}
              <AttachFileIcon
                onClick={() => inputFileRef.current.click()}
                sx={{ cursor: 'pointer' }}
              />
            </div>
          }
          endDecorator={
            (message || imageUrl) && (
              <Button
                onClickCapture={(e) => imageUrl && handleUpload(e)}
                onClick={() => message && createMessage()}>
                <SendIcon />
              </Button>
            )
          }
          placeholder="Напишите сообщение"
          variant="soft"
          value={message}
          type="text"
          required=""
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            '--Input-radius': '0px',
            '--Input-gap': '8px',
            borderBottom: '2px solid',
            borderColor: 'neutral.outlinedBorder',
            '&:hover': {
              borderColor: 'neutral.outlinedHoverBorder',
            },
            '&::before': {
              border: '1px solid var(--Input-focusedHighlight)',
              transform: 'scaleX(0)',
              left: 0,
              right: 0,
              bottom: '-2px',
              top: 'unset',
              transition: 'transform .15s cubic-bezier(0.1,0.9,0.2,1)',
              borderRadius: 0,
            },
            '&:focus-within::before': {
              transform: 'scaleX(1)',
            },
          }}
        />
        {/* </div> */}
      </div>
    </>
  );
}

export default WriteArea;
