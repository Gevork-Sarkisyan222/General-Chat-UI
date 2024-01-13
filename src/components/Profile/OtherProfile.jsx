import React from 'react';
import './profile.scss';
import { Avatar } from '@mui/material';
import { useSelector } from 'react-redux';
import ModalClose from '@mui/joy/ModalClose';
import Sheet from '@mui/joy/Sheet';
import TypographyJoy from '@mui/joy/Typography';
import { format, register } from 'timeago.js';
import ru from 'timeago.js/esm/lang/ru';

function Profile({ user }) {
  register('ru', ru);

  const date = new Date(user?.createdAt);
  const formattedDate = format(date, 'ru');

  return (
    <Sheet
      variant="outlined"
      sx={{
        maxWidth: 500,
        borderRadius: 'md',
        p: 3,
        boxShadow: 'lg',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
      }}>
      <ModalClose variant="plain" sx={{ m: 1 }} />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Avatar
          sx={{ width: '140px', height: '140px' }}
          src={user?.avatarUrl ? user?.avatarUrl : '/broken-image.jpg'}
          alt={user?.name}
        />
      </div>
      <TypographyJoy
        component="h2"
        id="modal-title"
        level="h4"
        textColor="inherit"
        fontWeight="lg"
        mb={1}>
        {user?.name}
      </TypographyJoy>
      <TypographyJoy
        component="h2"
        id="modal-title"
        level="h4"
        textColor="inherit"
        fontWeight="lg"
        mb={1}>
        {user?.email}
      </TypographyJoy>
      <TypographyJoy
        component="h2"
        id="modal-title"
        level="h4"
        textColor="inherit"
        fontWeight="lg"
        mb={1}>
        {user?.role}
      </TypographyJoy>
      <TypographyJoy id="modal-desc" textColor="text.tertiary">
        Аккаунт был создан {formattedDate}
      </TypographyJoy>
    </Sheet>
  );
}

export default Profile;
