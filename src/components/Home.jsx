import React from 'react';
import Chat from './chat/Chat';

function Home({ socket, messages, setMessages }) {
  return (
    <>
      <Chat messages={messages} setMessages={setMessages} socket={socket} />
    </>
  );
}

export default Home;
