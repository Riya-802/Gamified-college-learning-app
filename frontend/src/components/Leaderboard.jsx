import React, { useEffect, useState } from 'react';
import { Trophy, Award, Flame, Star } from 'lucide-react';

export default function Leaderboard({ user, token }) {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/leaderboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRankings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadgeStyle = (rank) => {
    if (rank === 0) return { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', textShadow: '0 0 8px rgba(245, 158, 11, 0.5)' }; // Gold
    if (rank === 1) return { background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)', color: '#fff' }; // Silver
    if (rank === 2) return { background: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)', color: '#fff' }; // Bronze
    return { background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' };
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'slideUp 0.4s ease-out' }}>
      <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
          <Trophy size={32} style={{ color: 'var(--accent-orange)' }} />
          <h2 style={{ fontSize: '1.8rem' }} className="text-gradient">Leaderboard Rankings</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Compete with college peers! Ranks are calculated based on total cumulative XP earned from learning tasks.
        </p>
      </div>

      {loading ? (
        <div className="glass-panel flex-center" style={{ height: '200px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Loading leaderboard ranks...</span>
        </div>
      ) : rankings.length === 0 ? (
        <div className="glass-panel flex-center" style={{ height: '200px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No rankings found yet. Be the first to register and claim rank 1!</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700' }}>Rank</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700' }}>Student</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700', textAlign: 'center' }}>Level</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700', textAlign: 'center' }}>Streak</th>
                <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '700', textAlign: 'right' }}>XP Points</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((row, idx) => {
                const isCurrentUser = row._id === user.id || row._id === user._id;

                return (
                  <tr 
                    key={row._id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                      background: isCurrentUser ? 'var(--primary-glow)' : 'transparent',
                      transition: 'background 0.2s ease',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrentUser) e.currentTarget.style.background = 'rgba(255,255,255,0.015)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrentUser) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {/* Rank */}
                    <td style={{ padding: '18px 24px' }}>
                      <span style={{
                        display: 'inline-flex',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        ...getRankBadgeStyle(idx)
                      }}>
                        {idx + 1}
                      </span>
                    </td>

                    {/* Student Info */}
                    <td style={{ padding: '18px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '600', color: isCurrentUser ? 'var(--primary-hover)' : 'var(--text-primary)' }}>
                          {row.name} {isCurrentUser && '(You)'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {row.email}
                        </span>
                      </div>
                    </td>

                    {/* Level */}
                    <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                      <span className="level-badge" style={{ padding: '2px 8px', borderRadius: '12px' }}>
                        Lvl {row.level}
                      </span>
                    </td>

                    {/* Streak */}
                    <td style={{ padding: '18px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-orange)', fontWeight: '700', fontSize: '0.9rem' }}>
                        <Flame size={14} fill="var(--accent-orange)" />
                        {row.streak}
                      </div>
                    </td>

                    {/* Total XP */}
                    <td style={{ padding: '18px 24px', textAlign: 'right', fontWeight: '700', color: 'var(--primary)' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                        <Star size={14} fill="var(--primary)" />
                        {row.xp.toLocaleString()} XP
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
