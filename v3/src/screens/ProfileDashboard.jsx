import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { updateMe } from '../api/auth';
import { clearToken } from '../api/client';
import { FaUserEdit, FaSignOutAlt, FaEye, FaEyeSlash, FaStar, FaTrash, FaCheck, FaPlay } from 'react-icons/fa';

// Mocks for visual layout testing
const MOCK_WATCHED = [
    { id: 101, title: 'Inception', year: 2010, genre: 'Sci-Fi / Action', platform: 'MAX', img: '/branding/poster1.png', rating: '9.2' },
    { id: 102, title: 'The Dark Knight', year: 2008, genre: 'Action / Crime', platform: 'MAX', img: '/branding/poster2.png', rating: '9.8' },
    { id: 103, title: 'Shōgun', year: 2024, genre: 'Action / History', platform: 'HULU', img: '/branding/trend3.png', rating: '9.0' },
    { id: 104, title: 'Fallout', year: 2024, genre: 'Sci-Fi / Action', platform: 'PRIME', img: '/branding/trend1.png', rating: '8.7' },
];

const MOCK_TOWATCH = [
    { id: 201, title: 'Dune: Part Two', year: 2024, genre: 'Sci-Fi / Adventure', platform: 'MAX', img: '/branding/trend2.png', rating: '9.0' },
    { id: 202, title: 'Parasite', year: 2019, genre: 'Thriller / Comedy', platform: 'HULU', img: '/branding/poster4.png', rating: '8.6' },
    { id: 203, title: 'Silo', year: 2023, genre: 'Sci-Fi / Thriller', platform: 'APPLE TV+', img: '/branding/trend4.png', rating: '8.1' }
];

const MOCK_FRIENDS = [
    { name: 'Alex', avatar: 'https://i.pravatar.cc/100?u=Alex', picks: 24 },
    { name: 'Sarah', avatar: 'https://i.pravatar.cc/100?u=Sarah', picks: 12 },
    { name: 'Elena', avatar: 'https://i.pravatar.cc/100?u=Elena', picks: 8 },
];

const MOCK_REC_FOR_YOU = [
    { title: 'The Boys', img: '/branding/trend5.png', match: '98% Match' },
    { title: 'Money Heist', img: '/branding/trend6.png', match: '94% Match' },
];

const MOCK_RECENT_ACTIVITY = [
    { text: "You rated The Dark Knight 5⭐️", time: "2 days ago" },
    { text: "You added Dune: Part Two to Watchlist", time: "3 days ago" },
    { text: "You followed Alex", time: "1 week ago" }
];

// --- Helpers ---

const StatCard = ({ value, label }) => (
    <div style={{
        background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, padding: '24px 32px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default', boxShadow: '0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
    }} className="hover-lift-card">
        <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{value}</div>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
    </div>
);

const ProfileMovieCard = ({ film, isDimmed }) => (
    <div className={`profile-movie-card ${isDimmed ? 'dimmed' : ''}`} style={{
        position: 'relative', borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.08)', opacity: isDimmed ? 0.6 : 1,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', background: 'rgba(0,0,0,0.4)'
    }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3' }}>
            <img src={film.img} alt={film.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)', zIndex: 1 }} />

            {/* Visual Badges */}
            {film.platform && (
                <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '6px 10px', borderRadius: 8, fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.1)', zIndex: 2, letterSpacing: 0.5 }}>{film.platform}</div>
            )}
            {film.rating && (
                <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(251, 191, 36, 0.15)', backdropFilter: 'blur(10px)', padding: '6px 10px', borderRadius: 8, fontSize: 11, fontWeight: 900, color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)', display: 'flex', alignItems: 'center', gap: 4, zIndex: 2 }}>
                    <FaStar size={10} /> {film.rating}
                </div>
            )}

            {/* Quick Actions (Hover Overlay) */}
            <div className="movie-quick-actions" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0, transition: 'all 0.3s ease' }}>
                <button style={{ width: '80%', padding: '12px', borderRadius: 10, background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.4)', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(74, 222, 128, 0.3)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(74, 222, 128, 0.2)'}>
                    <FaCheck /> Watched
                </button>
                <button style={{ width: '80%', padding: '12px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}>
                    <FaTrash /> Remove
                </button>
            </div>

            {/* Content Bottom */}
            <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, zIndex: 2 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4, letterSpacing: -0.5 }}>{film.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{film.genre} &bull; {film.year}</div>
            </div>
        </div>
    </div>
);

