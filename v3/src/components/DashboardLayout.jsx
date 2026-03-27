import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaBookmark, FaRegCompass, FaUsers, FaSearch, FaEllipsisH, FaWifi, FaBars, FaUser } from 'react-icons/fa';
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

const Header = ({ onToggleSidebar, searchQuery, onSearchChange }) => (
    <header className="dashboard-header">
        <div className="dashboard-logo">
            <FaBars className="hamburger-menu" onClick={onToggleSidebar} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg viewBox="0 0 28 24" width="35" height="29" fill="none" style={{ flexShrink: 0, marginBottom: '1px' }}>
                        <path d="M13.9 19.2a2.25 2.25 0 1 1 0 4.5a2.25 2.25 0 0 1 0-4.5z" fill="#4a9eff"></path>
                        <path d="M8.7 14.1a7.6 7.6 0 0 1 10.4 0" stroke="#4a9eff" strokeWidth="2.4" strokeLinecap="round" fill="none"></path>
                        <path d="M4.6 9.1a13.1 13.1 0 0 1 18.7 0" stroke="#4a9eff" strokeWidth="2.55" strokeLinecap="round" strokeOpacity="0.8" fill="none"></path>
                        <path d="M1.6 4.5a17.8 17.8 0 0 1 24.8 0" stroke="#4a9eff" strokeWidth="2.7" strokeLinecap="round" strokeOpacity="0.5" fill="none"></path>
                    </svg>
                    <div style={{ fontFamily: 'var(--ff-body)', fontSize: '31px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-1.2px', lineHeight: 1 }}>Reel</div>
                </div>
                <div style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.84)', letterSpacing: '0px', paddingLeft: '1px', fontWeight: 500, lineHeight: 1.1 }}>TV recommended by friends</div>
            </div>
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
            <img src="/branding/popcorn.png" alt="Popcorn" style={{
                height: 120, objectFit: 'contain',
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



export default function DashboardLayout({ children, searchQuery, onSearchChange }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
