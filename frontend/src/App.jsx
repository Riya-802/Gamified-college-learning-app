import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import PeersMentors from './components/PeersMentors';
import Chat from './components/Chat';
import ParticleBackground from './components/ParticleBackground';
import { Sparkles, Trophy, Award } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [socket, setSocket] = useState(null);
  
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedChatPeer, setSelectedChatPeer] = useState(null);
  const [levelUpAlert, setLevelUpAlert] = useState(null);

  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  // Restore session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  // Initialize WebSockets upon authentication
  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to Socket.IO backend
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token }
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[Socket] Connected to backend');
    });

    newSocket.on('connect_error', (err) => {
      console.warn('[Socket] Connection failed, using fallback mock caches for real-time.');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const handleAuthSuccess = (authUser, authToken) => {
    setUser(authUser);
    setToken(authToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    if (socket) socket.disconnect();
    setCurrentTab('dashboard');
    setSelectedChatPeer(null);
    setLevelUpAlert(null);
  };

  const handleLevelUp = (oldLevel, newLevel, badgesEarned) => {
    setLevelUpAlert({
      oldLevel,
      newLevel,
      badges: badgesEarned
    });
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            token={token} 
            onUserUpdate={setUser} 
            onLevelUp={handleLevelUp} 
            onLogout={handleLogout}
          />
        );
      case 'leaderboard':
        return <Leaderboard user={user} token={token} />;
      case 'mentorship':
        return (
          <PeersMentors 
            user={user} 
            token={token} 
            setCurrentTab={setCurrentTab} 
            setSelectedChatPeer={setSelectedChatPeer} 
          />
        );
      case 'chat':
        return (
          <Chat 
            user={user} 
            token={token} 
            socket={socket} 
            selectedChatPeer={selectedChatPeer} 
            setSelectedChatPeer={setSelectedChatPeer} 
          />
        );
      default:
        return null;
    }
  };

  if (!user || !token) {
    return (
      <>
        <ParticleBackground />
        <Auth onAuthSuccess={handleAuthSuccess} />
      </>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px 20px' }}>
      <ParticleBackground />
      
      {/* Sleek Header / Navbar */}
      <Navbar 
        user={user} 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        onLogout={handleLogout} 
      />

      {/* Main Page Area */}
      <main style={{ marginTop: '20px' }}>
        {renderContent()}
      </main>

      {/* Premium Level-Up Celebration Modal */}
      {levelUpAlert && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(10, 8, 20, 0.75)',
          backdropFilter: 'blur(12px)',
          zIndex: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel glow-active" style={{
            width: '100%',
            maxWidth: '440px',
            padding: '40px',
            textAlign: 'center',
            borderRadius: '24px',
            border: '2px solid var(--primary)',
            background: 'linear-gradient(135deg, rgba(20, 16, 42, 0.9) 0%, rgba(10, 8, 20, 0.95) 100%)',
            animation: 'slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
          }}>
            <div style={{
              display: 'inline-flex',
              padding: '16px',
              borderRadius: '50%',
              background: 'rgba(139, 92, 246, 0.1)',
              color: 'var(--primary)',
              marginBottom: '24px',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              <Sparkles size={40} className="glow-active" />
            </div>

            <h2 className="text-gradient" style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
              Level Up!
            </h2>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '24px' }}>
              Congratulations! You climbed from level <strong>{levelUpAlert.oldLevel}</strong> to level <strong>{levelUpAlert.newLevel}</strong>!
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '30px'
            }}>
              <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Lvl {levelUpAlert.oldLevel}</div>
              <div style={{ height: '2px', width: '50px', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: '800', 
                color: 'white',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                padding: '4px 14px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
              }}>
                Lvl {levelUpAlert.newLevel}
              </div>
            </div>

            {/* Badges Earned Section */}
            {levelUpAlert.badges && levelUpAlert.badges.length > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '30px'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--accent-orange)', fontWeight: '600', marginBottom: '10px' }}>
                  <Award size={14} />
                  New Badges Unlocked!
                </span>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  {levelUpAlert.badges.map((bName, i) => (
                    <span 
                      key={i} 
                      style={{
                        background: 'rgba(139, 92, 246, 0.08)',
                        border: '1px solid rgba(139, 92, 246, 0.15)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: 'var(--text-primary)'
                      }}
                    >
                      🏆 {bName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setLevelUpAlert(null)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              Continue Climbing
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
