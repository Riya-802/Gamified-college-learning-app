import React, { useEffect, useState } from 'react';
import { ShieldAlert, Users, MessageSquare, UserPlus, Check, X, ShieldCheck } from 'lucide-react';

export default function PeersMentors({ user, token, setCurrentTab, setSelectedChatPeer }) {
  const [peers, setPeers] = useState([]);
  const [seniors, setSeniors] = useState([]);
  const [requests, setRequests] = useState({ sent: [], received: [] });
  
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(null); // Holds senior user object if requesting
  const [requestMsg, setRequestMsg] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [peersRes, seniorsRes, reqsRes] = await Promise.all([
        fetch(`${API_URL}/mentors/peers`, { headers }),
        fetch(`${API_URL}/mentors/seniors`, { headers }),
        fetch(`${API_URL}/mentors/requests`, { headers })
      ]);

      const [peersData, seniorsData, reqsData] = await Promise.all([
        peersRes.json(),
        seniorsRes.json(),
        reqsRes.json()
      ]);

      if (peersRes.ok) setPeers(peersData);
      if (seniorsRes.ok) setSeniors(seniorsData);
      if (reqsRes.ok) setRequests(reqsData);
    } catch (err) {
      console.error('Error fetching peer/mentor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!showRequestModal) return;
    setSendingRequest(true);

    try {
      const res = await fetch(`${API_URL}/mentors/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mentorId: showRequestModal._id,
          message: requestMsg
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert('Mentorship request sent successfully!');
      setShowRequestModal(null);
      setRequestMsg('');
      fetchData(); // Refetch requests
    } catch (err) {
      alert(err.message);
    } finally {
      setSendingRequest(false);
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      const res = await fetch(`${API_URL}/mentors/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      fetchData(); // Refetch
    } catch (err) {
      alert(err.message);
    }
  };

  const startChat = (peer) => {
    setSelectedChatPeer(peer);
    setCurrentTab('chat');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', animation: 'slideUp 0.4s ease-out' }}>
      
      {/* Introduction Card */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users style={{ color: 'var(--primary)' }} />
          Peers & Mentorship Network
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Connect with peers at your current learning level or seek guidance from seniors who are at least 2 levels above you.
        </p>
      </div>

      {loading ? (
        <div className="glass-panel flex-center" style={{ height: '300px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Gathering connections...</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          
          {/* Similar Level Peers */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} style={{ color: 'var(--secondary)' }} />
              Peers at Your Level (Lvl {user.level - 1} - {user.level + 1})
            </h3>
            
            {peers.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No matching peers found at your level.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {peers.map((peer) => (
                  <div 
                    key={peer._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.03)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '600' }}>{peer.name}</span>
                        <span className="level-badge">Lvl {peer.level}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{peer.email}</span>
                    </div>

                    <button 
                      onClick={() => startChat(peer)}
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      <MessageSquare size={14} />
                      Chat
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Senior Mentors */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
              Senior Mentors (Lvl {user.level + 2}+)
            </h3>
            
            {seniors.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No seniors registered at Level {user.level + 2} or higher yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {seniors.map((senior) => {
                  const hasPending = requests.sent.some(r => {
                    const id = typeof r.mentor === 'object' ? r.mentor._id : r.mentor;
                    return id === senior._id && r.status === 'pending';
                  });
                  const isAccepted = requests.sent.some(r => {
                    const id = typeof r.mentor === 'object' ? r.mentor._id : r.mentor;
                    return id === senior._id && r.status === 'accepted';
                  });

                  return (
                    <div 
                      key={senior._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid rgba(255,255,255,0.03)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '600' }}>{senior.name}</span>
                          <span className="level-badge" style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)' }}>
                            Lvl {senior.level}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{senior.email}</span>
                      </div>

                      {isAccepted ? (
                        <button 
                          onClick={() => startChat(senior)}
                          className="btn btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          <MessageSquare size={14} />
                          Chat
                        </button>
                      ) : hasPending ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', padding: '6px 12px' }}>
                          Pending
                        </span>
                      ) : (
                        <button 
                          onClick={() => setShowRequestModal(senior)}
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          <UserPlus size={14} />
                          Request
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mentorship Applications Status */}
          <div className="glass-panel" style={{ padding: '24px', gridColumn: 'span 2' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Active Mentorship Applications</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              
              {/* Sent Requests */}
              <div>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>Sent Requests (To Seniors)</h4>
                {requests.sent.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No sent mentorship requests.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {requests.sent.map((req) => (
                      <div 
                        key={req._id}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.01)',
                          border: '1px solid rgba(255,255,255,0.02)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{req.mentor?.name}</span>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>"{req.message}"</p>
                        </div>
                        <span style={{ 
                          fontSize: '0.8rem', 
                          fontWeight: '700',
                          color: req.status === 'accepted' ? 'var(--accent-green)' : req.status === 'rejected' ? 'var(--accent-pink)' : 'var(--accent-orange)' 
                        }}>
                          {req.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Received Requests */}
              <div>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>Received Requests (From Juniors)</h4>
                {requests.received.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No incoming requests received.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {requests.received.map((req) => (
                      <div 
                        key={req._id}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.01)',
                          border: '1px solid rgba(255,255,255,0.02)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                            {req.requester?.name} (Lvl {req.requester?.level})
                          </span>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>"{req.message}"</p>
                        </div>

                        {req.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleUpdateStatus(req._id, 'accepted')}
                              className="btn btn-secondary"
                              style={{ padding: '6px', color: 'var(--accent-green)', background: 'rgba(16, 185, 129, 0.05)' }}
                              title="Accept"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(req._id, 'rejected')}
                              className="btn btn-secondary"
                              style={{ padding: '6px', color: 'var(--accent-pink)', background: 'rgba(236, 72, 153, 0.05)' }}
                              title="Reject"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ 
                            fontSize: '0.8rem', 
                            fontWeight: '700',
                            color: req.status === 'accepted' ? 'var(--accent-green)' : 'var(--text-muted)' 
                          }}>
                            {req.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      )}

      {/* Mentorship Request Message Modal */}
      {showRequestModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(10, 8, 20, 0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '30px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Request Mentorship</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Sending request to <strong>{showRequestModal.name}</strong> (Level {showRequestModal.level}). Write a short note describing what you'd like guidance with.
            </p>
            
            <textarea
              className="glass-input"
              rows={4}
              placeholder="e.g., Hi senior! I saw you reached level 5 and unlocked full stack projects. I am starting React and would love some roadmap tips."
              style={{ width: '100%', resize: 'none', marginBottom: '20px' }}
              value={requestMsg}
              onChange={(e) => setRequestMsg(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setShowRequestModal(null)}
                className="btn btn-secondary"
                disabled={sendingRequest}
              >
                Cancel
              </button>
              <button 
                onClick={handleSendRequest}
                className="btn btn-primary"
                disabled={sendingRequest || !requestMsg.trim()}
              >
                {sendingRequest ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
