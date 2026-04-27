import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getFriendFilms, logFriendView } from '../api/friends';
import { FaPlus, FaWhatsapp, FaCheck, FaStar, FaShareAlt, FaBell, FaFilter } from 'react-icons/fa';
import { MdMovieCreation } from "react-icons/md";
import { TiStarFullOutline } from "react-icons/ti";
import { FiPlus } from 'react-icons/fi';

// Mock fallback removed in favor of props.friends

// Mock films removed in favor of dynamic fetching

const GENRES = ['All', 'Action', 'Adventure', 'Fantasy', 'Comedy', 'Crime', 'Thriller', 'Drama'];
const SORTS = ['All', 'Recently Added', 'Friends Rolling', 'A-Z'];
const SERVICES = [
    { name: 'All', color: '#fff' },
    { name: 'Netflix', logo: '/branding/netflix.png' },
    { name: 'Prime', logo: '/branding/prime.png' },
    { name: 'Disney+', logo: '/branding/disney.png' },
    { name: 'NOW', logo: '/branding/now_logo.png' },
    { name: 'Apple TV+', logo: '/branding/I-tv.png' },
    { name: 'Paramount+', logo: '/branding/paramountplus.png' },
    { name: 'Discovery+', logo: '/branding/discovery.png' }
];

// Helper components
const Pill = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{
        padding: '12px 25px',
        borderRadius: 100,
        background: active ? '#E0C36A33' : '#000',
        border: '1px solid #FFFFFF33',
        color: active ? '#fff' : '#A09E9F',
        fontSize: 16,
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
        lineHeight: 1.4,
    }}>
        {label}
    </button>
);

const ServicePill = ({ label, logo, active, onClick }) => (
    <button onClick={onClick} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 25px',
        borderRadius: 100,
        background: active ? '#E0C36A33' : '#000',
        border: '1px solid #FFFFFF33',
        color: active ? '#fff' : '#A09E9F',
        fontSize: 16,
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
        lineHeight: 1.4,
    }}>
        {logo ? (
            <img src={logo} alt={label} style={{ height: '15px', width: 'auto', objectFit: 'contain' }} />
        ) : null}
        {label}
    </button>
);

