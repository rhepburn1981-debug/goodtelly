import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { FaPlus, FaWhatsapp, FaCheck, FaStar, FaShareAlt, FaBell } from 'react-icons/fa';

// Mocks
const MOCK_FRIENDS = [
    { name: 'Alex', avatar: 'https://i.pravatar.cc/100?u=Alex', picks: 24 },
    { name: 'Sarah', avatar: 'https://i.pravatar.cc/100?u=Sarah', picks: 12 },
    { name: 'James', avatar: 'https://i.pravatar.cc/100?u=James', picks: 8 },
    { name: 'Suzanne', avatar: 'https://i.pravatar.cc/100?u=Suzanne', picks: 42 },
    { name: 'Ryan', avatar: 'https://i.pravatar.cc/100?u=Ryan', picks: 15 }
];

const MOCK_FILMS = [
    { id: 11, title: 'The Lady', year: 2011, genre: 'Drama / History', rating: '8.4', platform: 'NETFLIX', img: '/branding/poster4.png', isAdded: true },
    { id: 12, title: 'The Batman', year: 2022, genre: 'Action / Crime', rating: '8.8', platform: 'PRIME', img: '/branding/poster2.png', isAdded: false },
    { id: 13, title: 'Oppenheimer', year: 2023, genre: 'Drama / History', rating: '9.2', platform: 'APPLE TV+', img: '/branding/poster3.png', isAdded: false },
    { id: 14, title: 'Blade Runner 2049', year: 2017, genre: 'Sci-Fi / Thriller', rating: '8.9', platform: 'PRIME', img: '/branding/poster1.png', isAdded: true }
];

const MOCK_ACTIVITY = [
    { text: "James added The Batman", time: "2 hours ago", icon: "🎬" },
    { text: "Suzanne rated Oppenheimer 4.5 ⭐️", time: "5 hours ago", icon: "⭐" },
    { text: "Ryan started watching Silo", time: "1 day ago", icon: "📺" },
    { text: "Alex recommended The Lady to you", time: "2 days ago", icon: "💬" }
];

// Helper components
const FilterPill = ({ label, active, onClick }) => (
    <div
        className={`filter-pill ${active ? 'active' : 'inactive'}`}
        onClick={onClick}
    >
        {label}
    </div>
);

const TabCard = ({ title, count, active, onClick }) => (
    <button
        className={`tab-card ${active ? 'active' : 'inactive'}`}
        onClick={onClick}
    >
        <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, color: active ? '#fbbf24' : 'rgba(255,255,255,0.4)' }}>
            {title}
        </div>
        <div style={{ fontSize: 40, fontWeight: 900, color: active ? '#fff' : 'rgba(255,255,255,0.3)', lineHeight: 1 }}>
            {count}
        </div>
    </button>
);

const FriendAvatar = ({ friend, active, onClick }) => (
    <div
        className="friend-avatar"
        onClick={onClick}
        style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer',
            opacity: active ? 1 : 0.5, transition: 'all 0.3s ease', minWidth: 80
        }}
    >
        <div style={{
            width: 72, height: 72, borderRadius: '50%', padding: 4,
            background: active ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' : 'transparent',
            boxShadow: active ? '0 10px 25px rgba(251,191,36,0.3)' : 'none',
            transition: 'all 0.3s ease'
        }}>
            <img src={friend.avatar} alt={friend.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #0f0f12' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{friend.name}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>{friend.picks} picks</div>
        </div>
    </div>
);

