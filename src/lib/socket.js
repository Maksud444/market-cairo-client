import { io } from 'socket.io-client';
import { create } from 'zustand';
import Cookies from 'js-cookie';

/**
 * Socket.io Store for Real-time Communication
 * Manages WebSocket connection for real-time messaging
 */
export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),

  /**
   * Connect to Socket.io server
   * @param {String} userId - Current user ID
   */
  connect: (userId) => {
    // Derive socket URL from API URL or use default
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ||
                       process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
                       'http://localhost:5000';

    const token = Cookies.get('token');

    // Create socket connection
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Connection established
    socket.on('connect', () => {
      console.log('[SOCKET] Connected:', socket.id);
      set({ isConnected: true });

      // Join with user ID
      if (userId) {
        socket.emit('join', userId);
        console.log('[SOCKET] Joined as user:', userId);
      }
    });

    // Connection error
    socket.on('connect_error', (error) => {
      console.error('[SOCKET] Connection error:', error);
      set({ isConnected: false });
    });

    // Disconnected
    socket.on('disconnect', (reason) => {
      console.log('[SOCKET] Disconnected:', reason);
      set({ isConnected: false });
    });

    // Reconnecting
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[SOCKET] Reconnection attempt:', attemptNumber);
    });

    // Reconnected
    socket.on('reconnect', () => {
      console.log('[SOCKET] Reconnected');
      set({ isConnected: true });

      // Re-join with user ID
      if (userId) {
        socket.emit('join', userId);
      }
    });

    set({ socket });
    return socket;
  },

  /**
   * Disconnect from Socket.io server
   */
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      console.log('[SOCKET] Disconnecting...');
      socket.disconnect();
      set({ socket: null, isConnected: false, onlineUsers: new Set() });
    }
  },

  /**
   * Emit event to server
   * @param {String} event - Event name
   * @param {Object} data - Event data
   */
  emit: (event, data) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn('[SOCKET] Cannot emit - not connected');
    }
  },

  /**
   * Add user to online users set
   * @param {String} userId - User ID
   */
  setUserOnline: (userId) => {
    set((state) => ({
      onlineUsers: new Set([...state.onlineUsers, userId])
    }));
  },

  /**
   * Remove user from online users set
   * @param {String} userId - User ID
   */
  setUserOffline: (userId) => {
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      newOnlineUsers.delete(userId);
      return { onlineUsers: newOnlineUsers };
    });
  },

  /**
   * Check if user is online
   * @param {String} userId - User ID
   * @returns {Boolean}
   */
  isUserOnline: (userId) => {
    const { onlineUsers } = get();
    return onlineUsers.has(userId);
  }
}));
