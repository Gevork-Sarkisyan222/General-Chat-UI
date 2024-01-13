import React, { useState } from 'react';
import './write.scss';
import SendIcon from '@mui/icons-material/Send';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import ClipIcon from '@mui/icons-material/AttachFile';
import axios from '../../axios';

function WriteArea({ createMessage, setMessage, message }) {
  const clearInputIcon = () => {
    setMessage('');
  };

  return (
    <div className="WriteArea">
      <div class="form">
        <div style={{ display: 'flex', marginLeft: '-27px', gap: '10px' }}>
          <AddReactionIcon sx={{ color: 'grey', cursor: 'pointer' }} />
          <ClipIcon sx={{ color: 'grey', cursor: 'pointer' }} />
        </div>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          class="input"
          placeholder="Напишите..."
          required=""
          type="text"
        />
        <button onClick={clearInputIcon} class="reset" type="reset">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        {message && <SendIcon onClick={createMessage} sx={{ color: 'grey', cursor: 'pointer' }} />}
      </div>
    </div>
  );
}

export default WriteArea;
