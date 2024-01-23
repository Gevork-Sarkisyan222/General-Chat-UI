import React from 'react';
import './profile.scss';
import { Avatar } from '@mui/material';
import { useSelector } from 'react-redux';
import ModalClose from '@mui/joy/ModalClose';
import Sheet from '@mui/joy/Sheet';
import TypographyJoy from '@mui/joy/Typography';
import { format, register } from 'timeago.js';
import ru from 'timeago.js/esm/lang/ru';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    width: '20px',
    height: '20px',
    borderRadius: '20px',
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

function Profile({ user, alreadyOnline }) {
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
        {alreadyOnline ? (
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot">
            <Avatar
              sx={{ width: '140px', height: '140px', cursor: 'pointer' }}
              alt={user?.name}
              src={user?.avatarUrl ? user?.avatarUrl : '/broken-image.jpg'}
            />
          </StyledBadge>
        ) : (
          <Avatar
            sx={{ width: '140px', height: '140px', cursor: 'pointer' }}
            src={user?.avatarUrl ? user?.avatarUrl : '/broken-image.jpg'}
            alt={user?.name}
          />
        )}
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
