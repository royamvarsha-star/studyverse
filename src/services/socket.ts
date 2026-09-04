import { io, Socket } from 'socket.io-client';
import { RoomState } from '../types';

class SocketService {
  public socket: Socket | null = null;
  private currentRoomId: string | null = null;

  public connect(): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    // Auto connect to server host
    const url = window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin;
    
    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✨ Connected to StudyVerse Realtime Gateway:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from StudyVerse:', reason);
    });

    return this.socket;
  }

  public joinRoom(roomId: string, user: { id: string; name: string; avatarId: string; frameId: string; badge: string }) {
    this.currentRoomId = roomId;
    if (this.socket) {
      this.socket.emit('join_room', { roomId, user });
    }
  }

  public leaveRoom() {
    if (this.socket && this.currentRoomId) {
      this.socket.emit('leave_room', { roomId: this.currentRoomId });
      this.currentRoomId = null;
    }
  }

  public updateRoomState(partialState: Partial<RoomState>) {
    if (this.socket && this.currentRoomId) {
      this.socket.emit('update_room_state', {
        roomId: this.currentRoomId,
        state: partialState,
      });
    }
  }

  public sendChatMessage(message: { text: string; senderName: string; avatarId: string }) {
    if (this.socket && this.currentRoomId) {
      this.socket.emit('send_chat', {
        roomId: this.currentRoomId,
        message,
      });
    }
  }

  public emitGameAction(gameType: string, action: string, payload: unknown) {
    if (this.socket && this.currentRoomId) {
      this.socket.emit('game_action', {
        roomId: this.currentRoomId,
        gameType,
        action,
        payload,
      });
    }
  }
}

export const socketService = new SocketService();
