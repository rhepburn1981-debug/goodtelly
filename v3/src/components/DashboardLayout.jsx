import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaBookmark, FaRegCompass, FaUsers, FaSearch, FaEllipsisH, FaWifi, FaBars, FaBell, FaCheck, FaPen, FaUserPlus, FaWhatsapp, FaTimes, FaUser } from 'react-icons/fa';
import './DashboardLayout.css';

const SidebarItem = ({ icon: Icon, label, path, active, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`sidebar-item ${active ? 'active' : ''}`}
        >
            <Icon size={20} className="sidebar-icon" />
            <span className="sidebar-label">{label}</span>
        </div>
    );
};

const Header = ({ onToggleSidebar, onToggleActivity, searchQuery, onSearchChange }) => (
    <header className="dashboard-header">
        <div className="dashboard-logo">
            <FaBars className="hamburger-menu" onClick={onToggleSidebar} />
            <FaWifi style={{ color: '#0066FF', fontSize: 36 }} />
            <span style={{ fontFamily: 'var(--ff-poppins)', fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: -1 }}>Reel</span>
        </div>

        <div className="dashboard-search">
            <FaSearch style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16, flexShrink: 0 }} />
            <input
                type="text"
                value={searchQuery || ''}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                placeholder="Search films, TV, directors..."
                style={{
                    flex: 1, background: 'transparent', border: 'none', color: '#fff',
                    fontSize: 15, outline: 'none'
                }}
            />
            <FaEllipsisH style={{ color: 'rgba(255,255,255,0.3)', fontSize: 18, flexShrink: 0, cursor: 'pointer' }} />
        </div>

        <div className="dashboard-user-actions">
            <FaBell className="activity-bell-icon" onClick={onToggleActivity} />
            <img src="/branding/popcorn.png" alt="Popcorn" style={{
                height: 140, objectFit: 'cover', objectPosition: 'top right',
                marginRight: -10, marginTop: 4, transform: 'scale(1.1)',
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
                cursor: 'pointer'
            }} />
        </div>
    </header>
);

const BlurredBackground = () => (
    <div style={{
        position: 'fixed', inset: 0, zIndex: 0, opacity: .6,
        display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 8,
        pointerEvents: 'none', filter: 'blur(3px)'
    }}>
        {Array(60).fill(0).map((_, i) => (
            <img key={i} src={`/branding/poster${(i % 5) + 1}.png`} style={{ width: '100%', opacity: 0.5 }} alt="" />
        ))}
    </div>
);

