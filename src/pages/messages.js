import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiArrowLeft, FiSend, FiMoreVertical, FiTrash2, FiImage, FiCheck, FiCheckCircle, FiPhone } from 'react-icons/fi';
import { format, isToday, isYesterday } from 'date-fns';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { getI18nProps } from '../lib/i18n';
import Layout from '../components/Layout';
import { messagesAPI } from '../lib/api';
import { useAuthStore, useMessagesStore } from '../lib/store';
import { useSocketStore } from '../lib/socket';

export default function MessagesPage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { conversationId } = router.query;
  const { user, isAuthenticated } = useAuthStore();
  const socket = useSocketStore((state) => state.socket);
  const {
    conversations,
    activeConversation,
    messages,
    setActiveConversation,
    fetchConversations,
    fetchConversation,
    sendMessage: storeSendMessage,
    setupSocketListeners
  } = useMessagesStore();

  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'important'
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/?login=true');
    }
  }, [isAuthenticated, router]);

  // Fetch conversations on mount
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      fetchConversations().finally(() => setIsLoading(false));
    }
  }, [isAuthenticated, fetchConversations]);

  // Setup socket listeners
  useEffect(() => {
    if (socket) {
      setupSocketListeners(socket);
    }
  }, [socket, setupSocketListeners]);

  // Set active conversation from URL
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c._id === conversationId);
      if (conv) {
        setActiveConversation(conv);
        fetchConversation(conversationId);
      }
    }
  }, [conversationId, conversations, setActiveConversation, fetchConversation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when conversation changes
  useEffect(() => {
    if (activeConversation) {
      inputRef.current?.focus();
    }
  }, [activeConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || isSending) return;

    setIsSending(true);
    try {
      await storeSendMessage(activeConversation._id, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      toast.error(t('messages_page.failed_to_send'));
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!activeConversation) return;

    if (confirm(t('messages_page.delete_confirmation'))) {
      try {
        await messagesAPI.deleteConversation(activeConversation._id);
        toast.success(t('messages_page.conversation_deleted'));
        setActiveConversation(null);
        fetchConversations();
        router.push('/messages');
      } catch (error) {
        toast.error(t('messages_page.failed_to_delete'));
      }
    }
    setShowMenu(false);
  };

  const selectConversation = (conv) => {
    router.push(`/messages?conversationId=${conv._id}`, undefined, { shallow: true });
    setActiveConversation(conv);
    fetchConversation(conv._id);
  };

  const getOtherParticipant = (conv) => {
    return conv.participants?.find(p => p._id !== user?._id) || {};
  };

  const formatMessageDate = (date) => {
    const d = new Date(date);
    if (isToday(d)) return format(d, 'h:mm a');
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMM d');
  };

  const formatChatDate = (date) => {
    const d = new Date(date);
    if (isToday(d)) return t('messages_page.today');
    if (isYesterday(d)) return t('messages_page.yesterday');
    return format(d, 'MMMM d, yyyy');
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = format(new Date(message.createdAt), 'yyyy-MM-dd');
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout hideFooter>
      <Head>
        <title>{t('messages_page.title')} - MySouqify</title>
      </Head>

      <div className="h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] flex bg-gray-50">
        {/* Conversations List - Desktop always visible, Mobile only when no active */}
        <aside className={`w-full lg:w-80 xl:w-96 bg-white border-r border-gray-100 flex flex-col ${
          activeConversation ? 'hidden lg:flex' : 'flex'
        }`}>
          <div className="p-4 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900">{t('messages_page.title')}</h1>
          </div>

          {/* Quick Filters (Dubizzle style) */}
          <div className="flex gap-2 px-4 py-3 border-b border-gray-100">
            {[['all', 'All'], ['unread', 'Unread'], ['important', 'Important']].map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  filter === key ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex-1 p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 p-3">
                  <div className="w-12 h-12 skeleton rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 skeleton w-1/2" />
                    <div className="h-3 skeleton w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-4 text-center">
              <div>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiImage className="text-gray-400" size={24} />
                </div>
                <p className="text-gray-500 mb-4">{t('messages_page.no_conversations')}</p>
                <Link href="/search" className="btn btn-primary">
                  {t('messages_page.browse_listings')}
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {conversations.filter(conv => {
                if (filter === 'unread') return (conv.unreadCount?.[user?._id] || 0) > 0;
                return true;
              }).map((conv) => {
                const other = getOtherParticipant(conv);
                const unread = conv.unreadCount?.[user?._id] || 0;
                const isActive = activeConversation?._id === conv._id;

                return (
                  <button
                    key={conv._id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors ${
                      isActive ? 'bg-primary-50 border-r-2 border-primary-600' : ''
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                        {other.name?.charAt(0).toUpperCase()}
                      </div>
                      {unread > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`font-medium truncate ${unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                          {other.name}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatMessageDate(conv.updatedAt)}
                        </span>
                      </div>
                      
                      {conv.listing && (
                        <p className="text-xs text-primary-600 truncate mb-1">
                          {t('messages_page.re')}: {conv.listing.title}
                        </p>
                      )}

                      <p className={`text-sm truncate ${unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {conv.lastMessage?.sender === user?._id && (
                          <span className="text-gray-400">{t('messages_page.you')}: </span>
                        )}
                        {conv.lastMessage?.content || t('messages_page.no_messages')}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* Chat Area */}
        <main className={`flex-1 flex flex-col bg-white ${
          activeConversation ? 'flex' : 'hidden lg:flex'
        }`}>
          {activeConversation ? (
            <>
              {/* Chat Header - dark on mobile (Dubizzle style), light on desktop */}
              <header className="flex items-center gap-3 px-4 py-3 lg:border-b lg:border-gray-100 bg-gray-950 lg:bg-white">
                <button
                  onClick={() => { setActiveConversation(null); router.push('/messages', undefined, { shallow: true }); }}
                  className="lg:hidden p-1 -ml-1 text-white lg:text-gray-700"
                >
                  <FiArrowLeft size={22} />
                </button>

                <Link href={`/user/${getOtherParticipant(activeConversation)._id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-primary-700 lg:bg-primary-100 rounded-full flex items-center justify-center text-white lg:text-primary-600 font-bold flex-shrink-0 text-lg">
                    {getOtherParticipant(activeConversation).name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white lg:text-gray-900 truncate">
                      {getOtherParticipant(activeConversation).name}
                    </p>
                    {activeConversation.listing && (
                      <p className="text-xs text-gray-400 lg:text-gray-500 truncate">{activeConversation.listing.title}</p>
                    )}
                  </div>
                </Link>

                <div className="flex items-center gap-1">
                  <button className="lg:hidden p-2 text-white"><FiPhone size={20} /></button>
                  <div className="relative">
                    <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-white lg:text-gray-400 hover:text-gray-300 lg:hover:text-gray-600">
                      <FiMoreVertical size={20} />
                    </button>
                    {showMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-dropdown border border-gray-100 py-1 z-20">
                          {activeConversation.listing && (
                            <Link href={`/listing/${activeConversation.listing._id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowMenu(false)}>
                              <FiImage size={16} /> {t('messages_page.view_listing')}
                            </Link>
                          )}
                          <button onClick={handleDeleteConversation} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                            <FiTrash2 size={16} /> {t('messages_page.delete_conversation')}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </header>

              {/* Listing Preview */}
              {activeConversation.listing && (
                <Link
                  href={`/listing/${activeConversation.listing._id}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 border-b border-gray-100 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-14 h-14 bg-gray-200 rounded-lg overflow-hidden relative flex-shrink-0">
                    {activeConversation.listing.images?.[0] && (
                      <Image
                        src={activeConversation.listing.images[0]}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{activeConversation.listing.title}</p>
                    <p className="text-primary-600 font-bold">{activeConversation.listing.price?.toLocaleString()} EGP</p>
                  </div>
                </Link>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {Object.entries(groupedMessages).map(([date, msgs]) => (
                  <div key={date}>
                    <div className="flex items-center justify-center my-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                        {formatChatDate(msgs[0].createdAt)}
                      </span>
                    </div>

                    {msgs.map((message, index) => {
                      const isOwn = message.sender === user?._id || message.sender?._id === user?._id;
                      const showAvatar = !isOwn && (index === 0 || msgs[index - 1]?.sender !== message.sender);

                      return (
                        <div
                          key={message._id || index}
                          className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isOwn && (
                            <div className={`w-8 h-8 flex-shrink-0 ${showAvatar ? '' : 'invisible'}`}>
                              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-sm font-bold">
                                {getOtherParticipant(activeConversation).name?.charAt(0).toUpperCase()}
                              </div>
                            </div>
                          )}

                          <div className={`max-w-[70%] ${isOwn ? 'order-1' : ''}`}>
                            <div className={`chat-bubble ${isOwn ? 'chat-bubble-sent' : 'chat-bubble-received'}`}>
                              {message.content}
                            </div>
                            <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${isOwn ? 'justify-end' : ''}`}>
                              {format(new Date(message.createdAt), 'h:mm a')}
                              {isOwn && (
                                message.read ? (
                                  <FiCheckCircle size={12} className="text-primary-500" />
                                ) : (
                                  <FiCheck size={12} />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('messages_page.type_message')}
                    className="input flex-1"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="btn btn-primary p-3 disabled:opacity-50"
                  >
                    <FiSend size={18} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiImage className="text-gray-400" size={32} />
                </div>
                <p className="text-gray-500">{t('messages_page.select_conversation')}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await getI18nProps(locale)),
    },
  };
}
