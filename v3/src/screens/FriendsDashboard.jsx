import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getFriendFilms, logFriendView } from '../api/friends';
import { FaPlus, FaWhatsapp, FaCheck, FaStar, FaShareAlt, FaBell, FaFilter, FaTimes } from 'react-icons/fa';
import { MdMovieCreation } from "react-icons/md";
import { TiStarFullOutline } from "react-icons/ti";
import StreamerBadge from '../components/StreamerBadge';
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
    return (
        <div className="wl-card">
            <div style={{ position: 'relative', cursor: 'pointer', borderRadius: 20, overflow: 'hidden', border: '1px solid #FFFFFF33' }} onClick={onClick}>
                <img
                    src={film.poster_url || film.poster || film.img || '/branding/poster1.png'}
                    alt={film.title}
                    style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
                />
                <StreamerBadge streamers={film.streamers} />
            </div>
            <div style={{ padding: '14px 16px 16px' }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '4px' }}>
                    {film.title}
                </div>
                <div style={{ fontSize: 14, color: '#727272', marginBottom: '14px' }}>
                    {film.year}{film.genre ? ` · ${film.genre.split(',')[0].trim()}` : ''}
                </div>
                <button
                    className="wl-seen-btn static-seen"
                    onClick={(e) => { e.stopPropagation(); if (!isAdded) onAdd(film); }}
                    style={{ background: isAdded ? 'rgba(255,255,255,0.1)' : '#16A34A', color: '#fff', cursor: isAdded ? 'default' : 'pointer', border: isAdded ? '1px solid rgba(255,255,255,0.1)' : 'none' }}
                    disabled={isAdded}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        {isAdded ? <FaCheck /> : null}
                        <span>{isAdded ? 'Seen it!' : 'Seen it?'}</span>
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
            width: 70, height: 70, borderRadius: '50%',
            background: active ? 'var(--gold)' : '#ffffff30',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, border: active ? '2px solid #fff' : 'none',
            transition: '0.2s', boxShadow: active ? '0 0 15px rgba(241, 196, 15, 0.4)' : 'none',
            overflow: 'hidden', fontWeight: 'bold', color: '#fff'
        }}>
            {friend.avatar && (friend.avatar.startsWith('http') || friend.avatar.startsWith('/')) ? (
                <img src={friend.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : friend.avatar ? (
                friend.avatar
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
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addUsername, setAddUsername] = useState('');
    const [sendingRequest, setSendingRequest] = useState(false);

    // Dynamic Genre list based on friend's films
    const dynamicGenres = useMemo(() => {
        const set = new Set(['All']);
        friendList.forEach(f => { if (f.genre) set.add(f.genre.split(',')[0].trim()); });
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

    const displayFilms = useMemo(() => {
        let filtered = (friendList || []).filter(f => {
            if (activeTabSub === 'watched' && !addedIds?.includes(f.id)) return false;
            if (activeTabSub === 'to_watch' && addedIds?.includes(f.id)) return false;
            if (activeGenre !== 'All' && (f.genre || '').split(',')[0].trim() !== activeGenre) return false;

            if (activeService !== 'All') {
                const streamers = f.streamers || [];
                const target = activeService.toLowerCase().replace('+', '');
                if (!streamers.some(s => s.toLowerCase().includes(target))) return false;
            }
            return true;
        });

        // Apply Sorting
        if (activeSort === 'A-Z') {
            filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        } else if (activeSort === 'Recently Added') {
            filtered.sort((a, b) => b.id - a.id);
        } else if (activeSort === 'Friends Rolling') {
            filtered.sort(() => Math.random() - 0.5);
        }

        return filtered;
    }, [friendList, activeTabSub, addedIds, activeGenre, activeService, activeSort]);

    const handleAcceptRequest = async (username) => {
        const { acceptFriendRequest } = await import('../api/friends');
        try {
            await acceptFriendRequest(username);
            if (onFriendsUpdated) onFriendsUpdated();
        } catch (_) { }
    };

    const handleRejectRequest = async (username) => {
        const { removeFriend } = await import('../api/friends');
        try {
            await removeFriend(username);
            if (onFriendsUpdated) onFriendsUpdated();
        } catch (_) { }
    };

    const handleSendRequest = async (e) => {
        if (e) e.preventDefault();
        if (!addUsername.trim()) return;
        setSendingRequest(true);
        const { sendFriendRequest } = await import('../api/friends');
        try {
            await sendFriendRequest(addUsername.trim());
            onToast(`Request sent to ${addUsername}!`);
            setIsAddModalOpen(false);
            setAddUsername('');
        } catch (err) {
            onToast(err.message || "Failed to send request");
        } finally {
            setSendingRequest(false);
        }
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
                    <div style={{ marginBottom: 2, display: 'flex', flexDirection: 'row', justifyContent: 'start', alignItems: 'start', gap: 10, flexWrap: 'wrap' }}>
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
                <div className="wl-grid-area" >
                    {/* Header: Friends Scroller + Invite banner */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, background: '#000', border: ' 1px solid ##FFFFFF33', borderRadius: 20, padding: '20px 40px' }}>
                        {isListVisible && <div style={{ display: 'flex', gap: 22, overflowX: 'auto', alignItems: 'center' }} className="no-scrollbar">
                            {/* Pending Requests */}
                            {friendRequests.length > 0 && (
                                <div style={{ display: 'flex', gap: 20, paddingRight: 20, borderRight: '1px solid rgba(255,255,255,0.1)', alignItems: 'center' }}>
                                    {friendRequests.map(req => (
                                        <div key={req.username} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                            <div style={{ position: 'relative' }}>
                                                <FriendAvatar
                                                    friend={{ name: req.display_name || req.username, avatar: req.avatar }}
                                                    onClick={() => { }}
                                                />
                                                <button
                                                    onClick={() => handleAcceptRequest(req.username)}
                                                    style={{
                                                        background: '#16a34a', border: 'none', borderRadius: 6,
                                                        display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', cursor: 'pointer', gap: 5, color: '#fff', padding: '4px 8px', marginTop: '8px', fontSize: '12px'
                                                    }}
                                                >
                                                    <FaCheck size={10} /> Accept
                                                </button>
                                                <button
                                                    onClick={() => handleRejectRequest(req.username)}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
                                                        display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', cursor: 'pointer', gap: 5, color: '#fff', padding: '4px 8px', marginTop: '4px', fontSize: '12px'
                                                    }}
                                                >
                                                    <FaTimes size={10} /> Reject
                                                </button>
                                            </div>
                                            {/* <div style={{ fontSize: 11, color: '#E0C36A', fontWeight: 700 }}>Request</div> */}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="friend-avatar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setIsAddModalOpen(true)}>
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
                        </div>}

                        <div
                            onClick={() => {
                                const inviteLink = `${window.location.origin}/invite?invite_from=${currentUser?.username || 'user'}`;
                                const text = encodeURIComponent("Join me on Watch Chums to find the best TV & films! " + inviteLink);
                                window.location.href = `https://wa.me/?text=${text}`;
                            }}
                            style={{
                                border: '1px solid #16A34A',
                                borderRadius: 20,
                                padding: '20px',
                                display: 'flex', alignItems: 'center', gap: 14,
                                cursor: 'pointer',
                                marginLeft: 'auto'
                            }}
                        >
                            <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaWhatsapp size={42} color="#12CE5A" />
                            </div>
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>Invite friends to join Watch Chums</div>
                                <div style={{ fontSize: 14, color: '#A09E9F', fontWeight: 400 }}>Invite friends via WhatsApp.</div>
                            </div>
                        </div>
                    </div>

                    {/* Grid Area */}
                    {loadingList ? (
                        <div style={{ textAlign: 'center', padding: '100px 0', color: 'rgba(255,255,255,0.4)' }}>
                            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                            <h3>Loading films...</h3>
                        </div>
                    ) : displayFilms.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px 0', color: 'rgba(255,255,255,0.4)' }}>
                            <MdMovieCreation size={48} style={{ marginBottom: 16 }} />
                            <h3>No results found</h3>
                            <p>Try adjusting your filters to find more great content.</p>
                        </div>
                    ) : (
                        <div className="wl-grid">
                            {displayFilms.map(film => (
                                <FriendFilmCard
                                    key={film.id}
                                    film={film}
                                    isAdded={addedIds.includes(film.id)}
                                    onAdd={(f) => props.onSeenIt(f)}
                                    onClick={() => onOpenFilm(film)}
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* ══ ADD FRIEND MODAL ══ */}
            {isAddModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                    animation: 'fadeIn 0.3s ease-out'
                }} onClick={() => setIsAddModalOpen(false)}>
                    <div style={{
                        background: '#111', border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 24, padding: '32px', width: '100%', maxWidth: 440,
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        animation: 'modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Add a Friend</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24, fontSize: 15 }}>Enter their username or email address.</p>

                        <form onSubmit={handleSendRequest}>
                            <input
                                autoFocus
                                value={addUsername}
                                onChange={e => setAddUsername(e.target.value)}
                                placeholder="Username or email address"
                                style={{
                                    width: '100%', background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 12, padding: '14px 18px', color: '#fff',
                                    fontSize: 16, outline: 'none', marginBottom: 24,
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = '#E0C36A'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: 12,
                                        background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff', fontWeight: 600, cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendingRequest || !addUsername.trim()}
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: 12,
                                        background: '#E0C36A', border: 'none',
                                        color: '#000', fontWeight: 700, cursor: 'pointer',
                                        opacity: (sendingRequest || !addUsername.trim()) ? 0.5 : 1
                                    }}
                                >
                                    {sendingRequest ? 'Sending...' : 'Send Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.9) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </DashboardLayout>
    );
}
