import React, { useEffect, useState } from 'react';
import { Award, CheckCircle, Lock, Star, Terminal, Code2, FolderGit, FileJson, Briefcase, Zap, PlayCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function Dashboard({ user, token, onUserUpdate, onLevelUp, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);
  const [completingVideoId, setCompletingVideoId] = useState(null);
  const [expandedTaskIds, setExpandedTaskIds] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) {
        alert('Your session has expired. Redirecting to login...');
        onLogout();
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setTasks(data);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (taskId) => {
    if (completingId) return;
    setCompletingId(taskId);

    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message);

      const updatedUser = {
        ...user,
        level: data.currentLevel,
        xp: data.currentXp,
        completedTasks: data.completedTasks,
      };

      if (data.badgesEarned && data.badgesEarned.length > 0) {
        fetchProfile();
      } else {
        onUserUpdate(updatedUser);
      }

      if (data.leveledUp) {
        onLevelUp(user.level, data.currentLevel, data.badgesEarned);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setCompletingId(null);
    }
  };

  const handleCompleteVideo = async (taskId, videoId) => {
    if (completingVideoId) return;
    setCompletingVideoId(videoId);

    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}/videos/${videoId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      const updatedUser = {
        ...user,
        level: data.currentLevel,
        xp: data.currentXp,
        completedVideos: data.completedVideos,
        completedTasks: data.completedTasks
      };

      if (data.badgesEarned && data.badgesEarned.length > 0) {
        fetchProfile();
      } else {
        onUserUpdate(updatedUser);
      }

      if (data.leveledUp) {
        onLevelUp(user.level, data.currentLevel, data.badgesEarned);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setCompletingVideoId(null);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        onUserUpdate(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isTaskCompleted = (taskId) => {
    return user.completedTasks?.some(t => {
      const id = typeof t.taskId === 'object' ? t.taskId._id : t.taskId;
      return id === taskId;
    });
  };

  const isVideoCompleted = (videoId) => {
    return user.completedVideos?.some(v => {
      const vId = typeof v.videoId === 'object' ? v.videoId._id : v.videoId;
      return vId && vId.toString() === videoId.toString();
    });
  };

  const toggleExpandTask = (taskId) => {
    setExpandedTaskIds(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const categories = [
    { id: 'basics', title: 'Basics & Foundations', levelRequired: 1, icon: <Terminal size={20} /> },
    { id: 'dsa', title: 'Data Structures & Algorithms', levelRequired: 3, icon: <Code2 size={20} /> },
    { id: 'projects', title: 'Real-world Projects', levelRequired: 5, icon: <FolderGit size={20} /> },
    { id: 'resume', title: 'Placement & Resume Prep', levelRequired: 6, icon: <FileJson size={20} /> },
    { id: 'interviews', title: 'Mock Interviews', levelRequired: 7, icon: <Briefcase size={20} /> }
  ];

  const xpInCurrentLevel = user.xp % 500;
  const progressPercent = (xpInCurrentLevel / 500) * 100;
  const xpNeededForNextLevel = 500 - xpInCurrentLevel;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '30px', animation: 'slideUp 0.4s ease-out' }}>
      
      {/* Roadmap Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Your Learning Journey</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Watch subject tutorials, check off videos to earn XP, and automatically complete milestones!
          </p>
        </div>

        {loading ? (
          <div className="glass-panel flex-center" style={{ height: '300px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Loading roadmap tracks...</span>
          </div>
        ) : (
          categories.map((cat) => {
            const isLocked = user.level < cat.levelRequired;
            const catTasks = tasks.filter(t => t.category === cat.id);

            return (
              <div 
                key={cat.id} 
                className="glass-panel" 
                style={{ 
                  padding: '24px', 
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: isLocked ? 0.75 : 1
                }}
              >
                {/* Lock Overlay */}
                {isLocked && (
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(10, 8, 20, 0.7)',
                    backdropFilter: 'blur(6px)',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      padding: '12px',
                      borderRadius: '50%',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'var(--primary)'
                    }}>
                      <Lock size={24} />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                      {cat.title}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Reaches Level {cat.levelRequired} to Unlock
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="flex-between" style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ color: 'var(--primary)' }}>{cat.icon}</div>
                    <h3 style={{ fontSize: '1.2rem' }}>{cat.title}</h3>
                  </div>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    background: 'rgba(255, 255, 255, 0.04)', 
                    padding: '4px 8px', 
                    borderRadius: '6px',
                    color: 'var(--text-secondary)'
                  }}>
                    {catTasks.filter(t => isTaskCompleted(t._id)).length} / {catTasks.length} Completed
                  </span>
                </div>

                {/* Tasks List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {catTasks.map((task) => {
                    const completed = isTaskCompleted(task._id);
                    const isExpanded = expandedTaskIds.includes(task._id);
                    const taskVideos = task.videos || [];
                    const completedVideosCount = taskVideos.filter(v => isVideoCompleted(v._id)).length;

                    return (
                      <div 
                        key={task._id} 
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: '12px',
                          background: completed ? 'rgba(16, 185, 129, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                          border: `1px solid ${completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)'}`,
                          transition: 'all 0.2s ease',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Task Card Header */}
                        <div 
                          onClick={() => toggleExpandTask(task._id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <CheckCircle 
                              size={20} 
                              style={{ 
                                color: completed ? 'var(--accent-green)' : 'var(--text-muted)',
                                opacity: completed ? 1 : 0.4
                              }} 
                            />
                            <div>
                              <span style={{ 
                                fontWeight: '600', 
                                fontSize: '0.95rem',
                                textDecoration: completed ? 'line-through' : 'none',
                                color: completed ? 'var(--text-muted)' : 'var(--text-primary)'
                              }}>
                                {task.title}
                              </span>
                              <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
                                <span style={{
                                  fontSize: '0.7rem',
                                  color: task.difficulty === 'Easy' ? 'var(--accent-green)' : task.difficulty === 'Medium' ? 'var(--accent-orange)' : 'var(--accent-pink)',
                                  background: 'rgba(255,255,255,0.03)',
                                  padding: '1px 6px',
                                  borderRadius: '4px'
                                }}>
                                  {task.difficulty}
                                </span>
                                {taskVideos.length > 0 && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <PlayCircle size={12} />
                                    {completedVideosCount}/{taskVideos.length} Video Tutorials
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Complete CTA / XP Badge */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={e => e.stopPropagation()}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'rgba(139, 92, 246, 0.05)',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              color: 'var(--primary)',
                              fontSize: '0.85rem',
                              fontWeight: '600'
                            }}>
                              <Zap size={12} fill="var(--primary)" />
                              +{task.xpReward} XP
                            </div>

                            {!completed && taskVideos.length === 0 && (
                              <button
                                onClick={() => handleComplete(task._id)}
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                disabled={completingId === task._id}
                              >
                                {completingId === task._id ? 'Completing...' : 'Mark Done'}
                              </button>
                            )}

                            {taskVideos.length > 0 && (
                              <button
                                onClick={() => toggleExpandTask(task._id)}
                                className="btn btn-secondary"
                                style={{ padding: '6px', borderRadius: '50%' }}
                              >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Collapsible Video Tutorial Playlist */}
                        {isExpanded && taskVideos.length > 0 && (
                          <div style={{
                            padding: '16px',
                            background: 'rgba(0,0,0,0.15)',
                            borderTop: '1px solid rgba(255,255,255,0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                              📹 RECOMMENDED TUTORIALS (All videos must be completed to unlock task rewards)
                            </span>
                            
                            {taskVideos.map((video) => {
                              const videoDone = isVideoCompleted(video._id);

                              return (
                                <div 
                                  key={video._id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.01)'
                                  }}
                                >
                                  <div>
                                    <span style={{ 
                                      fontSize: '0.85rem', 
                                      fontWeight: '500',
                                      color: videoDone ? 'var(--text-muted)' : 'var(--text-primary)',
                                      textDecoration: videoDone ? 'line-through' : 'none'
                                    }}>
                                      {video.title}
                                    </span>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                      Taught by: <strong style={{ color: 'var(--secondary)' }}>{video.instructor}</strong>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button
                                      onClick={() => window.open(video.url, '_blank')}
                                      className="btn btn-secondary"
                                      style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}
                                    >
                                      Watch ↗
                                    </button>

                                    {videoDone ? (
                                      <span style={{ 
                                        fontSize: '0.75rem', 
                                        color: 'var(--accent-green)', 
                                        fontWeight: '600',
                                        padding: '4px 8px',
                                        background: 'rgba(16, 185, 129, 0.05)',
                                        borderRadius: '6px'
                                      }}>
                                        Completed
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => handleCompleteVideo(task._id, video._id)}
                                        className="btn btn-primary"
                                        style={{ 
                                          padding: '4px 10px', 
                                          fontSize: '0.75rem', 
                                          background: 'rgba(139, 92, 246, 0.1)',
                                          border: '1px solid rgba(139, 92, 246, 0.2)',
                                          boxShadow: 'none'
                                        }}
                                        disabled={completingVideoId === video._id}
                                      >
                                        +20 XP Done
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Profile & Badges Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* XP Status Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={18} style={{ color: 'var(--primary)' }} />
            XP Level Tracker
          </h3>
          <div className="flex-between" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Level {user.level}</span>
            <span style={{ color: 'var(--text-secondary)' }}>Level {user.level + 1}</span>
          </div>
          {/* Progress Bar Container */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            height: '10px',
            borderRadius: '5px',
            overflow: 'hidden',
            marginBottom: '10px'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
              width: `${progressPercent}%`,
              height: '100%',
              borderRadius: '5px',
              transition: 'width 0.4s ease'
            }} />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            {xpNeededForNextLevel} XP needed for Level {user.level + 1}
          </p>
        </div>

        {/* Badges Earned */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} style={{ color: 'var(--accent-orange)' }} />
            Earned Badges ({user.badges?.length || 0})
          </h3>
          {user.badges && user.badges.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {user.badges.map((badge, i) => (
                <div 
                  key={i} 
                  className="badge-item animate-slideup" 
                  title={badge.description}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <span className="badge-icon">{badge.icon || '🏆'}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No badges earned yet. Complete tasks to unlock your first badge!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
