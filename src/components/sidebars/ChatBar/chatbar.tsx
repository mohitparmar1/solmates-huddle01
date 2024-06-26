import { BasicIcons } from '@/utils/BasicIcons';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import ChatsPreview from './chatsPreview';
import { useDataMessage, useLocalPeer } from '@huddle01/react/hooks';
import { useState } from 'react';
import { PeerMetadata } from '@/utils/types';

const ChatBar = () => {
  const { sendData } = useDataMessage();
  const [message, setMessage] = useState('');
  const { metadata } = useLocalPeer<PeerMetadata>();
  const [isFileUploading, setIsFileUploading] = useState(false);

  const sendMessage = () => {
    sendData({
      to: '*',
      payload: JSON.stringify({
        message,
        name: metadata?.displayName,
      }),
      label: 'chat',
    });
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsFileUploading(true);

        const response = await fetch('/uploadFile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
          }),
        });

        if (response.ok) {
          const { url, fields } = await response.json();
          const formData = new FormData();
          Object.entries(fields).forEach(([key, value]) => {
            formData.append(key, value as string);
          });
          formData.append('file', file);

          const uploadResponse = await fetch(url, {
            method: 'POST',
            body: formData,
          });

          console.log(`${url}${fields.key}`);

          if (uploadResponse.ok) {
            sendData({
              to: '*',
              payload: JSON.stringify({
                message: `${url}${fields.key}`,
                fileName: file.name,
                name: metadata?.displayName,
              }),
              label: 'file',
            });
          }
        }
      }
    };
    input.click();
    setIsFileUploading(false);
  };

  return (
    <div className='flex w-96 rounded-lg mr-4 flex-col h-full bg-gray-400 text-white'>
      <div className='px-4 py-2 border-b border-gray-300'>
        <h1 className='text-xl font-semibold'>Chat</h1>
      </div>
      <div className='flex-1 p-2 overflow-y-auto'>
        <ChatsPreview />
      </div>
      <div className='p-2 rounded-b-lg'>
        <div className='flex gap-2'>
          <Input
            className='flex-1 rounded-lg bg-gray-300 text-black placeholder-black '
            placeholder='Type your message'
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            onKeyDown={handleKeyDown}
          />
          <Button
            className='bg-gray-600 hover:bg-gray-500 text-gray-200 p-2'
            onClick={handleUpload}
          >
            {BasicIcons.upload}
          </Button>
          <Button
            className='bg-gray-600 hover:bg-gray-500 text-gray-200'
            onClick={sendMessage}
          >
            {BasicIcons.send}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBar;
