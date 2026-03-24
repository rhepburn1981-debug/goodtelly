import React from 'react';
import { FaHome, FaBookmark, FaRegCompass, FaUsers, FaSearch, FaEllipsisH, FaWifi } from 'react-icons/fa';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <div
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '12px 24px',
            cursor: 'pointer',
            color: active ? '#fff' : 'rgba(255,255,255,0.6)',
            background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
            borderRadius: 8,
            margin: '4px 0',
            transition: 'all 0.2s ease',
            position: 'relative',
        }}
    >
        {/* {active && (
            <div style={{
                position: 'absolute',
                left: 0,
                top: '20%',
                bottom: '20%',
                width: 3,
                background: '#dbd800ff',
                borderRadius: '0 4px 4px 0'
            }} />
        )} */}
        <Icon size={20} color={active ? '#cca16f' : 'inherit'} />
        <span style={{ fontWeight: active ? 700 : 500, fontSize: 16 }}>{label}</span>
    </div>
);

const Header = () => (
    <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'linear-gradient(to bottom, rgba(5,5,8,0.9) 0%, rgba(5,5,8,0) 100%)',
        height: 80,
        pointerEvents: 'none'
    }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, width: 248, pointerEvents: 'auto' }}>
            <FaWifi style={{ color: '#0066FF', fontSize: 36 }} />
            <span style={{ fontFamily: 'var(--ff-poppins)', fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: -1 }}>Reel</span>
        </div>

        {/* Search Bar */}
        <div style={{
            flex: 1, maxWidth: 740, background: 'rgba(20, 20, 28, 0.65)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
            padding: '0 20px', display: 'flex', alignItems: 'center', height: 44,
            gap: 16, pointerEvents: 'auto'
        }}>
            <FaSearch style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16, flexShrink: 0 }} />
            <input
                type="text"
                placeholder="Search films, TV, directors..."
                style={{
                    flex: 1, background: 'transparent', border: 'none', color: '#fff',
                    fontSize: 15, outline: 'none'
                }}
            />
            <FaEllipsisH style={{ color: 'rgba(255,255,255,0.3)', fontSize: 18, flexShrink: 0, cursor: 'pointer' }} />
        </div>

        {/* Popcorn / Right Actions */}
        <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
            flexShrink: 0, width: 248, height: 80, overflow: 'hidden', pointerEvents: 'auto'
        }}>
            <img src="/branding/popcorn.png" alt="Popcorn" style={{
                height: 140, objectFit: 'cover', objectPosition: 'top right',
                marginRight: -10, marginTop: 4, transform: 'scale(1.1)',
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))'
            }} />
        </div>
    </header>
);

export default function DashboardLayout({ children, activeTab, onTabChange }) {
    return (
        <div style={{
            background: 'transparent',
            color: '#fff',
        }}>
            <Header />
            <div style={{ display: 'flex', marginTop: 80, height: 'calc(100vh - 80px)' }}>
                <aside style={{
                    width: 280,
                    background: 'rgba(15, 15, 18, 0.50)',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    padding: '32px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 90,
                }}>
                    <SidebarItem
                        icon={FaHome}
                        label="Home"
                        active={activeTab === 'home'}
                        onClick={() => onTabChange('home')}
                    />
                    <SidebarItem
                        icon={FaBookmark}
                        label="My Watchlist"
                        active={activeTab === 'watchlist'}
                        onClick={() => onTabChange('watchlist')}
                    />
                    <SidebarItem
                        icon={FaRegCompass}
                        label="Discover"
                        active={activeTab === 'discover'}
                        onClick={() => onTabChange('discover')}
                    />
                    <SidebarItem
                        icon={FaUsers}
                        label="Friends"
                        active={activeTab === 'friends'}
                        onClick={() => onTabChange('friends')}
                    />
                </aside>

                {/* Main Content Area */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    overflow: 'auto',
                }}>
                    <main style={{ flex: 1, padding: '32px 32px 64px' }}>
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
