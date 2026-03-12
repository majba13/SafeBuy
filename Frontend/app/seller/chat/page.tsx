'use client';
import { useEffect, useState, useRef } from 'react';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import { Send, MessageCircle } from 'lucide-react';

interface Conversation {
  _id: string;
  buyer: { _id: string; name: string; email: string };
  product?: { _id: string; title: string; images: string[] };
  lastMessage?: { content: string; createdAt: string };
  unreadCount: number;
}

interface Message {
  _id: string;
  sender: { _id: string; name: string };
  content: string;
  createdAt: string;
}

export default function SellerChatPage() {
  const { accessToken, user } = useAppSelector((s) => s.auth);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accessToken) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
    const socket = io(apiUrl, { auth: { token: accessToken }, transports: ['websocket'] });
    socketRef.current = socket;
    socket.on('newMessage', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => { socket.disconnect(); };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    apiFetch<Conversation[]>('/chat/conversations', { token: accessToken }).then(setConversations).catch(() => {});
  }, [accessToken]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConversation = (conv: Conversation) => {
    setSelected(conv);
    if (!accessToken) return;
    apiFetch<Message[]>(`/chat/${conv._id}/messages`, { token: accessToken }).then(setMessages).catch(() => {});
    socketRef.current?.emit('joinRoom', conv._id);
  };

  const sendMessage = () => {
    if (!input.trim() || !selected || !socketRef.current) return;
    socketRef.current.emit('sendMessage', { roomId: selected._id, content: input });
    setInput('');
  };

  return (
    <div className="flex h-screen">
      {/* Conversations list */}
      <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><MessageCircle size={18} /> Messages</h2>
        </div>
        {conversations.length === 0 && <p className="text-center text-gray-400 text-sm p-8">No conversations yet.</p>}
        {conversations.map((conv) => (
          <div key={conv._id} onClick={() => openConversation(conv)} className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${selected?._id === conv._id ? 'bg-orange-50' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
              {conv.buyer.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm text-gray-900">{conv.buyer.name}</p>
                {conv.unreadCount > 0 && <span className="w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">{conv.unreadCount}</span>}
              </div>
              {conv.product && <p className="text-xs text-gray-400 truncate">{conv.product.title}</p>}
              {conv.lastMessage && <p className="text-xs text-gray-500 truncate">{conv.lastMessage.content}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Chat view */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selected ? (
          <>
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">{selected.buyer.name.charAt(0)}</div>
              <div>
                <p className="font-medium text-gray-900">{selected.buyer.name}</p>
                {selected.product && <p className="text-xs text-gray-400">{selected.product.title}</p>}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => {
                const isMine = m.sender._id === user?._id;
                return (
                  <div key={m._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${isMine ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                      <p>{m.content}</p>
                      <p className={`text-xs mt-1 ${isMine ? 'text-orange-200' : 'text-gray-400'}`}>{new Date(m.createdAt).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="bg-white border-t border-gray-200 p-4 flex gap-3">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type a message…" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              <button onClick={sendMessage} className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white hover:bg-orange-600">
                <Send size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
              <p>Select a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
