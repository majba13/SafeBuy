import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export function getSocket(token?: string): Socket {
  if (!socket || !socket.connected) {
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(token: string): Socket {
  const s = getSocket(token);
  if (!s.connected) {
    s.auth = { token };
    s.connect();
  }
  return s;
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
  socket = null;
}

export function joinChatRoom(roomId: string): void {
  socket?.emit('join_room', { roomId });
}

export function leaveChatRoom(roomId: string): void {
  socket?.emit('leave_room', { roomId });
}

export function sendMessage(roomId: string, message: string): void {
  socket?.emit('send_message', { roomId, message });
}

export function markMessagesRead(roomId: string): void {
  socket?.emit('mark_read', { roomId });
}

export { socket };
