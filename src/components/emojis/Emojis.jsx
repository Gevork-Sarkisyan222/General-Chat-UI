import React from 'react';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import ReactMarkdown from 'react-markdown';

function Emojis() {
  const markdownText = `Смайлики & Эмоджи
  😀
  😃
  😄
  😁
  😆
  😅
  🤣
  😂
  🙂
  😉
  😊
  😇
  🥰
  😍
  🤩
  😘
  😗
  ☺️
  😚
  😙
  🥲
  😏
  😋
  😛
  😜
  🤪
  😝
  🤗
  🤭
  🫢
  🫣
  🤫
  🤔
  🫡
  🤤
  🤠
  🥳
  🥸
  😎
  🤓
  🧐
  🙃
  🫠
  🤐
  🤨
  😐
  😑
  😶
  🫥
  😶‍🌫️
  😒
  🙄
  😬
  😮‍💨
  🤥
  🫨
  😌
  😔
  😪
  😴
  😷
  🤒
  🤕
  🤢
  🤮
  🤧
  🥵
  🥶
  🥴
  😵
  😵‍💫
  🤯
  🥱
  😕
  🫤
  😟
  🙁
  ☹️
  😮
  😯
  😲
  😳
  🥺
  🥹
  😦
  😧
  😨
  😰
  😥
  😢
  😭
  😱
  😖
  😣
  😞
  😓
  😩
  😫
  😤
  😡
  😠
  🤬
  👿
  😈
  👿
  💀
  ☠️
  💩
  🤡
  👹
  👺
  👻
  👽
  👾
  🤖
  😺
  😸
  😹
  😻
  😼
  😽
  🙀
  😿
  😾
  🙈
  🙉
  🙊`;

  return (
    <Sheet
      variant="outlined"
      sx={{
        maxWidth: 350,
        borderRadius: 'md',
        p: 3,
        boxShadow: 'lg',
      }}>
      <ModalClose variant="plain" sx={{ m: 1 }} />
      <Typography
        component="h2"
        id="modal-title"
        level="h4"
        textColor="inherit"
        fontWeight="lg"
        mb={1}>
        Выберите смайлик
      </Typography>
      <ReactMarkdown>{markdownText}</ReactMarkdown>
    </Sheet>
  );
}

export default Emojis;