// --- Main Dashboard ---

export default function ProfileDashboard(props) {
    const {
        currentUser,
        myList = [],
        watchedIds = [],
        friends = [],
        onLogout,
        onToast,
        searchQuery,
        onSearchChange,
        activeTab,
        onTabChange
    } = props;

    const [editing, setEditing] = useState(false);
    const [displayName, setDisplayName] = useState(currentUser?.display_name || '');
    const [saving, setSaving] = useState(false);

    // Filter real data
    const watchedFilms = myList.filter(f => watchedIds.includes(f.id)).slice(0, 10);
    const toWatchFilms = myList.filter(f => !watchedIds.includes(f.id)).slice(0, 10);

    // Derived stats from real data
    const watchedCount = watchedIds.length;
    const totalCount = myList.length;

    async function saveProfile() {
        setSaving(true);
        try {
            await updateMe({ display_name: displayName });
            onToast('Profile updated!');
            setEditing(false);
        } catch (_) {
            onToast('Could not save');
        } finally {
            setSaving(false);
        }
    }

    function handleLogout() {
        clearToken();
        onLogout();
    }

    const nameToDisplay = currentUser?.display_name || currentUser?.username || 'WatchMates User';
    const usernameToDisplay = currentUser?.username || 'watchmatesuser';

    return (
        <DashboardLayout
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            activeTab={activeTab}
            onTabChange={onTabChange}
        >
            <style dangerouslySetInnerHTML={{
                __html: `
                .fade-in { animation: fadeIn 0.6s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }

                .hover-lift-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1) !important; background: rgba(255,255,255,0.05) !important; border-color: rgba(255,255,255,0.15) !important; }

                .profile-movie-card:hover { transform: scale(1.05); box-shadow: 0 25px 50px rgba(0,0,0,0.6); z-index: 10; opacity: 1 !important; border-color: rgba(255,255,255,0.2) !important; }
                .profile-movie-card:hover .movie-quick-actions { opacity: 1 !important; }

                .glass-sidebar-panel { background: rgba(255,255,255,0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 28px; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); transition: all 0.3s ease; }
                .glass-sidebar-panel:hover { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.08); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }

                .friend-list-item:hover { background: rgba(255,255,255,0.05); border-radius: 12px; }
            `}} />

            {/* Cinematic Lighting Backgrounds */}
            <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 60%)', filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.05) 0%, transparent 60%)', filter: 'blur(120px)', zIndex: 0, pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1, paddingBottom: 100, paddingTop: 24 }} className="fade-in">

                {/* --- 1. Hero Profile Header --- */}
                <div style={{ position: 'relative', borderRadius: 32, overflow: 'hidden', marginBottom: 24, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', background: '#0a0a0f' }}>
                    <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'linear-gradient(to right, rgba(10,10,12,0.95) 0%, rgba(10,10,12,0.6) 40%, rgba(10,10,12,0.2) 100%)' }} />
                    <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'linear-gradient(to top, rgba(10,10,12,0.95) 0%, transparent 80%)' }} />

                    <div style={{ position: 'relative', zIndex: 1, padding: '48px 56px', display: 'flex', alignItems: 'center', gap: 48 }}>

                        {/* Avatar Column */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <div style={{ position: 'absolute', inset: -15, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)', filter: 'blur(20px)', zIndex: 0 }} />
                            <div style={{ width: 180, height: 180, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.1)', overflow: 'hidden', position: 'relative', zIndex: 1, background: 'rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {currentUser?.avatar && (currentUser.avatar.startsWith('http') || currentUser.avatar.startsWith('/')) ? (
                                    <img src={currentUser.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : currentUser?.avatar ? (
                                    <div style={{ fontSize: 72 }}>{currentUser.avatar}</div>
                                ) : (
                                    <div style={{ fontSize: 72, opacity: 0.5 }}>👤</div>
                                )}
                            </div>
                        </div>

                        {/* Info Column */}
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                                {editing ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <input
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            autoFocus
                                            style={{
                                                background: 'rgba(255,255,255,0.1)', border: '1px solid var(--gold-bright)',
                                                borderRadius: 12, color: '#fff', padding: '12px 24px', fontSize: 32, fontWeight: 900, outline: 'none', width: '320px', letterSpacing: -1
                                            }}
                                        />
                                        <button onClick={saveProfile} style={{ background: 'var(--gold-bright)', border: 'none', borderRadius: 12, padding: '14px 24px', fontWeight: 900, cursor: 'pointer', color: '#000', fontSize: 16 }}>Save</button>
                                        <button onClick={() => setEditing(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '14px 24px', color: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>Cancel</button>
                                    </div>
                                ) : (
                                    <div>
                                        <h1 style={{ fontSize: 48, fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: -1.5 }}>{nameToDisplay}</h1>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 0.5 }}>@{usernameToDisplay}</span>
                                            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 }}>Member</span>
                                        </div>
                                    </div>
                                )}
                                {!editing && (
                                    <button onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 28px', borderRadius: 100, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}>
                                        <FaUserEdit size={16} /> Edit Profile
                                    </button>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: 24, marginTop: 'auto' }}>
                                <StatCard value={totalCount} label="In List" />
                                <StatCard value={watchedCount} label="Watched" />
                                <StatCard value={friends.length} label="Friends" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 2. Main Desktop Grid --- */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.7fr) 1fr', gap: 40, alignItems: 'start', marginTop: 40 }}>

                    {/* LEFT COLUMN (Main Content) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>

                        {/* Section: Watched */}
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                <span style={{ fontSize: 24 }}>✅</span>
                                <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -0.5 }}>Watched</h2>
                                <div onClick={() => onTabChange('list')} style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>View All</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 24 }}>
                                {watchedFilms.map(film => (
                                    <ProfileMovieCard key={film.id} film={{ ...film, img: film.poster_url }} isDimmed={false} />
                                ))}
                                {watchedFilms.length === 0 && <p style={{ color: 'rgba(255,255,255,0.3)' }}>No films watched yet.</p>}
                            </div>
                        </section>

                        {/* Section: To Watch */}
                        <section>
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 48, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                <span style={{ fontSize: 24 }}>⏳</span>
                                <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -0.5 }}>To Watch</h2>
                                <div onClick={() => onTabChange('list')} style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>View All</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 24 }}>
                                {toWatchFilms.map(film => (
                                    <ProfileMovieCard key={film.id} film={{ ...film, img: film.poster_url }} isDimmed={true} />
                                ))}
                                {toWatchFilms.length === 0 && <p style={{ color: 'rgba(255,255,255,0.3)' }}>Your watchlist is empty.</p>}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN (Sidebar) */}
                    <div style={{ position: 'sticky', top: 32 }}>

                        <div className="glass-sidebar-panel">
                            <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 20px', letterSpacing: -0.5, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 18 }}>👥</span> Your Friends
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {friends.map((f, i) => (
                                    <div key={i} className="friend-list-item" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => onTabChange('friends')}>
                                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{f.username[0].toUpperCase()}</div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{f.display_name || f.username}</div>
                                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>@{f.username}</div>
                                        </div>
                                    </div>
                                ))}
                                {friends.length === 0 && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No friends yet.</p>}
                            </div>
                        </div>

                        <div className="glass-sidebar-panel">
                            <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 20px', letterSpacing: -0.5, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 18 }}>🔥</span> Activity
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>No recent activity to show.</div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%', padding: '18px', borderRadius: 20,
                                background: 'rgba(239, 68, 68, 0.05)', border: '1.5px solid rgba(239, 68, 68, 0.2)',
                                color: '#ef4444', fontSize: 14, fontWeight: 800,
                                cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.transform = 'translateY(0)' }}
                        >
                            <FaSignOutAlt size={16} /> Sign out
                        </button>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
