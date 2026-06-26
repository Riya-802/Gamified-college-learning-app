import React from 'react';
import { Award, Flame, LogOut, MessageSquare, Shield, Trophy, LayoutDashboard } from 'lucide-react';

export default function Navbar({ user, currentTab, setCurrentTab, onLogout }) {
  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: '20px',
      zIndex: 100,
      margin: '20px 0',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: '16px'
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setCurrentTab('dashboard')}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: '800',
          fontSize: '1.2rem',
          boxShadow: '0 4px 10px var(--primary-glow)'
        }}>
          G
        </div>
        <span className="text-gradient" style={{ fontWeight: '800', fontSize: '1.3rem', letterSpacing: '-0.03em' }}>
          Gamified College App
        </span>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`btn ${currentTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </button>

        <button
          onClick={() => setCurrentTab('leaderboard')}
          className={`btn ${currentTab === 'leaderboard' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <Trophy size={16} />
          Leaderboard
        </button>

        <button
          onClick={() => setCurrentTab('mentorship')}
          className={`btn ${currentTab === 'mentorship' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <Shield size={16} />
          Peers & Mentors
        </button>

        <button
          onClick={() => setCurrentTab('chat')}
          className={`btn ${currentTab === 'chat' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <MessageSquare size={16} />
          Chat
        </button>
      </nav>

      {/* User Status Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Streak */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          padding: '6px 12px',
          borderRadius: '10px',
          color: 'var(--accent-orange)',
          fontWeight: '700',
          fontSize: '0.9rem'
        }}>
          <Flame size={16} fill="var(--accent-orange)" />
          <span>{user.streak} Day{user.streak !== 1 && 's'}</span>
        </div>

        {/* Level & XP */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Level</span>
            <span className="level-badge">{user.level}</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {user.xp} XP total
          </span>
        </div>

        {/* Profile Avatar / Logout */}
        <button
          onClick={onLogout}
          className="btn btn-secondary"
          style={{
            padding: '8px',
            borderRadius: '10px',
            color: 'var(--text-muted)'
          }}
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
