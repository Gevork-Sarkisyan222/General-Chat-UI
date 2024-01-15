import React, { useState, useRef } from 'react';
import './write.scss';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import ClipIcon from '@mui/icons-material/AttachFile';
import axios from '../../axios';
import Input from '@mui/joy/Input';
import { Button } from '@mui/joy';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';

function WriteArea({ createMessage, setMessage, message }) {
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

  const handleAddImage = async (event) => {
    const formData = new FormData();
    const file = event.target.files[0];
    formData.append('image', file);
    console.log(formData);
  };
  const handleRemoveImage = async (event) => {};

  return (
    <div className="WriteArea">
      <input type="file" ref={inputFileRef} onChange={handleAddImage} hidden />
      <Input
        startDecorator={
          <div style={{ display: 'flex', gap: '5px' }}>
            <AddReactionIcon sx={{ cursor: 'pointer' }} />{' '}
            <AttachFileIcon
              onClick={() => inputFileRef.current.click()}
              sx={{ cursor: 'pointer' }}
            />
          </div>
        }
        endDecorator={
          message && (
            <Button onClick={createMessage}>
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
  );
}

export default WriteArea;
