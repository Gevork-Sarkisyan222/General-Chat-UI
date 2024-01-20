import React from 'react';
import EmojiPicker from 'emoji-picker-react';

function Emojis() {
  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    alert('Выбранная вами эмоджи сохранена в буфер обмена');

    navigator.clipboard.writeText(emoji).then(() => {
      console.log(`Emoji "${emoji}" copied to clipboard.`);
    });
  };

  return (
    <div>
      <EmojiPicker onEmojiClick={handleEmojiClick} />
    </div>
  );
}

export default Emojis;
