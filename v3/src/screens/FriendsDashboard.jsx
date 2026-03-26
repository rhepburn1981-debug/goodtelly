import React, { useState } from 'react';
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
    const [selectedFriend, setSelectedFriend] = useState('Alex');
    const [activeTab, setActiveTab] = useState('to_watch');
    const [activeGenre, setActiveGenre] = useState('All');
    const [activePlatform, setActivePlatform] = useState('All Services');
    const [activeSort, setActiveSort] = useState('Recently Added');

    const [films, setFilms] = useState(MOCK_FILMS);

    const handleToggleAdd = (id, e) => {
        e.stopPropagation();
        setFilms(films.map(f => f.id === id ? { ...f, isAdded: !f.isAdded } : f));
    };

    return (
        <DashboardLayout
            searchQuery={props.searchQuery}
            onSearchChange={props.onSearchChange}
            activeTab={props.activeTab}
            onTabChange={props.onTabChange}
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
                .filter-pill.inactive:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.05);
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
                    outline: none;
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
                    backdrop-filter: blur(10px);
                }
                .tab-card.inactive:hover {
                    background: rgba(255, 255, 255, 0.03);
                    border-color: rgba(255, 255, 255, 0.1);
                }
                .invite-card-bg {
                    background: radial-gradient(circle at top right, rgba(37, 211, 102, 0.15) 0%, rgba(0, 0, 0, 0.4) 80%);
                    border: 1px solid rgba(37, 211, 102, 0.2);
                    transition: all 0.3s ease;
                }
                .invite-card-bg:hover {
                    box-shadow: 0 20px 50px rgba(37, 211, 102, 0.15);
                    border-color: rgba(37, 211, 102, 0.4);
                    transform: translateY(-2px);
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
                .list-item-card:hover {
                    transform: scale(1.02);
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.15);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                    z-index: 10;
                }
                .list-item-card:hover .hover-glow { opacity: 1 !important; }
                .action-btn-green {
                    background: rgba(74, 222, 128, 0.15);
                    color: #4ade80;
                    border: 1px solid rgba(74, 222, 128, 0.3);
                }
                .action-btn-green:hover { background: rgba(74, 222, 128, 0.25); transform: scale(1.05); }
                .action-btn-sec { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
                .action-btn-sec:hover { background: rgba(255,255,255,0.15); transform: scale(1.05); }
                .friend-avatar:hover { transform: translateY(-4px); opacity: 1 !important; }
                .activity-item:hover { background: rgba(255,255,255,0.05); cursor: pointer; border-radius: 12px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .fade-in { animation: fadeIn 0.6s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
            `}} />

            {/* Cinematic Lighting Backgrounds */}
            <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.05) 0%, transparent 60%)', filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(234, 179, 8, 0.05) 0%, transparent 60%)', filter: 'blur(120px)', zIndex: 0, pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 1300, margin: '0 auto', paddingBottom: 100, paddingTop: 24 }} className="fade-in">

                {/* Top Section Splitted Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.5fr) 1fr', gap: 40, marginBottom: 48, alignItems: 'start' }}>

                    {/* Left: Friends Row */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <span style={{ fontSize: 28, filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' }}>👥</span>
                            <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: -1, color: '#fff' }}>
                                Your Friends
                            </h1>
                        </div>

                        <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 16 }} className="no-scrollbar">
                            {MOCK_FRIENDS.map(f => (
                                <FriendAvatar
                                    key={f.name}
                                    friend={f}
                                    active={selectedFriend === f.name}
                                    onClick={() => setSelectedFriend(f.name)}
                                />
                            ))}
                            <div className="friend-avatar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: 0.6, minWidth: 80 }}>
                                <div style={{ width: 72, height: 72, borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                    <FaPlus size={20} color="rgba(255,255,255,0.4)" />
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.4)' }}>Add More</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Invite Card */}
                    <div className="glass-card invite-card-bg" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', boxSizing: 'border-box' }}>
                        <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 8, letterSpacing: -0.5 }}>Invite Friends to Join Reel</h3>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 24, lineHeight: 1.4, fontWeight: 500 }}>
                            Send them a link — friends appear here when they join and share their cinematic journey.
                        </p>
                        <button style={{
                            background: 'rgba(37,211,102,0.15)', color: '#4ade80', border: '1px solid rgba(37, 211, 102, 0.4)',
                            padding: '16px', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(37,211,102,0.2)'
                        }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.25)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.15)'}>
                            <FaWhatsapp size={20} /> Invite via WhatsApp
                        </button>
                    </div>
                </div>

                {/* Split Bottom Area */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.5fr) 1fr', gap: 40, alignItems: 'start' }}>

                    {/* Left: Main Content (Tabs + Filters + List) */}
                    <div>
                        {/* Tabs Section */}
                        <div style={{ display: 'flex', gap: 20, marginBottom: 40 }}>
                            <TabCard title="To Watch" count={14} active={activeTab === 'to_watch'} onClick={() => setActiveTab('to_watch')} />
                            <TabCard title="Watched" count={8} active={activeTab === 'watched'} onClick={() => setActiveTab('watched')} />
                            <TabCard title="All" count={22} active={activeTab === 'all'} onClick={() => setActiveTab('all')} />
                        </div>

                        {/* Filters Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40, background: 'rgba(255,255,255,0.02)', padding: 24, borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
                                <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginRight: 12, letterSpacing: 1, minWidth: 60 }}>Genre:</div>
                                {['All', 'Drama', 'History', 'Crime', 'Sci-Fi'].map(g => (
                                    <FilterPill key={g} label={g} active={activeGenre === g} onClick={() => setActiveGenre(g)} />
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
                                <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginRight: 12, letterSpacing: 1, minWidth: 60 }}>Platform:</div>
                                {['All Services', 'Netflix', 'Prime', 'Apple TV+'].map(p => (
                                    <FilterPill key={p} label={p} active={activePlatform === p} onClick={() => setActivePlatform(p)} />
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
                                <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginRight: 12, letterSpacing: 1, minWidth: 60 }}>Sort By:</div>
                                {['Recently Added', 'Friends\' Rating', 'A–Z'].map(s => (
                                    <FilterPill key={s} label={s} active={activeSort === s} onClick={() => setActiveSort(s)} />
                                ))}
                            </div>
                        </div>

                        {/* 2-Column Content Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                            {films.map(film => (
                                <div key={film.id} className="list-item-card">
                                    <div className="hover-glow" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, transparent 60%)', opacity: 0, transition: 'opacity 0.3s ease', pointerEvents: 'none', zIndex: 0 }} />

                                    {/* Poster */}
                                    <div style={{ width: 80, height: 120, borderRadius: 10, overflow: 'hidden', flexShrink: 0, zIndex: 1, boxShadow: '0 8px 20px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <img src={film.img} alt={film.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>

                                    {/* Meta */}
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1 }}>
                                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: -0.3 }}>{film.title}</h3>
                                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 12px', fontWeight: 600 }}>{film.genre} &bull; {film.year}</p>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24', fontSize: 13, fontWeight: 800, background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: 8, border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                                                <FaStar size={10} /> {film.rating}
                                            </div>
                                            <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.8)', padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: 8, letterSpacing: 0.5, border: '1px solid rgba(255,255,255,0.05)' }}>
                                                {film.platform}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions vertical split */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', zIndex: 1, paddingLeft: 8, borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                                        <button
                                            className={film.isAdded ? 'action-btn-green' : 'action-btn-sec'}
                                            onClick={(e) => handleToggleAdd(film.id, e)}
                                            style={{ width: 100, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}
                                        >
                                            {film.isAdded ? <FaCheck size={12} /> : <FaPlus size={12} />}
                                            {film.isAdded ? 'Added' : 'Add'}
                                        </button>
                                        <button
                                            className="action-btn-sec"
                                            style={{ width: 100, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.3)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(251, 191, 36, 0.2)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(251, 191, 36, 0.1)'}
                                        >
                                            <FaShareAlt size={12} /> Recommend
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Sidebar: Activity Feed */}
                    <div style={{ position: 'sticky', top: 32 }}>
                        <div className="glass-card" style={{ padding: 28 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                                <span style={{ fontSize: 20 }}>🔥</span>
                                <h4 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: -0.5 }}>Friends Activity</h4>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {MOCK_ACTIVITY.map((activity, idx) => (
                                    <div key={idx} className="activity-item" style={{ display: 'flex', gap: 16, padding: '16px 12px', borderBottom: idx < MOCK_ACTIVITY.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', transition: 'all 0.2s' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                                            {activity.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 6, lineHeight: 1.4 }}>{activity.text}</div>
                                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{activity.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Suggested Friends */}
                        <div className="glass-card" style={{ padding: 28, marginTop: 24 }}>
                            <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 20px', letterSpacing: -0.5 }}>Suggested Friends</h4>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <img src="https://i.pravatar.cc/100?u=Mark" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Mark</div>
                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>12 picks</div>
                                    </div>
                                </div>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                    <FaPlus size={12} />
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
