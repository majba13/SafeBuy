'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import { connectSocket, disconnectSocket, joinChatRoom, leaveChatRoom, sendMessage, markMessagesRead } from '@/lib/socket';
import { timeAgo, getAvatarUrl } from '@/lib/utils';
import { Send, ArrowLeft, MessageSquare } from 'lucide-react';
import type { ChatRoom, ChatMessage } from '@/lib/types';
import type { Socket } from 'socket.io-client';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, accessToken } = useAppSelector((s) => s.auth);

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(searchParams.get('room'));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !accessToken) { router.push('/auth/login'); return; }
    const s = connectSocket(accessToken);
    socketRef.current = s;

    s.on('new_message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      setRooms((prev) =>
        prev.map((r) => (r._id === msg.room ? { ...r, lastMessage: msg } : r)),
      );
    });

    apiFetch<ChatRoom[]>('/chat/rooms', { token: accessToken })
      .then((data) => setRooms(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setRoomsLoading(false));

    return () => { disconnectSocket(); };
  }, [user, accessToken, router]);

  useEffect(() => {
    if (!activeRoom || !accessToken) return;
    setMessagesLoading(true);
    joinChatRoom(activeRoom);
    markMessagesRead(activeRoom);

    apiFetch<ChatMessage[]>(`/chat/rooms/${activeRoom}/messages`, { token: accessToken })
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setMessagesLoading(false));

    return () => { leaveChatRoom(activeRoom); };
  }, [activeRoom, accessToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!input.trim() || !activeRoom) return;
    sendMessage(activeRoom, input.trim());
    setInput('');
  }, [input, activeRoom]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const activeRoomInfo = rooms.find((r) => r._id === activeRoom);

  const getOtherParty = (room: ChatRoom) => {
    if (!user) return { name: 'Unknown', avatar: '' };
    const sellerObj = typeof room.seller === 'object' ? room.seller : null;
    const buyerObj = typeof room.buyer === 'object' ? room.buyer : null;
    if (user.role === 'customer') {
      return { name: sellerObj?.shopName ?? 'Seller', avatar: sellerObj?.logo ?? '' };
    }
    return { name: (buyerObj as any)?.name ?? 'Buyer', avatar: (buyerObj as any)?.avatar ?? '' };
  };

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex h-[calc(100vh-160px)]">
          {/* Rooms list */}
          <aside className={`w-80 border-r border-gray-200 flex flex-col flex-shrink-0 ${activeRoom ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare size={18} className="text-orange-500" /> Messages
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {roomsLoading ? (
                <div className="space-y-1 p-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : rooms.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">No conversations yet</div>
              ) : (
                rooms.map((room) => {
                  const other = getOtherParty(room);
                  const last = room.lastMessage;
                  return (
                    <button
                      key={room._id}
                      onClick={() => setActiveRoom(room._id)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                        activeRoom === room._id ? 'bg-orange-50 border-r-2 border-orange-500' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-orange-100 flex items-center justify-center">
                        {other.avatar ? (
                          <Image src={other.avatar} alt={other.name} width={40} height={40} className="object-cover" />
                        ) : (
                          <span className="text-orange-500 font-bold">{other.name[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-gray-900 truncate">{other.name}</span>
                          {last && <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(last.createdAt)}</span>}
                        </div>
                        {last && (
                          <p className="text-xs text-gray-500 truncate">{last.message}</p>
                        )}
                      </div>
                      {room.unreadCount > 0 && (
                        <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {room.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Chat window */}
          <div className={`flex-1 flex flex-col min-w-0 ${!activeRoom ? 'hidden md:flex' : 'flex'}`}>
            {!activeRoom ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                <div className="text-center">
                  <MessageSquare size={48} className="mx-auto mb-3 text-gray-200" />
                  Select a conversation to start chatting
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                  <button
                    onClick={() => setActiveRoom(null)}
                    className="md:hidden text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  {activeRoomInfo && (
                    <span className="font-semibold text-gray-900">
                      {getOtherParty(activeRoomInfo).name}
                    </span>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messagesLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? '' : 'justify-end'}`}>
                          <div className="h-10 w-48 bg-gray-100 rounded-xl animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = typeof msg.sender === 'string'
                        ? msg.sender === user?._id
                        : (msg.sender as any)._id === user?._id;
                      return (
                        <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                              isMe
                                ? 'bg-orange-500 text-white rounded-br-sm'
                                : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                            }`}
                          >
                            <p>{msg.message}</p>
                            <p className={`text-xs mt-0.5 ${isMe ? 'text-orange-200' : 'text-gray-400'}`}>
                              {timeAgo(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-end gap-2 bg-gray-50 rounded-xl px-4 py-2">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message…"
                      rows={1}
                      className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-900 placeholder-gray-400 max-h-32"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
