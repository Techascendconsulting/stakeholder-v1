import React, { useEffect, useMemo, useRef, useState } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useSlackChat } from '@/hooks/useSlackChat';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bold, Italic, Strikethrough, Smile, Pencil, Trash } from 'lucide-react';

interface Props { channelId: string | null }

function formatDateDivider(date: Date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  const diff = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getDeterministicBg(name: string | undefined): string {
  const palette = [
    'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-blue-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-rose-500', 'bg-sky-500', 'bg-violet-500', 'bg-teal-500'
  ];
  if (!name) return palette[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % palette.length;
  return palette[idx];
}

function stripLeadingEmoji(text: string): string {
  try {
    // Strip leading emojis (Extended_Pictographic), optional variation selectors/ZWJ, then spaces
    const re = /^(?:\p{Extended_Pictographic}(?:\uFE0F|\u200D)?)+\s*/u;
    return text.replace(re, '');
  } catch {
    // If the runtime doesn't support Unicode property escapes, do nothing
    return text;
  }
}

const StudentGroupChat: React.FC<Props> = ({ channelId }) => {
  const { user } = useAuth();
  const currentUserEmail = user?.email || null;
  const currentUserSlackId = null;
  const { messages, loading, sendMessage, editMessage, deleteMessage, addReaction, removeReaction } = useSlackChat(channelId, currentUserSlackId, currentUserEmail);

  const [editingTs, setEditingTs] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!channelId) {
    return <div className="p-4 text-gray-500">No Slack channel linked to this group.</div>;
  }

  let lastDate: string | null = null;
  let lastUser: string | null = null;

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
        {loading && <p className="text-gray-400">Loading chat…</p>}
        {!loading && messages.length === 0 && (
          <p className="text-gray-400">No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => {
          const msgDate = new Date(parseFloat(msg.ts) * 1000);
          const divider = formatDateDivider(msgDate);
          const showDivider = divider !== lastDate;
          lastDate = divider;

          const userKey = msg.userId || msg.userName || '';
          const showAvatar = userKey !== lastUser;
          lastUser = userKey;

          return (
            <div key={msg.ts}>
              {showDivider && (
                <div className="relative flex items-center my-4">
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                  <span className="mx-2 text-xs text-gray-500 bg-white dark:bg-gray-800 px-2 rounded">{divider}</span>
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                </div>
              )}

              <div className="flex items-start group relative space-x-2">
                {showAvatar ? (
                  <Avatar className="w-8 h-8 mt-1 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                    <AvatarImage className="w-full h-full object-cover rounded-full" src={msg.userAvatar || ''} />
                    <AvatarFallback className={`${getDeterministicBg(msg.userName)} text-white font-semibold rounded-full`}>{msg.userName?.slice(0, 2)?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-8" />
                )}

                <div className="flex-1">
                  {showAvatar && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{msg.userName}</span>
                      <span className="text-xs text-gray-400">{msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}

                  {editingTs === msg.ts ? (
                    <Input
                      value={editText}
                      autoFocus
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={async () => { await editMessage(msg.ts, editText); setEditingTs(null); }}
                      onKeyDown={async (e) => { if (e.key === 'Enter') { await editMessage(msg.ts, editText); setEditingTs(null); } }}
                      className="mt-1"
                    />
                  ) : (
                    <div className="relative inline-block bg-gray-100 dark:bg-gray-800 rounded-2xl px-3 py-2 mt-1">
                      <p className="whitespace-pre-line text-sm text-gray-900 dark:text-gray-100">{stripLeadingEmoji(msg.text)}</p>
                      {msg.isOwn && (
                        <div className="absolute right-2 top-1 hidden group-hover:flex gap-1 text-gray-400">
                          <button title="Edit" onClick={() => { setEditingTs(msg.ts); setEditText(msg.text); }}>
                            <Pencil size={14} />
                          </button>
                          <button title="Delete" onClick={() => deleteMessage(msg.ts)}>
                            <Trash size={14} />
                          </button>
                        </div>
                      )}
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {msg.reactions?.map((r) => (
                          <button
                            key={r.name}
                            onClick={() => removeReaction(msg.ts, r.name)}
                            className="bg-gray-200 dark:bg-gray-700 px-2 rounded-full text-xs flex items-center gap-1 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                          >
                            {r.name} {r.count}
                          </button>
                        ))}
                        <button onClick={() => setShowEmojiPicker(msg.ts)} className="text-gray-400 hover:text-gray-600 text-xs">
                          <Smile size={14} />
                        </button>
                      </div>
                      {showEmojiPicker === msg.ts && (
                        <div ref={emojiRef} className="absolute z-10 mt-2">
                          <Picker data={data as any} onEmojiSelect={async (emoji: any) => { await addReaction(msg.ts, emoji.native); setShowEmojiPicker(null); }} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input bar */}
      <div className="border-t p-3 flex items-center gap-2 sticky bottom-0 bg-white dark:bg-gray-900">
        <Button variant="ghost" size="icon" title="Bold" onClick={() => setNewMessage((prev) => prev + '*bold*')}>
          <Bold size={16} />
        </Button>
        <Button variant="ghost" size="icon" title="Italic" onClick={() => setNewMessage((prev) => prev + '_italic_')}>
          <Italic size={16} />
        </Button>
        <Button variant="ghost" size="icon" title="Strikethrough" onClick={() => setNewMessage((prev) => prev + '~strike~')}>
          <Strikethrough size={16} />
        </Button>

        <Button variant="ghost" size="icon" onClick={() => setShowEmojiPicker('input')}>
          <Smile size={18} />
        </Button>
        {showEmojiPicker === 'input' && (
          <div ref={emojiRef} className="absolute bottom-14 left-4 z-10">
            <Picker data={data as any} onEmojiSelect={(emoji: any) => { setNewMessage((prev) => prev + emoji.native); setShowEmojiPicker(null); }} />
          </div>
        )}

        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message…"
          onKeyDown={async (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!newMessage.trim()) return;
              await sendMessage(newMessage);
              setNewMessage('');
            }
          }}
          className="flex-1"
        />
        <Button onClick={async () => { if (!newMessage.trim()) return; await sendMessage(newMessage); setNewMessage(''); }}>Send</Button>
      </div>
    </div>
  );
};

export default StudentGroupChat;