const ActivityItem = ({ name, action, movie, icon: Icon }) => (
    <div style={{ display: 'flex', gap: 14, marginBottom: 20, alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 44, height: 44 }}>
            <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <img src={`https://i.pravatar.cc/100?u=${name.replace(/\s+/g, '')}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            {Icon && (
                <div style={{
                    position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: '50%',
                    background: '#81b67f', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #141416', color: '#000'
                }}>
                    <Icon size={8} />
                </div>
            )}
        </div>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{name}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{action} <span style={{ color: '#fff', fontWeight: 600 }}>{movie}</span></div>
        </div>
    </div>
);

const RightSidebar = ({ isOpen, onClose }) => (
    <>
        <div className={`dashboard-overlay right-sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
        <aside className={`dashboard-right-sidebar no-scrollbar ${isOpen ? 'open' : ''}`}>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>Activity</h3>
                    <FaTimes className="drawer-close-btn" onClick={onClose} size={28} />
                </div>
                <ActivityItem name="Renée Francois" action="Added" movie="Stranger Things" icon={FaCheck} />
                <ActivityItem name="Róisín Lynn Theodakis" action="Rated" movie="★★★★★" icon={FaPen} />
                <ActivityItem name="Dwayne Gossett Downe" action="Recommended" movie="| Swear" icon={FaCheck} />
            </div>

            <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.6)' }}>Buine Franois</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button style={{
                        background: 'rgba(40, 50, 80, 0.4)', color: '#fff', border: '1px solid rgba(100, 150, 255, 0.2)',
                        borderRadius: 24, padding: '12px', fontSize: 14, fontWeight: 600, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer'
                    }}>
                        <FaUserPlus size={14} /> Share Reel
                    </button>
                    <button style={{
                        background: 'rgba(30, 80, 50, 0.4)', color: '#fff', border: '1px solid rgba(50, 150, 80, 0.3)',
                        borderRadius: 24, padding: '12px', fontSize: 14, fontWeight: 600, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer'
                    }}>
                        <FaWhatsapp size={16} color="#4ade80" /> Invite or Text/WhatsApp
                    </button>
                </div>
            </div>

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 800, background: '#fff', color: '#000', padding: '4px 8px' }}>Top Picks For You</h3>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontWeight: 600 }}>Refresh</span>
                </div>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 16 }} className="no-scrollbar">
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ flexShrink: 0, width: 85, height: 120, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <img src={`/branding/poster${i}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        </div>
                    ))}
                </div>
                <button style={{ width: '100%', padding: '10px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>View All</button>
            </div>

            <div>
                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 800, background: '#fff', color: '#000', padding: '4px 8px' }}>Recently Added</h3>
                </div>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 16 }} className="no-scrollbar">
                    {[4, 3, 1].map(i => (
                        <div key={i} style={{ flexShrink: 0, width: 85, height: 120, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <img src={`/branding/poster${i}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        </div>
                    ))}
                </div>
                <button style={{ width: '100%', padding: '10px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>View All</button>
            </div>
        </aside>
    </>
);

export default function DashboardLayout({ children, searchQuery, onSearchChange }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isActivityOpen, setIsActivityOpen] = useState(false);

    const pathToTab = {
        '/dashboard/home': 'home',
        '/dashboard/watchlist': 'list',
        '/dashboard/discover': 'discover',
        '/dashboard/friends': 'friends',
        '/dashboard/profile': 'profile',
    };
    const activeTab = pathToTab[location.pathname] || 'home';

    function onTabChange(tabId) {
        const tabToPath = {
            home: '/dashboard/home',
            list: '/dashboard/watchlist',
            discover: '/dashboard/discover',
            friends: '/dashboard/friends',
            profile: '/dashboard/profile',
        };
        navigate(tabToPath[tabId] || '/dashboard/home');
    }

    const isProfilePage = location.pathname === '/dashboard/profile';

    return (
        <div style={{ display: 'flex', background: '#020202', minHeight: '100vh', width: '100%', position: 'relative' }}>
            <BlurredBackground />

            <div style={{
                background: 'transparent',
                color: '#fff',
                width: '100%',
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div
                    className={`dashboard-overlay left-sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
                    onClick={() => setIsSidebarOpen(false)}
                />
                <Header
                    searchQuery={searchQuery}
                    onSearchChange={onSearchChange}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    onToggleActivity={isProfilePage ? undefined : () => setIsActivityOpen(!isActivityOpen)}
                />
                <div className="dashboard-content-wrapper">
                    <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                        <SidebarItem
                            icon={FaHome}
                            label="Home"
                            path="home"
                            active={activeTab === 'home'}
                            onClick={() => { onTabChange('home'); setIsSidebarOpen(false); }}
                        />
                        <SidebarItem
                            icon={FaBookmark}
                            label="My Watchlist"
                            path="list"
                            active={activeTab === 'list'}
                            onClick={() => { onTabChange('list'); setIsSidebarOpen(false); }}
                        />
                        <SidebarItem
                            icon={FaRegCompass}
                            label="Discover"
                            path="discover"
                            active={activeTab === 'discover'}
                            onClick={() => { onTabChange('discover'); setIsSidebarOpen(false); }}
                        />
                        <SidebarItem
                            icon={FaUsers}
                            label="Friends"
                            path="friends"
                            active={activeTab === 'friends'}
                            onClick={() => { onTabChange('friends'); setIsSidebarOpen(false); }}
                        />
                        <SidebarItem
                            icon={FaUser}
                            label="Profile"
                            path="profile"
                            active={activeTab === 'profile'}
                            onClick={() => { onTabChange('profile'); setIsSidebarOpen(false); }}
                        />
                    </aside>

                    <div className="dashboard-main-area">
                        <main className="dashboard-main-content">
                            {children}
                        </main>
                    </div>
                </div>
            </div>

            {!isProfilePage && <RightSidebar isOpen={isActivityOpen} onClose={() => setIsActivityOpen(false)} />}

            <style dangerouslySetInnerHTML={{
                __html: `
            @media (min-width: 1024px) {
                nav[style*="position: fixed"][style*="bottom: 0"] {
                    display: none !important;
                }
            }
        `}} />
        </div>
    );
}