export default function FriendsDashboard(props) {
    const {
        friends = [],
        friendRequests = [],
        onFriendsUpdated,
        onOpenFilm,
        onAddToList,
        addedIds,
        onTabChange,
        activeTab,
        searchQuery,
        onSearchChange
    } = props;

    const [selectedFriend, setSelectedFriend] = useState(null);
    const [friendList, setFriendList] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    const [activeTabSub, setActiveTabSub] = useState('all');

    // Fetch friend's list when selected
    useEffect(() => {
        if (!selectedFriend) {
            if (friends.length > 0) setSelectedFriend(friends[0].username);
            return;
        }
        setLoadingList(true);
        // We'll need to use a helper or the api client directly
        import('../api/friends').then(m => m.getFriendFilms(selectedFriend))
            .then(list => setFriendList(list || []))
            .catch(() => setFriendList([]))
            .finally(() => setLoadingList(false));
    }, [selectedFriend, friends]);

    const displayFilms = friendList.filter(f => {
        if (activeTabSub === 'watched' && !f.watched) return false;
        if (activeTabSub === 'to_watch' && f.watched) return false;
        return true;
    });

    const handleAcceptRequest = async (username) => {
        const { acceptFriendRequest } = await import('../api/friends');
        try {
            await acceptFriendRequest(username);
            if (onFriendsUpdated) onFriendsUpdated();
        } catch (_) { }
    };

    return (
        <DashboardLayout
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            activeTab={activeTab}
            onTabChange={onTabChange}
        >
            <style dangerouslySetInnerHTML={{
                __html: `
                .glass-card {
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
                }
                .filter-pill {
                    padding: 8px 20px;
                    border-radius: 100px;
                    font-size: 13px;
                    font-weight: 700;
                    white-space: nowrap;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .filter-pill.active {
                    background: rgba(251, 191, 36, 0.15);
                    color: #fbbf24;
                    border: 1px solid rgba(251, 191, 36, 0.5);
                    box-shadow: 0 4px 15px rgba(251, 191, 36, 0.2);
                }
                .filter-pill.inactive {
                    background: rgba(255, 255, 255, 0.02);
                    color: rgba(255, 255, 255, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .tab-card {
                    flex: 1;
                    padding: 32px 24px;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    border: none;
                }
                .tab-card.active {
                    background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%);
                    border: 1px solid rgba(251, 191, 36, 0.4);
                    box-shadow: 0 20px 40px rgba(251, 191, 36, 0.15);
                    transform: translateY(-4px);
                }
                .tab-card.inactive {
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .list-item-card {
                    display: flex;
                    gap: 20px;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }
                .action-btn-green {
                    background: rgba(74, 222, 128, 0.15);
                    color: #4ade80;
                    border: 1px solid rgba(74, 222, 128, 0.3);
                }
            `}} />

            <div style={{ position: 'relative', zIndex: 1, paddingBottom: 100, paddingTop: 24 }} className="fade-in">

                {/* Top Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.5fr) 1fr', gap: 40, marginBottom: 48, alignItems: 'start' }}>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <span style={{ fontSize: 28 }}>👥</span>
                            <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: -1, color: '#fff' }}>
                                Your Friends
                            </h1>
                        </div>

                        <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 16 }} className="no-scrollbar">
                            {friends.map(f => (
                                <FriendAvatar
                                    key={f.username}
                                    friend={{ name: f.display_name || f.username, avatar: `https://i.pravatar.cc/100?u=${f.username}`, picks: 0 }}
                                    active={selectedFriend === f.username}
                                    onClick={() => setSelectedFriend(f.username)}
                                />
                            ))}
                            <div className="friend-avatar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: 0.6, minWidth: 80 }} onClick={() => props.onToast('Sync your contacts to find more friends!')}>
                                <div style={{ width: 72, height: 72, borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                    <FaPlus size={20} color="rgba(255,255,255,0.4)" />
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.4)' }}>Add More</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card invite-card-bg" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', boxSizing: 'border-box' }}>
                        <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 8, letterSpacing: -0.5 }}>Invite Friends</h3>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 24, lineHeight: 1.4 }}>
                            Friends appear here when they join and share their cinematic journey.
                        </p>
                        <button style={{
                            background: 'rgba(37,211,102,0.15)', color: '#4ade80', border: '1px solid rgba(37, 211, 102, 0.4)',
                            padding: '16px', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                        }}>
                            <FaWhatsapp size={20} /> Invite via WhatsApp
                        </button>
                    </div>
                </div>

                {/* Main Area */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.5fr) 1fr', gap: 40, alignItems: 'start' }}>

                    <div>
                        {/* Tabs Section */}
                        <div style={{ display: 'flex', gap: 20, marginBottom: 40 }}>
                            <TabCard title="To Watch" count={friendList.filter(f => !f.watched).length} active={activeTabSub === 'to_watch'} onClick={() => setActiveTabSub('to_watch')} />
                            <TabCard title="Watched" count={friendList.filter(f => f.watched).length} active={activeTabSub === 'watched'} onClick={() => setActiveTabSub('watched')} />
                            <TabCard title="All" count={friendList.length} active={activeTabSub === 'all'} onClick={() => setActiveTabSub('all')} />
                        </div>

                        {loadingList ? (
                            <div style={{ textAlign: 'center', padding: 100, color: 'var(--muted)' }}>Loading...</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                {displayFilms.map(film => (
                                    <div key={film.id} className="list-item-card" onClick={() => onOpenFilm(film)}>
                                        <div style={{ width: 80, height: 120, borderRadius: 10, overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}>
                                            <img src={film.poster_url} alt={film.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{film.title}</h3>
                                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 12px' }}>{film.year}</p>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', paddingLeft: 8 }}>
                                            <button
                                                className={addedIds.includes(film.id) ? 'action-btn-green' : 'action-btn-sec'}
                                                onClick={(e) => { e.stopPropagation(); onAddToList(film); }}
                                                style={{ width: 100, height: 40, borderRadius: 10, cursor: 'pointer', fontSize: 11, fontWeight: 800 }}
                                            >
                                                {addedIds.includes(film.id) ? 'Added' : 'Add'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div style={{ position: 'sticky', top: 32 }}>
                        {friendRequests.length > 0 && (
                            <div className="glass-card" style={{ padding: 28, marginBottom: 24, border: '1px solid var(--gold)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                    <FaBell color="var(--gold)" />
                                    <h4 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>Friend Requests</h4>
                                </div>
                                {friendRequests.map(req => (
                                    <div key={req.username} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                                        <div style={{ fontSize: 14, fontWeight: 700 }}>{req.display_name || req.username}</div>
                                        <button
                                            onClick={() => handleAcceptRequest(req.username)}
                                            style={{ background: 'var(--gold)', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                                        >Accept</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="glass-card" style={{ padding: 28 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                                <span>🔥</span>
                                <h4 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>Activity</h4>
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No recent activity to show.</div>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
