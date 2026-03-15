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
import { messagesAPI, usersAPI } from '../lib/api';
import { useAuthStore, useMessagesStore } from '../lib/store';
import { useSocketStore } from '../lib/socket';

export default function MessagesPage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { conversationId } = router.query;
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
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

  const [isBlocked, setIsBlocked] = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [quickReplies] = useState([
    { id: 1, en: 'Is this still available?', ar: 'هل لا زال متاح؟' },
    { id: 2, en: "What's your best price?", ar: 'ما هو أفضل سعر؟' },
    { id: 3, en: 'Can I inspect it before buying?', ar: 'هل يمكنني الفحص قبل الشراء؟' },
    { id: 4, en: 'Where are you located?', ar: 'فين موقعك؟' },
    { id: 5, en: 'Is it negotiable?', ar: 'هل السعر قابل للتفاوض؟' },
    { id: 6, en: 'Can you deliver?', ar: 'هل يمكن التوصيل؟' },
  ]);
  const [customQuickReplies, setCustomQuickReplies] = useState(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem('customQuickReplies') || '[]'); } catch { return []; }
    }
    return [];
  });
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showAddCustomReply, setShowAddCustomReply] = useState(false);
  const [newCustomReply, setNewCustomReply] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [isSendingOffer, setIsSendingOffer] = useState(false);

  // Redirect if not authenticated (wait for hydration first)
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/?login=true');
    }
  }, [_hasHydrated, isAuthenticated, router]);

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
        messagesAPI.getConversation(conversationId).then(res => {
          if (res.data?.conversation?.isBlocked !== undefined) {
            setIsBlocked(res.data.conversation.isBlocked);
          }
        }).catch(() => {});
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

  // Lock body scroll when mobile overlay is active
  useEffect(() => {
    if (activeConversation) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
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
    if (conv.isBlocked !== undefined) setIsBlocked(conv.isBlocked);
    messagesAPI.getConversation(conv._id).then(res => {
      if (res.data?.conversation?.isBlocked !== undefined) {
        setIsBlocked(res.data.conversation.isBlocked);
      }
    }).catch(() => {});
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

  const handleBlockUser = async () => {
    if (!activeConversation) return;
    const otherId = activeConversation.otherParticipant?._id;
    if (!otherId) return;
    try {
      if (isBlocked) {
        await usersAPI.unblockUser(otherId);
        setIsBlocked(false);
        toast.success('User unblocked');
      } else {
        await usersAPI.blockUser(otherId);
        setIsBlocked(true);
        toast.success('User blocked');
      }
    } catch {
      toast.error('Failed to update block status');
    }
    setShowBlockMenu(false);
  };

  const handleQuickReply = (text) => {
    setNewMessage(text);
    setShowQuickReplies(false);
  };

  const handleAddCustomReply = () => {
    if (!newCustomReply.trim()) return;
    const updated = [...customQuickReplies, { id: Date.now(), en: newCustomReply.trim(), ar: newCustomReply.trim() }];
    setCustomQuickReplies(updated);
    localStorage.setItem('customQuickReplies', JSON.stringify(updated));
    setNewCustomReply('');
    setShowAddCustomReply(false);
  };

  const handleRemoveCustomReply = (id) => {
    const updated = customQuickReplies.filter(r => r.id !== id);
    setCustomQuickReplies(updated);
    localStorage.setItem('customQuickReplies', JSON.stringify(updated));
  };

  const handleSendOffer = async () => {
    if (!offerAmount || isNaN(offerAmount) || Number(offerAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!activeConversation) return;
    setIsSendingOffer(true);
    try {
      const content = `💰 Offer: ${offerAmount} EGP`;
      const res = await messagesAPI.sendMessage(activeConversation._id, content, 'offer', Number(offerAmount));
      if (res.data.success) {
        const newMsg = res.data.message;
        useMessagesStore.getState().addMessage(newMsg);
        setShowOfferModal(false);
        setOfferAmount('');
      }
    } catch {
      toast.error('Failed to send offer');
    } finally {
      setIsSendingOffer(false);
    }
  };

  if (!_hasHydrated || !isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{t('messages_page.title')} - MySouqify</title>
      </Head>

      {/* ── Mobile full-screen chat (OUTSIDE Layout, truly standalone) ── */}
      {activeConversation && (
        <div className="lg:hidden" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: '#f9fafb' }}>

          {/* Top section: header + listing preview (sticky at top) */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 }}>
            {/* Header */}
            <div style={{ backgroundColor: '#030712', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
              <button onClick={() => { setActiveConversation(null); router.push('/messages', undefined, { shallow: true }); }} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginLeft: -4, display: 'flex' }}>
                <FiArrowLeft size={22} />
              </button>
              <Link href={`/user/${getOtherParticipant(activeConversation)._id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, textDecoration: 'none' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: '#7f1d1d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 17, flexShrink: 0 }}>
                  {getOtherParticipant(activeConversation).name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 15 }}>{getOtherParticipant(activeConversation).name}</p>
                  {activeConversation.listing && <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeConversation.listing.title}</p>}
                </div>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {/* Mobile block menu */}
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowBlockMenu(!showBlockMenu)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#fff', display: 'flex' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                  </button>
                  {showBlockMenu && (
                    <div style={{ position: 'absolute', right: 0, top: '100%', background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, minWidth: 160, overflow: 'hidden' }}>
                      <button onClick={handleBlockUser}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: isBlocked ? '#16a34a' : '#dc2626', textAlign: 'left' }}>
                        {isBlocked ? '✓ Unblock User' : '🚫 Block User'}
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowMenu(!showMenu)} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex' }}>
                    <FiMoreVertical size={20} />
                  </button>
                  {showMenu && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowMenu(false)} />
                      <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, width: 180, backgroundColor: '#fff', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', border: '1px solid #f3f4f6', padding: '4px 0', zIndex: 20 }}>
                        {activeConversation.listing && (
                          <Link href={`/listing/${activeConversation.listing._id}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', fontSize: 13, color: '#374151', textDecoration: 'none' }} onClick={() => setShowMenu(false)}>
                            <FiImage size={15} /> View Listing
                          </Link>
                        )}
                        <button onClick={handleDeleteConversation} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', fontSize: 13, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}>
                          <FiTrash2 size={15} /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Listing Preview */}
            {activeConversation.listing && (
              <Link href={`/listing/${activeConversation.listing._id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', textDecoration: 'none' }}>
                <div style={{ width: 52, height: 52, backgroundColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                  {activeConversation.listing.images?.[0] && <Image src={activeConversation.listing.images[0]} alt={activeConversation.listing.title} fill className="object-cover" />}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontWeight: 500, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14 }}>{activeConversation.listing.title}</p>
                  <p style={{ color: '#dc2626', fontWeight: 700, margin: 0, fontSize: 14 }}>{activeConversation.listing.price?.toLocaleString()} EGP</p>
                </div>
              </Link>
            )}
          </div>

          {/* Mobile blocked banner */}
          {isBlocked && (
            <div style={{ position: 'absolute', top: activeConversation.listing ? 130 : 62, left: 0, right: 0, zIndex: 3, padding: '8px 16px', background: '#fef2f2', borderBottom: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#dc2626' }}>
              🚫 You have blocked this user. <button onClick={handleBlockUser} style={{ marginLeft: 4, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Unblock</button>
            </div>
          )}

          {/* Messages - fills space between header and input */}
          <div
            style={{
              position: 'absolute',
              top: isBlocked ? (activeConversation.listing ? 166 : 98) : (activeConversation.listing ? 130 : 62),
              left: 0,
              right: 0,
              bottom: showQuickReplies ? 160 : 64,
              overflowY: 'auto',
              padding: '12px 16px',
              backgroundColor: '#f9fafb',
            }}
          >
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                  <span style={{ padding: '3px 12px', backgroundColor: '#e5e7eb', color: '#6b7280', fontSize: 11, borderRadius: 999 }}>{formatChatDate(msgs[0].createdAt)}</span>
                </div>
                {msgs.map((message, index) => {
                  const isOwn = message.sender === user?._id || message.sender?._id === user?._id;
                  return (
                    <div key={message._id || index} style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 6, justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                      {!isOwn && (
                        <div style={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                          {getOtherParticipant(activeConversation).name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div style={{ maxWidth: '78%' }}>
                        {message.type === 'offer' ? (
                          <div style={{ background: isOwn ? '#7f1d1d' : '#f9fafb', border: isOwn ? 'none' : '2px solid #dc2626', borderRadius: 12, padding: '10px 14px', minWidth: 160 }}>
                            <div style={{ fontSize: 11, color: isOwn ? '#fca5a5' : '#dc2626', fontWeight: 600, marginBottom: 4 }}>PRICE OFFER</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: isOwn ? 'white' : '#dc2626' }}>
                              {message.offerAmount?.toLocaleString() || ''} EGP
                            </div>
                            <div style={{ fontSize: 11, color: isOwn ? '#fca5a5' : '#6b7280', marginTop: 2 }}>Tap to negotiate</div>
                          </div>
                        ) : (
                          <div style={{ padding: '9px 13px', borderRadius: 18, fontSize: 14, wordBreak: 'break-word', overflowWrap: 'anywhere', backgroundColor: isOwn ? '#dc2626' : '#fff', color: isOwn ? '#fff' : '#111827', borderBottomRightRadius: isOwn ? 4 : 18, borderBottomLeftRadius: isOwn ? 18 : 4, boxShadow: isOwn ? 'none' : '0 1px 3px rgba(0,0,0,0.08)' }}>
                            {message.content}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2, fontSize: 10, color: '#9ca3af', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                          {format(new Date(message.createdAt), 'h:mm a')}
                          {isOwn && (message.read ? <FiCheckCircle size={10} style={{ color: '#f87171' }} /> : <FiCheck size={10} />)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Mobile quick replies panel */}
          {showQuickReplies && (
            <div style={{ position: 'absolute', bottom: 64, left: 0, right: 0, padding: '8px 12px', borderTop: '1px solid #f3f4f6', background: '#fafafa', zIndex: 2 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {[...quickReplies, ...customQuickReplies].map(reply => (
                  <button key={reply.id} onClick={() => handleQuickReply(t('_lang') === 'ar' ? reply.ar : reply.en)}
                    style={{ padding: '5px 12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 20, fontSize: 12, cursor: 'pointer', color: '#374151', whiteSpace: 'nowrap' }}>
                    {t('_lang') === 'ar' ? reply.ar : reply.en}
                    {reply.id > 6 && (
                      <span onClick={(e) => { e.stopPropagation(); handleRemoveCustomReply(reply.id); }}
                        style={{ marginLeft: 4, color: '#9ca3af' }}>×</span>
                    )}
                  </button>
                ))}
                <button onClick={() => setShowAddCustomReply(!showAddCustomReply)}
                  style={{ padding: '5px 12px', background: '#fef2f2', border: '1px dashed #fca5a5', borderRadius: 20, fontSize: 12, cursor: 'pointer', color: '#dc2626' }}>
                  + Add
                </button>
              </div>
              {showAddCustomReply && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <input value={newCustomReply} onChange={e => setNewCustomReply(e.target.value)}
                    placeholder="Type your quick reply..."
                    style={{ flex: 1, padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}
                    onKeyDown={e => e.key === 'Enter' && handleAddCustomReply()} />
                  <button onClick={handleAddCustomReply}
                    style={{ padding: '5px 12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Save</button>
                </div>
              )}
            </div>
          )}

          {/* Input - always pinned at bottom */}
          <form
            onSubmit={handleSendMessage}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 64, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', borderTop: '1px solid #e5e7eb', backgroundColor: '#fff' }}
          >
            {/* Quick replies toggle */}
            <button type="button" onClick={() => setShowQuickReplies(!showQuickReplies)}
              title="Quick Replies"
              style={{ flexShrink: 0, padding: 8, background: showQuickReplies ? '#fef2f2' : 'none', border: 'none', cursor: 'pointer', color: showQuickReplies ? '#dc2626' : '#6b7280', borderRadius: 8, display: 'flex', alignItems: 'center' }}>
              ⚡
            </button>
            {/* Make offer */}
            <button type="button" onClick={() => setShowOfferModal(true)}
              title="Make an Offer"
              disabled={isBlocked}
              style={{ flexShrink: 0, padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', borderRadius: 8, display: 'flex', alignItems: 'center' }}>
              🏷️
            </button>
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isSending || isBlocked}
              style={{ flex: 1, padding: '10px 16px', backgroundColor: '#f3f4f6', borderRadius: 999, fontSize: 14, border: 'none', outline: 'none' }}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: (!newMessage.trim() || isSending) ? 0.4 : 1 }}
            >
              <FiSend size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Offer Price Modal */}
      {showOfferModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: 24, width: '100%', maxWidth: 360, boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: '#111827' }}>💰 Make an Offer</h3>
            {activeConversation?.listing?.price && (
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                Listed price: <strong>{activeConversation.listing.price.toLocaleString()} EGP</strong>
              </p>
            )}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input
                type="number"
                value={offerAmount}
                onChange={e => setOfferAmount(e.target.value)}
                placeholder="Enter your offer..."
                min="1"
                style={{ width: '100%', padding: '10px 48px 10px 12px', border: '2px solid #e5e7eb', borderRadius: 10, fontSize: 16, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#dc2626'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 13 }}>EGP</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setShowOfferModal(false); setOfferAmount(''); }}
                style={{ flex: 1, padding: '10px 0', border: '1px solid #e5e7eb', borderRadius: 10, background: 'white', cursor: 'pointer', fontSize: 14 }}>
                Cancel
              </button>
              <button onClick={handleSendOffer} disabled={isSendingOffer}
                style={{ flex: 1, padding: '10px 0', background: '#dc2626', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, opacity: isSendingOffer ? 0.7 : 1 }}>
                {isSendingOffer ? 'Sending...' : 'Send Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Layout hideFooter>
        <div className="h-[calc(100vh-64px)] lg:h-[calc(100vh-108px)] flex bg-gray-50">
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
                  {/* Block menu */}
                  <div className="relative">
                    <button onClick={() => setShowBlockMenu(!showBlockMenu)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#fff', display: 'flex' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                    </button>
                    {showBlockMenu && (
                      <div style={{ position: 'absolute', right: 0, top: '100%', background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, minWidth: 160, overflow: 'hidden' }}>
                        <button onClick={handleBlockUser}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: isBlocked ? '#16a34a' : '#dc2626', textAlign: 'left' }}>
                          {isBlocked ? '✓ Unblock User' : '🚫 Block User'}
                        </button>
                      </div>
                    )}
                  </div>
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

              {/* Blocked banner */}
              {isBlocked && (
                <div style={{ padding: '8px 16px', background: '#fef2f2', borderBottom: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#dc2626' }}>
                  🚫 You have blocked this user. <button onClick={handleBlockUser} style={{ marginLeft: 4, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Unblock</button>
                </div>
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
                            {message.type === 'offer' ? (
                              <div style={{ background: isOwn ? '#7f1d1d' : '#f9fafb', border: isOwn ? 'none' : '2px solid #dc2626', borderRadius: 12, padding: '10px 14px', minWidth: 160 }}>
                                <div style={{ fontSize: 11, color: isOwn ? '#fca5a5' : '#dc2626', fontWeight: 600, marginBottom: 4 }}>PRICE OFFER</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: isOwn ? 'white' : '#dc2626' }}>
                                  {message.offerAmount?.toLocaleString() || ''} EGP
                                </div>
                                <div style={{ fontSize: 11, color: isOwn ? '#fca5a5' : '#6b7280', marginTop: 2 }}>Tap to negotiate</div>
                              </div>
                            ) : (
                              <div className={`chat-bubble ${isOwn ? 'chat-bubble-sent' : 'chat-bubble-received'}`}>
                                {message.content}
                              </div>
                            )}
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

              {/* Quick replies panel */}
              {showQuickReplies && (
                <div style={{ padding: '8px 12px', borderTop: '1px solid #f3f4f6', background: '#fafafa' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {[...quickReplies, ...customQuickReplies].map(reply => (
                      <button key={reply.id} onClick={() => handleQuickReply(t('_lang') === 'ar' ? reply.ar : reply.en)}
                        style={{ padding: '5px 12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 20, fontSize: 12, cursor: 'pointer', color: '#374151', whiteSpace: 'nowrap' }}
                        onMouseOver={e => e.target.style.borderColor = '#dc2626'}
                        onMouseOut={e => e.target.style.borderColor = '#e5e7eb'}>
                        {t('_lang') === 'ar' ? reply.ar : reply.en}
                        {reply.id > 6 && (
                          <span onClick={(e) => { e.stopPropagation(); handleRemoveCustomReply(reply.id); }}
                            style={{ marginLeft: 4, color: '#9ca3af' }}>×</span>
                        )}
                      </button>
                    ))}
                    <button onClick={() => setShowAddCustomReply(!showAddCustomReply)}
                      style={{ padding: '5px 12px', background: '#fef2f2', border: '1px dashed #fca5a5', borderRadius: 20, fontSize: 12, cursor: 'pointer', color: '#dc2626' }}>
                      + Add
                    </button>
                  </div>
                  {showAddCustomReply && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input value={newCustomReply} onChange={e => setNewCustomReply(e.target.value)}
                        placeholder="Type your quick reply..."
                        style={{ flex: 1, padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}
                        onKeyDown={e => e.key === 'Enter' && handleAddCustomReply()} />
                      <button onClick={handleAddCustomReply}
                        style={{ padding: '5px 12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Save</button>
                    </div>
                  )}
                </div>
              )}

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  {/* Quick replies toggle */}
                  <button type="button" onClick={() => setShowQuickReplies(!showQuickReplies)}
                    title="Quick Replies"
                    style={{ flexShrink: 0, padding: 8, background: showQuickReplies ? '#fef2f2' : 'none', border: 'none', cursor: 'pointer', color: showQuickReplies ? '#dc2626' : '#6b7280', borderRadius: 8, display: 'flex', alignItems: 'center' }}>
                    ⚡
                  </button>
                  {/* Make offer */}
                  <button type="button" onClick={() => setShowOfferModal(true)}
                    title="Make an Offer"
                    disabled={isBlocked}
                    style={{ flexShrink: 0, padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', borderRadius: 8, display: 'flex', alignItems: 'center' }}>
                    🏷️
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('messages_page.type_message')}
                    className="input flex-1"
                    disabled={isSending || isBlocked}
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
    </>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await getI18nProps(locale)),
    },
  };
}
