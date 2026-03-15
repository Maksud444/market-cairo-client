import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { authAPI, messagesAPI } from '../lib/api';

// Auth Store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => {
        if (token) {
          Cookies.set('token', token, { expires: 30 });
        } else {
          Cookies.remove('token');
        }
        set({ token });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authAPI.login({ email, password });
          if (data.success) {
            get().setToken(data.token);
            set({ user: data.user, isAuthenticated: true, isLoading: false });
            return { success: true };
          }
          return { success: false, message: data.message };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            message: error.response?.data?.message || 'Login failed' 
          };
        }
      },

      register: async (name, email, password, phone) => {
        set({ isLoading: true });
        try {
          const { data } = await authAPI.register({ name, email, password, phone });
          if (data.success) {
            get().setToken(data.token);
            set({ user: data.user, isAuthenticated: true, isLoading: false });
            return { success: true };
          }
          return { success: false, message: data.message };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Registration failed'
          };
        }
      },

      googleLogin: async (googleUserData) => {
        set({ isLoading: true });
        try {
          const { data } = await authAPI.googleAuth(googleUserData);

          if (data.success) {
            get().setToken(data.token);
            set({ user: data.user, isAuthenticated: true, isLoading: false });
            return { success: true };
          }
          return { success: false, message: data.message };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Google login failed'
          };
        }
      },

      logout: () => {
        Cookies.remove('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchUser: async () => {
        const token = Cookies.get('token');
        if (!token) {
          set({ isLoading: false });
          return;
        }
        
        set({ isLoading: true });
        try {
          const { data } = await authAPI.getMe();
          if (data.success) {
            set({ user: data.user, isAuthenticated: true, token });
          }
        } catch (error) {
          Cookies.remove('token');
          set({ user: null, token: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },

      updateProfile: async (updates) => {
        try {
          const { data } = await authAPI.updateProfile(updates);
          if (data.success) {
            set({ user: data.user });
            return { success: true };
          }
          return { success: false, message: data.message };
        } catch (error) {
          return { 
            success: false, 
            message: error.response?.data?.message || 'Update failed' 
          };
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state._hasHydrated = true;
      },
    }
  )
);

// Messages Store
export const useMessagesStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  unreadCount: 0,
  isLoading: false,
  typingUsers: new Set(),

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const { data } = await messagesAPI.getConversations();
      if (data.success) {
        set({ conversations: data.conversations });
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchConversation: async (id) => {
    set({ isLoading: true });
    try {
      const { data } = await messagesAPI.getConversation(id);
      if (data.success) {
        set({ 
          activeConversation: data.conversation, 
          messages: data.messages 
        });
      }
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (conversationId, content) => {
    try {
      const { data } = await messagesAPI.sendMessage(conversationId, content);
      if (data.success) {
        set((state) => ({
          messages: [...state.messages, data.message]
        }));
        return { success: true };
      }
      throw new Error('Failed to send message');
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message]
    }));
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await messagesAPI.getUnreadCount();
      if (data.success) {
        set({ unreadCount: data.unreadCount });
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  setActiveConversation: (conversation) => set({ activeConversation: conversation }),
  clearActiveConversation: () => set({ activeConversation: null, messages: [] }),

  /**
   * Setup Socket.io listeners for real-time messaging
   * @param {Socket} socket - Socket.io client instance
   */
  setupSocketListeners: (socket) => {
    if (!socket) return;

    // Listen for new messages
    socket.on('newMessage', ({ conversation, message }) => {
      const { activeConversation, messages, fetchConversations } = get();

      // Update messages if this is the active conversation
      if (activeConversation?._id === conversation) {
        set({ messages: [...messages, message] });
      }

      // Refresh conversations list to update lastMessage and unread count
      fetchConversations();
    });

    // Listen for typing indicators
    socket.on('userTyping', ({ senderId }) => {
      set((state) => ({
        typingUsers: new Set([...state.typingUsers, senderId])
      }));

      // Clear typing indicator after 3 seconds
      setTimeout(() => {
        set((state) => {
          const newTyping = new Set(state.typingUsers);
          newTyping.delete(senderId);
          return { typingUsers: newTyping };
        });
      }, 3000);
    });

    console.log('[MESSAGES] Socket listeners setup complete');
  },

  /**
   * Emit typing event to other user
   * @param {String} receiverId - ID of the user receiving typing indicator
   */
  emitTyping: (receiverId) => {
    // Get socket from socket store
    const socketStore = require('./socket').useSocketStore;
    const { emit } = socketStore.getState();

    if (emit) {
      emit('typing', { receiverId });
    }
  },
}));

// Filters Store
export const useFiltersStore = create((set) => ({
  category: '',
  condition: '',
  location: '',
  priceMin: '',
  priceMax: '',
  search: '',
  sort: 'newest',

  setCategory: (category) => set({ category }),
  setCondition: (condition) => set({ condition }),
  setLocation: (location) => set({ location }),
  setPriceMin: (priceMin) => set({ priceMin }),
  setPriceMax: (priceMax) => set({ priceMax }),
  setSearch: (search) => set({ search }),
  setSort: (sort) => set({ sort }),

  setFilter: (key, value) => set({ [key]: value }),
  setFilters: (filters) => set(filters),

  resetFilters: () => set({
    category: '',
    condition: '',
    location: '',
    priceMin: '',
    priceMax: '',
    search: '',
    sort: 'newest',
  }),
}));

// UI Store
export const useUIStore = create((set) => ({
  isMobileMenuOpen: false,
  isFilterDrawerOpen: false,
  isLoginModalOpen: false,
  isRegisterModalOpen: false,

  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  toggleFilterDrawer: () => set((state) => ({ isFilterDrawerOpen: !state.isFilterDrawerOpen })),
  setFilterDrawerOpen: (isOpen) => set({ isFilterDrawerOpen: isOpen }),
  openLoginModal: () => set({ isLoginModalOpen: true, isRegisterModalOpen: false }),
  openRegisterModal: () => set({ isRegisterModalOpen: true, isLoginModalOpen: false }),
  closeAuthModals: () => set({ isLoginModalOpen: false, isRegisterModalOpen: false }),
}));
