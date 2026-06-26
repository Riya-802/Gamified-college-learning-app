import React, { useEffect, useState, useRef } from 'react';
import { Send, User, Shield, Flame } from 'lucide-react';

export default function Chat({ user, token, socket, selectedChatPeer, setSelectedChatPeer }) {
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const userId = user.id || user._id;

  // Load chat contacts (peers + accepted mentors/juniors)
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [peersRes, mentorsRes] = await Promise.all([
        fetch(`${API_URL}/mentors/peers`, { headers }),
        fetch(`${API_URL}/mentors/requests`, { headers })
      ]);

      const peers = await peersRes.json();
      const requests = await mentorsRes.json();

      const list = [...peers];

      // Add accepted seniors
      if (requests.sent) {
        requests.sent
          .filter(r => r.status === 'accepted')
          .forEach(r => {
            if (r.mentor && !list.some(x => x._id === r.mentor._id)) {
              list.push(r.mentor);
            }
          });
      }

      // Add accepted juniors
      if (requests.received) {
        requests.received
          .filter(r => r.status === 'accepted')
          .forEach(r => {
            if (r.requester && !list.some(x => x._id === r.requester._id)) {
              list.push(r.requester);
            }
          });
      }

      setContacts(list);

      // Default select the first contact if none was selected
      if (!selectedChatPeer && list.length > 0) {
        setSelectedChatPeer(list[0]);
      }
    } catch (err) {
      console.error('Error loading contacts:', err);
    }
  };

  // Load chat history & join room when target changes
  useEffect(() => {
    if (!selectedChatPeer) return;
    const peerId = selectedChatPeer._id;
    
    // 1. Fetch history
    loadChatHistory(peerId);

    // 2. Join Socket room
    if (socket) {
      socket.emit('chat:join', { userId, peerId });
      console.log(`[Socket Client] Emitted join for ${userId} <-> ${peerId}`);
    }

    setIsPeerTyping(false);
  }, [selectedChatPeer, socket]);

  // Setup Socket listeners for incoming messages and typing alerts
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (message) => {
      // Check if message belongs to the currently active conversation
      const msgSender = message.sender.toString();
      const msgReceiver = message.receiver.toString();
      const currentPeerId = selectedChatPeer?._id;

      if (
        (msgSender === userId && msgReceiver === currentPeerId) ||
        (msgSender === currentPeerId && msgReceiver === userId)
      ) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    };

    const handleIncomingTyping = ({ senderId, isTyping }) => {
      if (selectedChatPeer && senderId === selectedChatPeer._id) {
        setIsPeerTyping(isTyping);
      }
    };

    socket.on('chat:message', handleIncomingMessage);
    socket.on('chat:typing', handleIncomingTyping);

    return () => {
      socket.off('chat:message', handleIncomingMessage);
      socket.off('chat:typing', handleIncomingTyping);
    };
  }, [socket, selectedChatPeer, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async (peerId) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_URL}/mentors/chat/${peerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedChatPeer || !socket) return;

    const payload = {
      senderId: userId,
      receiverId: selectedChatPeer._id,
      content: input
    };

    // Emit event (backend handles DB saving & broadcasts to room)
    socket.emit('chat:send', payload);
    
    // Stop typing indicator on send
    socket.emit('chat:typing', { senderId: userId, receiverId: selectedChatPeer._id, isTyping: false });
    
    setInput('');
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    if (!socket || !selectedChatPeer) return;

    // Send typing alert
    socket.emit('chat:typing', { 
      senderId: userId, 
      receiverId: selectedChatPeer._id, 
      isTyping: true 
    });

    // Debounce: Turn typing off after 1.5s of no keypress
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('chat:typing', { 
        senderId: userId, 
        receiverId: selectedChatPeer._id, 
        isTyping: false 
      });
    }, 1500);
  };

  return (
    <div className="glass-panel" style={{
      display: 'grid',
      gridTemplateColumns: '1fr 3fr',
      height: '75vh',
      overflow: 'hidden',
      borderRadius: '16px',
      animation: 'slideUp 0.4s ease-out'
    }}>
      
      {/* Sidebar - Contact list */}
      <div style={{
        borderRight: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Active Network</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Peers and Mentors</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {contacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No chat contacts yet. Find peers or connect with mentors from the "Peers & Mentors" tab!
            </div>
          ) : (
            contacts.map((c) => {
              const active = selectedChatPeer && selectedChatPeer._id === c._id;
              
              return (
                <div
                  key={c._id}
                  onClick={() => setSelectedChatPeer(c)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: active ? 'var(--primary-glow)' : 'transparent',
                    border: `1px solid ${active ? 'var(--border-focus)' : 'transparent'}`,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    <User size={18} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {c.name}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="level-badge" style={{ padding: '0px 6px', fontSize: '0.7rem' }}>Lvl {c.level}</span>
                      {c.streak > 1 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: '700' }}>
                          <Flame size={10} fill="var(--accent-orange)" />
                          {c.streak}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(0,0,0,0.02)' }}>
        
        {selectedChatPeer ? (
          <>
            {/* Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(0,0,0,0.05)'
            }}>
              <div>
                <h4 style={{ fontWeight: '700', fontSize: '1rem' }}>{selectedChatPeer.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span className="level-badge" style={{ padding: '0px 6px', fontSize: '0.7rem' }}>Level {selectedChatPeer.level}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedChatPeer.email}</span>
                </div>
              </div>
            </div>

            {/* Messages Log */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {loadingHistory ? (
                <div className="flex-center" style={{ height: '100%' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-center" style={{ height: '100%', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No messages yet.</span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', maxWidth: '300px' }}>
                    Type a message below to start sharing ideas and resources in real-time.
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const mine = msg.sender.toString() === userId;
                  
                  return (
                    <div
                      key={msg._id || i}
                      style={{
                        display: 'flex',
                        justifyContent: mine ? 'flex-end' : 'flex-start',
                        width: '100%'
                      }}
                    >
                      <div style={{
                        maxWidth: '65%',
                        padding: '12px 18px',
                        borderRadius: mine ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        background: mine ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${mine ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.03)'}`,
                        boxShadow: mine ? '0 4px 12px rgba(139, 92, 246, 0.2)' : 'none',
                        color: 'var(--text-primary)'
                      }}>
                        <p style={{ fontSize: '0.95rem', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                          {msg.content}
                        </p>
                        <span style={{
                          display: 'block',
                          fontSize: '0.7rem',
                          color: mine ? 'rgba(255, 255, 255, 0.6)' : 'var(--text-muted)',
                          textAlign: 'right',
                          marginTop: '4px'
                        }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              {isPeerTyping && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    padding: '8px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)'
                  }}>
                    {selectedChatPeer.name} is typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSend} style={{
              padding: '20px 24px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              gap: '12px',
              background: 'rgba(0,0,0,0.05)'
            }}>
              <input
                type="text"
                placeholder={`Type a message to ${selectedChatPeer.name}...`}
                className="glass-input"
                value={input}
                onChange={handleInputChange}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0 20px' }}
                disabled={!input.trim()}
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-center" style={{ height: '100%', flexDirection: 'column', gap: '10px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No active chat selected</span>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Select a peer or mentor from the contact sidebar or network to message.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
