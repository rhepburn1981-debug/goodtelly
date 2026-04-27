import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaBookmark, FaRegCompass, FaUsers, FaSearch, FaEllipsisH, FaWifi, FaBars, FaUser } from 'react-icons/fa';
import Search from '../../public/branding/search.png'
import './DashboardLayout.css';

const NavItem = ({ label, icon: Icon, active, onClick }) => (
    <div
        onClick={onClick}
        style={{
            cursor: 'pointer',
            padding: '15px 24px',
            borderRadius: '30px',
            background: active ? '#FFFFFF1A' : 'transparent',
            color: active ? '#fff' : '#A09E9F',
            fontSize: '20px',
            fontWeight: active ? '700' : '500',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        }}
    >
        {Icon && <Icon size={24} style={{ color: active ? '#E5B800' : 'inherit' }} />}
        {label}
    </div>
);

const Header = ({ searchQuery, onSearchChange, activeTab, onTabChange }) => (
    <header className="dashboard-header" style={{ background: 'linear-gradient(180deg, #000000 0%, rgba(0, 0, 0, 0) 100%)', height: '114px', display: 'flex', alignItems: 'center', padding: '0 25px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div className="dashboard-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '24px', cursor: 'pointer' }} onClick={() => onTabChange('home')}>
            <img src='/branding/logo.png' style={{ height: '60px' }} />
        </div>

        <nav style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
            <NavItem label="Home" icon={FaHome} active={activeTab === 'home'} onClick={() => onTabChange('home')} />
            <NavItem label="My Watchlist" icon={FaBookmark} active={activeTab === 'list'} onClick={() => onTabChange('list')} />
            <NavItem label="Discover" icon={FaRegCompass} active={activeTab === 'discover'} onClick={() => onTabChange('discover')} />
            <NavItem label="Friends" icon={FaUsers} active={activeTab === 'friends'} onClick={() => onTabChange('friends')} />
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div className="dashboard-search" style={{
                background: '#171717',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '0 25px',
                display: 'flex',
                alignItems: 'center',
                height: '44px',
                width: '300px',
                border: '1px solid #727272'
            }}>
                <input
                    type="text"
                    value={searchQuery || ''}
                    onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                    placeholder="Search films, TV, directors..."
                    style={{
                        flex: 1, background: 'transparent', border: 'none', color: '#fff',
                        fontSize: '20px', outline: 'none'
                    }}
                />
                {/* <FaSearch style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 16 }} /> */}
                <img src={Search} alt='search' />
            </div>

            <div 
                onClick={() => onTabChange('profile')}
                style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', 
                    background: activeTab === 'profile' ? '#FFFFFF1A' : 'rgba(255, 255, 255, 0.1)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    cursor: 'pointer', transition: '0.2s',
                    border: activeTab === 'profile' ? '1px solid #E5B800' : 'none'
                }}
            >
                <FaUser size={24} color={activeTab === 'profile' ? '#E5B800' : "#fff"} />
            </div>
        </div>
    </header>
);

const BlurredBackground = () => (
    <div style={{
        position: 'fixed', inset: 0, zIndex: 0, opacity: 0.5,
        display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 8,
        pointerEvents: 'none', filter: 'blur(6px)'
    }}>
        {Array(60).fill(0).map((_, i) => (
            <img key={i} src={`/branding/poster${(i % 5) + 1}.png`} style={{ width: '100%', opacity: 0.5 }} alt="" />
        ))}
    </div>
);

export default function DashboardLayout({ children, searchQuery, onSearchChange }) {
    const navigate = useNavigate();
    const location = useLocation();

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

    return (
        <div style={{ display: 'flex', background: '#020202', minHeight: '100vh', width: '100%', position: 'relative', flexDirection: 'column' }}>
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
                <Header
                    searchQuery={searchQuery}
                    onSearchChange={onSearchChange}
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                />
                <div className="dashboard-content-wrapper" style={{ marginTop: '114px', display: 'block' }}>
                    <div className="dashboard-main-area">
                        <main className="dashboard-main-content" style={{ padding: '0 40px 20px' }}>
                            {children}
                        </main>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
            @media (max-width: 1024px) {
                .dashboard-header nav { display: none !important; }
                .dashboard-search { width: 40px !important; padding: 0 !important; justify-content: center; }
                .dashboard-search input { display: none; }
            }
        `}} />
        </div>
    );
}
