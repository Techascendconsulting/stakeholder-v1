import React, { useState } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useSlackChat } from '@/hooks/useSlackChat';

interface Props { channelId: string | null }

const StudentGroupChat: React.FC<Props> = ({ channelId }) => {
  const { messages, loading, sendMessage } = useSlackChat(channelId);
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  if (!channelId) {
    return <div className="p-4 text-gray-500">No Slack channel linked to this group.</div>;
  }

  return (
    <div className="flex flex-col h-full border rounded-lg bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && <p className="text-gray-400">Loading chat…</p>}
        {messages.map((msg) => (
          <div key={msg.ts} className="flex space-x-2">
            <img src={msg.userAvatar} alt="avatar" className="w-8 h-8 rounded-full" />
            <div>
              <p className="text-sm font-semibold">
                {msg.userName} <span className="text-xs text-gray-400">{msg.time}</span>
              </p>
              <p className="text-gray-800 whitespace-pre-wrap">{msg.text}</p>
              {msg.reactions?.map((r) => (
                <span key={r.name} className="inline-block bg-gray-100 px-1 rounded text-xs mr-1">
                  {r.name} {r.count}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t p-2 flex items-center relative">
        <button className="mr-2" onClick={() => setShowEmoji(!showEmoji)}>😊</button>
        {showEmoji && (
          <div className="absolute bottom-12 left-2 z-50 bg-white shadow-lg rounded">
            <Picker data={data as any} onEmojiSelect={(emoji: any) => setInput((v) => v + (emoji?.native || ''))} />
          </div>
        )}
        <textarea
          className="flex-1 p-2 border rounded resize-none"
          rows={1}
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button onClick={handleSend} className="ml-2 bg-blue-500 text-white px-4 py-1 rounded">Send</button>
      </div>
    </div>
  );
};

export default StudentGroupChat;