const FriendFilmCard = ({ film, isAdded, onAdd, onClick }) => {
    const providers = film.providers || [];
    const mainProvider = providers.find(p => p.provider_name.toLowerCase().includes('netflix')) ||
                         providers.find(p => p.provider_name.toLowerCase().includes('amazon')) ||
                         providers.find(p => p.provider_name.toLowerCase().includes('apple')) ||
                         providers.find(p => p.provider_name.toLowerCase().includes('disney')) ||
                         providers[0];

    const getProviderLogo = (name) => {
        const norm = name?.toLowerCase() || '';
        if (norm.includes('netflix')) return '/branding/netflix.png';
        if (norm.includes('amazon') || norm.includes('prime')) return '/branding/prime.png';
        if (norm.includes('apple')) return '/branding/I-tv.png';
        if (norm.includes('disney')) return '/branding/disney.png';
        if (norm.includes('now')) return '/branding/now_logo.png';
        if (norm.includes('hbo')) return '/branding/hbo.png';
        return null;
    };

    return (
        <div className="wl-card">
            <div style={{ position: 'relative', cursor: 'pointer', margin: '-1px', borderRadius: '20px 20px 0 0', overflow: 'hidden' }} onClick={onClick}>
                <img
                    src={film.poster_url || film.img || '/branding/poster1.png'}
                    alt={film.title}
                    style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
                />
                {mainProvider && getProviderLogo(mainProvider.provider_name) && (
                    <div style={{
                        position: 'absolute', bottom: 10, right: 10,
                        background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 2
                    }}>
                        <img src={getProviderLogo(mainProvider.provider_name)} alt="" style={{ height: '14px', width: 'auto', objectFit: 'contain' }} />
                    </div>
                )}
            </div>
            <div style={{ padding: '14px 16px 16px' }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>
                    {film.title}
                </div>
                <div style={{ fontSize: 14, color: '#727272', marginBottom: '14px' }}>
                    {film.year}{film.genre ? ` · ${film.genre}` : ''}
                </div>
                <button
                    className="wl-seen-btn static-seen"
                    onClick={(e) => { e.stopPropagation(); if (!isAdded) onAdd(film); }}
                    style={{ background: isAdded ? 'rgba(255,255,255,0.1)' : '#16A34A', color: '#fff', cursor: isAdded ? 'default' : 'pointer', border: isAdded ? '1px solid rgba(255,255,255,0.1)' : 'none' }}
                    disabled={isAdded}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        {isAdded ? <FaCheck /> : null}
                        <span>{isAdded ? 'In Watchlist' : '"Tap" if you\'ve seen it'}</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

const FriendAvatar = ({ friend, active, onClick }) => (
    <div
        className="friend-avatar"
        onClick={onClick}
        style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer',
            opacity: active ? 1 : 0.6, transition: 'all 0.3s ease', minWidth: 74
        }}
    >
        <div style={{
            width: 58, height: 58, borderRadius: '50%',
            background: active ? 'var(--gold)' : 'rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, border: active ? '2px solid #fff' : 'none',
            transition: '0.2s', boxShadow: active ? '0 0 15px rgba(241, 196, 15, 0.4)' : 'none',
            overflow: 'hidden', fontWeight: 'bold', color: '#fff'
        }}>
            {friend.avatar ? (
                <img src={friend.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                (friend.name || '?').charAt(0).toUpperCase()
            )}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#A09E9F', maxWidth: 74, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{friend.name || '?'}</div>
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
        onSearchChange,
        onToast,
        currentUser
    } = props;

    const [selectedFriend, setSelectedFriend] = useState(null);
    const [friendList, setFriendList] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    const [activeTabSub, setActiveTabSub] = useState('all');
    const [activeGenre, setActiveGenre] = useState('All');

    useEffect(() => {
        if (!selectedFriend && friends?.length > 0) {
            setSelectedFriend(friends[0].username);
        }
    }, [friends, selectedFriend]);
    const [activeSort, setActiveSort] = useState('All');
    const [activeService, setActiveService] = useState('All');
    const [isListVisible, setIsListVisible] = useState(true);

    // Dynamic Genre list based on friend's films
    const dynamicGenres = useMemo(() => {
        const set = new Set(['All']);
        friendList.forEach(f => { if (f.genre) set.add(f.genre); });
        return Array.from(set);
    }, [friendList]);

    // Derived counts
    const toWatchCount = useMemo(() => friendList.filter(f => !addedIds?.includes(f.id)).length, [friendList, addedIds]);
    const watchedCount = useMemo(() => friendList.filter(f => addedIds?.includes(f.id)).length, [friendList, addedIds]);
    const allCount = friendList.length;

    // Fetch friend's films and log view
    useEffect(() => {
        if (!selectedFriend) return;

        async function fetchFriendData() {
            setLoadingList(true);
            try {
                logFriendView(selectedFriend);
                const films = await getFriendFilms(selectedFriend);
                setFriendList(films || []);
            } catch (err) {
                console.error("Failed to fetch friend films:", err);
                setFriendList([]);
            } finally {
                setLoadingList(false);
            }
        }
        fetchFriendData();
    }, [selectedFriend]);

    // Handle initial selection if friends load later
    useEffect(() => {
        if (!selectedFriend && friends.length > 0) {
            setSelectedFriend(friends[0].username);
        }
    }, [friends, selectedFriend]);

    const displayFilms = friendList.filter(f => {
        if (activeTabSub === 'watched' && !addedIds?.includes(f.id)) return false;
        if (activeTabSub === 'to_watch' && addedIds?.includes(f.id)) return false;
        if (activeGenre !== 'All' && !(f.genre || '').includes(activeGenre)) return false;
        if (activeService !== 'All' && !(f.services || []).includes(activeService)) return false;
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
                .wl-root { display: flex; min-height: calc(100vh - 114px); gap: 24px }

                .wl-sidebar {
                    width: 395px;
                    flex-shrink: 0;
                    background: rgba(10,10,10,0.92);
                    border: 1px solid rgba(255,255,255,0.07);
                    padding: 20px;
                    position: sticky;
                    top: 134px;
                    height: calc(100vh - 154px);
                    overflow-y: auto;
                    scrollbar-width: none;
                    border-radius: 20px;
                }
                .wl-sidebar::-webkit-scrollbar { display: none; }

                .wl-stat { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: background 0.2s; }
                .wl-stat:hover { background: rgba(255,255,255,0.05); }
                .wl-stat.active {
                    background: #E0C36A33;
                    border: 3px solid #E0C36A;
                    border-radius: 30px;
                    padding: 9px 16px;
                }

                .wl-grid-area { flex: 1; overflow-y: auto; }
                .wl-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(284px, 1fr));
                    gap: 25px;
                }

                .wl-card {
                    background: #000;
                    border-radius: 20px;
                    overflow: hidden;
                    border: 1px solid #FFFFFF33;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.25s;
                }
                .wl-card:hover { box-shadow: 0 20px 50px rgba(0,0,0,0.75); border-color: rgba(255,255,255,0.2); transform: translateY(-5px); }

                .wl-seen-btn {
                    width: 100%; padding: 10px 0; border-radius: 999px; border: 1px solid #FFFFFF33;
                    background: #008633; color: #fff; font-weight: 600; font-size: 16px;
                    cursor: pointer; transition: all 0.2s;
                }
                .wl-seen-btn:hover { background: #16a34a; }
                .wl-seen-btn.watched { background: #E0C36A; color: #2D2715; border-color: transparent; }

                .wl-remove-btn {
                    width: 100%; padding: 10px 0; border-radius: 999px; border: none;
                    background: #B1060F33; color: #fff; font-weight: 700;
                    font-size: 16px; cursor: pointer; transition: all 0.2s;
                    border: 1px solid #FFFFFF33;
                }
                .wl-remove-btn:hover { background: rgba(239,68,68,0.22); color: #ef4444; }

                .wl-toggle { width: 40px; height: 22px; border-radius: 11px; position: relative; cursor: pointer; transition: background 0.3s; flex-shrink: 0; }
                .wl-toggle-knob { width: 30px; height: 30px; border-radius: 50%; background: #E0C36A; position: absolute; top: -4px; transition: left 0.3s; box-shadow: 0 1px 4px rgba(0,0,0,0.5); }

                .fade-in { animation: fadeIn 0.5s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />

            <div className="wl-root fade-in" style={{ paddingTop: '20px' }}>

                {/* ══ SIDEBAR ══ */}
                <aside className="wl-sidebar">
                    {/* Visibility toggle */}
                    <div style={{
                        background: '#000',
                        border: '1px solid #FFFFFF33',
                        borderRadius: 20, padding: '20px 30px',
                        marginBottom: 18,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>List visible to friends.</div>
                            <div style={{ fontSize: 16, color: '#A09E9F' }}>Friends can see your picks.</div>
                        </div>
                        <div
                            className="wl-toggle"
                            style={{ background: isListVisible ? '#fbbf24' : '#fff' }}
                            onClick={() => setIsListVisible(v => !v)}
                        >
                            <div className="wl-toggle-knob" style={{ left: isListVisible ? 21 : -10 }} />
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ marginBottom: 26, display: 'flex', flexDirection: 'column', gap: 20, background: '#000', border: ' 1px solid #FFFFFF33', borderRadius: 20, padding: 20 }}>
                        {[
                            { key: 'to_watch', count: toWatchCount, label: 'To Watch' },
                            { key: 'watched', count: watchedCount, label: 'Watched' },
                            { key: 'all', count: allCount, label: 'All' },
                        ].map(({ key, count, label }) => (
                            <div
                                key={key}
                                className={`wl-stat${activeTabSub === key ? ' active' : ''}`}
                                onClick={() => setActiveTabSub(key)}
                            >
                                <span style={{ fontSize: 20, color: activeTabSub === key ? '#fbbf24' : '#fff', fontWeight: activeTabSub === key ? '700' : '400' }}>
                                    {String(count).padStart(2, '0')}
                                </span>
                                <span style={{ fontSize: 20, color: activeTabSub === key ? '#fbbf24' : '#fff', fontWeight: activeTabSub === key ? '700' : '400' }}>
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Filters Section */}
                    <div style={{ marginBottom: 22, display: 'flex', flexDirection: 'row', justifyContent: 'start', alignItems: 'start', gap: 10, padding: '20px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '12px 25px' }}>
                            <FaFilter size={24} color="#E0C36A" />
                            <span style={{ fontSize: 16, fontWeight: 700, color: '#E0C36A' }}>Filters:</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                            {SORTS.map(s => (
                                <Pill key={s} label={s} active={activeSort === s} onClick={() => setActiveSort(s)} />
                            ))}
                        </div>
                    </div>

                    {/* Genre Section */}
                    <div style={{ marginBottom: 2, display: 'flex', flexDirection: 'row', justifyContent: 'start', alignItems: 'start', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '12px 25px' }}>
                            <MdMovieCreation size={24} color="#E0C36A" />
                            <span style={{ fontSize: 16, fontWeight: 700, color: '#E0C36A' }}>Genre:</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {dynamicGenres.map(g => (
                                <Pill key={g} label={g} active={activeGenre === g} onClick={() => setActiveGenre(g)} />
                            ))}
                        </div>
                    </div>

                    {/* Services Section */}
                    <div style={{ marginTop: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15, paddingLeft: '10px' }}>
                            <MdMovieCreation size={24} color="#E0C36A" />
                            <span style={{ fontSize: '20px', fontWeight: 600, color: '#E0C36A' }}>Services:</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                            {SERVICES.map(s => (
                                <ServicePill
                                    key={s.name}
                                    label={s.name}
                                    logo={s.logo}
                                    active={activeService === s.name}
                                    onClick={() => setActiveService(s.name)}
                                />
                            ))}
                        </div>
                    </div>
                </aside>

                {/* ══ MAIN AREA ══ */}
                <div className="wl-grid-area">
                    {/* Header: Friends Scroller + Invite banner */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, background: '#000', border: ' 1px solid ##FFFFFF33', borderRadius: 20, padding: '20px 40px' }}>
                        <div style={{ display: 'flex', gap: 22, overflowX: 'auto' }} className="no-scrollbar">
                            <div className="friend-avatar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => props.onToast('Sync your contacts!')}>
                                <div style={{ width: 70, height: 70, borderRadius: '50%', border: '1px solid #E0C36A', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                    <FiPlus size={30} color="#E0C36A" />
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>Add New</div>
                            </div>
                            {friends.map(f => (
                                <FriendAvatar
                                    key={f.username}
                                    friend={{ name: f.display_name || f.username, avatar: f.avatar }}
                                    active={selectedFriend === f.username}
                                    onClick={() => setSelectedFriend(f.username)}
                                />
                            ))}
                        </div>

                        <div
                            onClick={() => {
                                const inviteLink = `https://goodtelly-production.up.railway.app/invite?from=${currentUser?.username || 'user'}`;
                                const text = encodeURIComponent("Join me on WatchMates to find the best TV & films! " + inviteLink);
                                window.open(`https://wa.me/?text=${text}`, '_blank');
                            }}
                            style={{
                                border: '1px solid #16A34A',
                                borderRadius: 20,
                                padding: '20px 30px',
                                display: 'flex', alignItems: 'center', gap: 40,
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaWhatsapp size={42} color="#12CE5A" />
                            </div>
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>Invite friends to join WatchMates</div>
                                <div style={{ fontSize: 14, color: '#A09E9F', fontWeight: 400 }}>Invite friends via WhatsApp.</div>
                            </div>
                        </div>
                    </div>

                    {/* Grid Area */}
                    {loadingList ? (
                        <div style={{ textAlign: 'center', padding: '100px 0', color: 'rgba(255,255,255,0.3)' }}>
                            <div className="loading-spinner"></div>
                            <p style={{ marginTop: 20, fontSize: 18 }}>Loading friends' picks...</p>
                        </div>
                    ) : (
                        <div className="wl-grid">
                            {displayFilms.length > 0 ? (
                                displayFilms.map(film => (
                                    <FriendFilmCard
                                        key={film.id}
                                        film={film}
                                        isAdded={addedIds.includes(film.id)}
                                        onAdd={onAddToList}
                                        onClick={() => onOpenFilm(film)}
                                    />
                                ))
                            ) : (
                                <div style={{ gridColumn: '1 / -1', padding: '100px 0', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                                    <h3 style={{ fontSize: 24, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>No films found</h3>
                                    <p style={{ fontSize: 16 }}>Try selecting another friend or category.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
}
