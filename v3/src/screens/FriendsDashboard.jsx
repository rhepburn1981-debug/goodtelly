import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
    FaPlay, FaPlus, FaUsers, FaStar, FaChevronRight, FaTimes,
    FaUserPlus, FaWhatsapp, FaShareAlt, FaCircle, FaUsersCog,
    FaVideo, FaFire, FaRegClock, FaEllipsisH, FaBookmark
} from 'react-icons/fa';

// --- Shared Components ---

const GlassPanel = ({ children, style, className }) => (
    <div className={`glass-panel ${className || ''}`} style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(16px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        ...style
    }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'radial-gradient(ellipse at top left, rgba(255,255,255,0.05), transparent 70%)', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon size={20} style={{ color: 'var(--gold-bright)' }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>{title}</h2>
        </div>
        {subtitle && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', fontWeight: 500 }}>{subtitle}</p>}
    </div>
);

// --- Sub-Components ---

const FriendItem = ({ name, status, activity, avatar }) => (
    <div className="friend-list-item" style={{
        display: 'flex', gap: 14, padding: '12px', borderRadius: 12, cursor: 'pointer',
        transition: 'all 0.3s ease', alignItems: 'center', marginBottom: 4,
        background: 'transparent'
    }}>
        <div style={{ position: 'relative' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
                <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{
                position: 'absolute', bottom: 2, right: 2, width: 10, height: 10, borderRadius: '50%',
                background: status === 'online' ? '#4ade80' : '#4b5563', border: '2px solid #000'
            }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {status === 'online' ? `Watching ${activity}` : 'Offline'}
            </div>
        </div>
    </div>
);

const ActivityCard = ({ user, action, movie, poster, timestamp, rating }) => (
    <GlassPanel style={{ marginBottom: 16, padding: '16px' }}>
        <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ width: 80, flexShrink: 0, borderRadius: 8, overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <img src={poster} alt="" style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <img src={`https://i.pravatar.cc/100?u=${user}`} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{user}</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{timestamp}</span>
                </div>
                <div style={{ marginTop: 8, fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                    {action} <span style={{ color: '#fff', fontWeight: 800 }}>{movie}</span>
                </div>
                {rating && (
                    <div style={{ display: 'flex', gap: 2, marginTop: 8 }}>
                        {[...Array(5)].map((_, i) => (
                            <FaStar key={i} size={10} color={i < rating ? 'var(--gold-bright)' : 'rgba(255,255,255,0.1)'} />
                        ))}
                    </div>
                )}
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '6px 14px', fontSize: 12, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FaPlus size={10} /> Watchlist
                    </button>
                    <button style={{ background: 'transparent', border: 'none', fontSize: 12, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>Discuss</button>
                </div>
            </div>
        </div>
    </GlassPanel>
);

const SharedWatchlistCard = ({ name, posters, avatar }) => (
    <div className="hover-card" style={{ flexShrink: 0, width: 240, height: 160, borderRadius: 20, position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, display: 'flex' }}>
            {posters.map((p, i) => (
                <img key={i} src={p} alt="" style={{ flex: 1, objectFit: 'cover', opacity: 0.6, marginLeft: i > 0 ? -40 : 0, filter: 'blur(1px)' }} />
            ))}
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 100%)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, padding: 20, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #fff' }} />
                <span style={{ fontSize: 15, fontWeight: 800, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>{name}'s Picks</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4, fontWeight: 600 }}>{posters.length + 12} titles</div>
        </div>
    </div>
);

const SuggestedFriend = ({ name, interests, avatar }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, padding: '4px' }}>
        <img src={avatar} alt="" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }} />
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{interests}</div>
        </div>
        <button style={{
            background: 'linear-gradient(135deg, #E50914 0%, #B20710 100%)', border: 'none',
            borderRadius: 12, padding: '6px 12px', color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(229, 9, 20, 0.4)'
        }}>Follow</button>
    </div>
);

// --- Watch Party Modal ---
const WatchPartyModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }} onClick={onClose} />
            <GlassPanel style={{ width: '100%', maxWidth: 500, padding: 40, zIndex: 1001, border: '1px solid rgba(255,0,0,0.2)', boxShadow: '0 0 50px rgba(229, 9, 20, 0.2)' }}>
                <SectionHeader icon={FaVideo} title="Start a Watch Party" subtitle="Synchronize your viewing with friends" />

                <div style={{ marginBottom: 32 }}>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>Select a movie to stream together:</p>
                    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 10 }} className="no-scrollbar">
                        {['trend1', 'trend2', 'trend3', 'trend4'].map(img => (
                            <img key={img} src={`/branding/${img}.png`} style={{ width: 80, height: 120, borderRadius: 8, cursor: 'pointer', border: '2px solid transparent' }} alt="" />
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: 32 }}>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>Invite Friends:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                        {[...Array(4)].map((_, i) => (
                            <img key={i} src={`https://i.pravatar.cc/100?u=party${i}`} style={{ width: '100%', aspectRatio: '1/1', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', cursor: 'pointer' }} alt="" />
                        ))}
                        <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <FaPlus size={14} />
                        </div>
                    </div>
                </div>

                <button style={{
                    width: '100%', padding: '16px', borderRadius: 30, background: 'linear-gradient(135deg, #E50914 0%, #B20710 100%)',
                    color: '#fff', fontSize: 16, fontWeight: 900, border: 'none', cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(229, 9, 20, 0.4)'
                }}>
                    Go Live Now
                </button>
            </GlassPanel>
        </div>
    );
};

// --- Main Page ---

export default function FriendsDashboard(props) {
    const [isWatchPartyOpen, setIsWatchPartyOpen] = useState(false);

    return (
        <DashboardLayout searchQuery={props.searchQuery} onSearchChange={props.onSearchChange}>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulseNeon { 0% { box-shadow: 0 0 10px rgba(229, 9, 20, 0.4); } 50% { box-shadow: 0 0 25px rgba(229, 9, 20, 0.8); } 100% { box-shadow: 0 0 10px rgba(229, 9, 20, 0.4); } }
                .watch-party-btn { animation: pulseNeon 2s infinite; }
                .friend-list-item:hover { background: rgba(255,255,255,0.05) !important; transform: scale(1.02); }
                .hover-card { transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
                .hover-card:hover { transform: scale(1.05) translateY(-5px); box-shadow: 0 30px 60px rgba(0,0,0,0.8); z-index: 10; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @media (max-width: 1024px) {
                    .friends-layout-grid { grid-template-columns: 1fr !important; }
                    .friends-sidebar { display: none !important; }
                }
            `}} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', paddingTop: 32, paddingBottom: 100 }}>

                {/* Header */}
                <div style={{ marginBottom: 40, textAlign: 'left' }}>
                    <h1 style={{ fontSize: 42, fontWeight: 900, marginBottom: 8, letterSpacing: -1, background: 'linear-gradient(180deg, #FFFFFF 0%, #A0A0B0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Your Network
                    </h1>
                    <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', fontWeight: 500, letterSpacing: 0.5 }}>
                        Discover what your friends are watching & recommending right now.
                    </p>
                </div>

                {/* Main 3-Column Layout */}
                <div className="friends-layout-grid" style={{ display: 'grid', gridTemplateColumns: '260px 1fr 300px', gap: 32, alignItems: 'start' }}>

                    {/* Left Column: Friends List */}
                    <aside>
                        <SectionHeader icon={FaUsers} title="Friends" subtitle="24 Active Now" />
                        <GlassPanel style={{ padding: '12px' }}>
                            <div style={{ maxHeight: '600px', overflowY: 'auto' }} className="no-scrollbar">
                                <FriendItem name="Alex Rivera" status="online" activity="Fallout" avatar="https://i.pravatar.cc/100?u=Alex" />
                                <FriendItem name="Sarah Chen" status="online" activity="Shōgun" avatar="https://i.pravatar.cc/100?u=Sarah" />
                                <FriendItem name="Mike Johnson" status="offline" activity="None" avatar="https://i.pravatar.cc/100?u=Mike" />
                                <FriendItem name="Elena Costa" status="online" activity="Interstellar" avatar="https://i.pravatar.cc/100?u=Elena" />
                                <FriendItem name="Raj Patel" status="online" activity="Money Heist" avatar="https://i.pravatar.cc/100?u=Raj" />
                                <FriendItem name="Lisa Wong" status="offline" activity="None" avatar="https://i.pravatar.cc/100?u=Lisa" />
                            </div>
                        </GlassPanel>
                    </aside>

                    {/* Middle Column: Activity Feed */}
                    <div style={{ flex: 1 }}>
                        <SectionHeader icon={FaFire} title="Activity Feed" subtitle="Social highlights from your network" />
                        <ActivityCard user="Alex Rivera" action="rated" movie="Inception" poster="/branding/poster1.png" timestamp="2h ago" rating={5} />
                        <ActivityCard user="Sarah Chen" action="added" movie="Dune: Part Two" poster="/branding/trend2.png" timestamp="4h ago" />
                        <ActivityCard user="Elena Costa" action="watched" movie="The Terminator" poster="/branding/terminator_poster.png" timestamp="Yesterday" rating={4} />
                        <ActivityCard user="Raj Patel" action="recommended" movie="Shōgun" poster="/branding/trend3.png" timestamp="2 days ago" />
                    </div>

                    {/* Right Column: Actions & Suggestions */}
                    <aside className="friends-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        <div>
                            <SectionHeader icon={FaUserPlus} title="Connections" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <button style={{ width: '100%', padding: '14px', borderRadius: 16, background: 'linear-gradient(135deg, #E50914 0%, #B20710 100%)', color: '#fff', border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                    <FaShareAlt size={14} /> Invite Friends
                                </button>
                                <button style={{ width: '100%', padding: '14px', borderRadius: 16, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                    <FaWhatsapp size={16} color="#4ade80" /> Text via WhatsApp
                                </button>
                            </div>
                        </div>

                        <div>
                            <SectionHeader icon={FaUsersCog} title="Suggested" subtitle="People you might know" />
                            <SuggestedFriend name="Sam Wilson" interests="Likes Sci-Fi, Action" avatar="https://i.pravatar.cc/100?u=Sam" />
                            <SuggestedFriend name="Chloe Miller" interests="Mutual friend with Alex" avatar="https://i.pravatar.cc/100?u=Chloe" />
                            <SuggestedFriend name="David Park" interests="Followed by Sarah" avatar="https://i.pravatar.cc/100?u=David" />
                        </div>
                    </aside>
                </div>

                {/* Bottom Section: Shared Watchlists */}
                <div style={{ marginTop: 24 }}>
                    <SectionHeader icon={FaBookmark} title="Shared Watchlists" subtitle="Collaborative discovery from your network" />
                    <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 20 }} className="no-scrollbar">
                        <SharedWatchlistCard name="Alex" posters={['/branding/poster1.png', '/branding/trend2.png', '/branding/trend3.png']} avatar="https://i.pravatar.cc/100?u=Alex" />
                        <SharedWatchlistCard name="Sarah" posters={['/branding/trend1.png', '/branding/poster4.png', '/branding/trend4.png']} avatar="https://i.pravatar.cc/100?u=Sarah" />
                        <SharedWatchlistCard name="Elena" posters={['/branding/terminator_poster.png', '/branding/trend5.png', '/branding/poster3.png']} avatar="https://i.pravatar.cc/100?u=Elena" />
                        <SharedWatchlistCard name="Raj" posters={['/branding/trend6.png', '/branding/trend1.png', '/branding/poster2.png']} avatar="https://i.pravatar.cc/100?u=Raj" />
                    </div>
                </div>

                {/* Floating Watch Party Button */}
                <button
                    onClick={() => setIsWatchPartyOpen(true)}
                    className="watch-party-btn"
                    style={{
                        position: 'fixed', bottom: 40, right: 40, width: 70, height: 70, borderRadius: '50%', zIndex: 1000,
                        background: 'linear-gradient(135deg, #E50914 0%, #B20710 100%)', border: 'none',
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, cursor: 'pointer', transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <FaVideo />
                </button>

                <WatchPartyModal isOpen={isWatchPartyOpen} onClose={() => setIsWatchPartyOpen(false)} />

            </div>
        </DashboardLayout>
    );
}
