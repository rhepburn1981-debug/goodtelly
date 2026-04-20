import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { FaFilter } from 'react-icons/fa';

const STATIC_FILMS = [
    { id: 1,  title: 'Thrash',             year: 2026, genre: 'Action',    poster: '/branding/poster1.png' },
    { id: 2,  title: 'Mercy',              year: 2026, genre: 'Action',    poster: '/branding/poster2.png' },
    { id: 3,  title: 'Jujutsu Kaizen',     year: 2022, genre: 'Fantasy',   poster: '/branding/poster3.png' },
    { id: 4,  title: 'Beyond Paradise',    year: 2017, genre: 'Adventure', poster: '/branding/poster4.png' },
    { id: 5,  title: 'Punisher',           year: 2026, genre: 'Action',    poster: '/branding/terminator_poster.png' },
    { id: 6,  title: 'Mario: Galaxy Movie',year: 2024, genre: 'Comedy',    poster: '/branding/trend2.png' },
    { id: 7,  title: 'One Piece',          year: 2023, genre: 'Adventure', poster: '/branding/one_piece_poster.png' },
    { id: 8,  title: 'Mobland',            year: 2025, genre: 'Crime',     poster: '/branding/mobland_poster.png' },
    { id: 9,  title: 'Avatar',             year: 2022, genre: 'Fantasy',   poster: '/branding/avatar_poster.png' },
    { id: 10, title: 'Burldg',             year: 2024, genre: 'Adventure', poster: '/branding/burldg_poster.png' },
    { id: 11, title: 'Safe Sock',          year: 2023, genre: 'Comedy',    poster: '/branding/safesock_poster.png' },
    { id: 12, title: 'Terminator',         year: 2024, genre: 'Action',    poster: '/branding/trend3.png' },
];

const GENRES = ['All', 'Action', 'Adventure', 'Fantasy', 'Comedy', 'Crime'];
const SORTS  = ['All', 'Recently Added', 'Friends Rolling', 'A-Z'];

const Pill = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{
        padding: '5px 14px',
        borderRadius: 100,
        background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
        border: active ? '1px solid rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.18)',
        color: active ? '#fff' : 'rgba(255,255,255,0.55)',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
        lineHeight: 1.4,
    }}>
        {label}
    </button>
);

export default function WatchlistDashboard(props) {
    const { onTabChange, activeTab, searchQuery, onSearchChange } = props;

    const [films, setFilms]               = useState(STATIC_FILMS);
    const [isListVisible, setIsListVisible] = useState(true);
    const [activeStat, setActiveStat]     = useState('to_watch');
    const [activeSort, setActiveSort]     = useState('All');
    const [activeGenre, setActiveGenre]   = useState('All');

    const toWatchList = films.filter(f => !f.watched);
    const watchedList = films.filter(f =>  f.watched);

    const handleToggleWatched = (id) =>
        setFilms(prev => prev.map(f => f.id === id ? { ...f, watched: !f.watched } : f));
    const handleRemove = (id) =>
        setFilms(prev => prev.filter(f => f.id !== id));

    const baseList =
        activeStat === 'watched'  ? watchedList  :
        activeStat === 'to_watch' ? toWatchList  : films;

    const displayFilms = baseList
        .filter(f => activeGenre === 'All' || f.genre === activeGenre)
        .sort((a, b) => activeSort === 'A-Z' ? a.title.localeCompare(b.title) : 0);

    return (
        <DashboardLayout
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            activeTab={activeTab}
            onTabChange={onTabChange}
        >
            <style dangerouslySetInnerHTML={{ __html: `
                /* pull content edge-to-edge, removing DashboardLayout padding */
                .wl-root { margin: 0 -40px; display: flex; min-height: calc(100vh - 114px); }

                /* ── sidebar ── */
                .wl-sidebar {
                    width: 395px;
                    flex-shrink: 0;
                    background: rgba(10,10,10,0.92);
                    border: 1px solid rgba(255,255,255,0.07);
                    padding: 28px 20px 60px;
                    position: sticky;
                    top: 114px;
                    height: calc(100vh - 114px);
                    overflow-y: auto;
                    scrollbar-width: none;
                    border-radius: 20px;
                }
                .wl-sidebar::-webkit-scrollbar { display: none; }

                /* stat rows */
                .wl-stat { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: background 0.2s; }
                .wl-stat:hover { background: rgba(255,255,255,0.05); }
                .wl-stat.active {
                    background: transparent;
                    border: 1px solid rgba(200,170,60,0.55);
                    border-radius: 30px;
                    padding: 9px 16px;
                }

                /* ── grid area ── */
                .wl-grid-area { flex: 1; padding: 28px 28px 60px; overflow-y: auto; }
                .wl-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
                    gap: 25px;
                }

                /* ── poster card ── */
                .wl-card {
                    background: rgba(18,18,18,0.95);
                    border-radius: 32px;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.08);
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.25s, box-shadow 0.25s;
                    padding: 26px;
                }
                .wl-card:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.75); border-color: rgba(255,255,255,0.2); }

                .wl-seen-btn {
                    width: 100%; padding: 9px 0; border-radius: 999px; border: 1px solid rgba(255, 255, 255, 0.2);
                    background: #008633; color: #fff; font-weight: 700; font-size: 13px;
                    cursor: pointer; margin-bottom: 8px; transition: background 0.2s;
                }
                .wl-seen-btn:hover { background: #16a34a; }
                .wl-seen-btn.watched { background: rgba(74,222,128,0.18); color: #4ade80; }
                .wl-seen-btn.watched:hover { background: rgba(74,222,128,0.3); }

                .wl-remove-btn {
                    width: 100%; padding: 9px 0; border-radius: 999px; border: none;
                    background: #B1060F33; color: rgba(255,255,255,0.65); font-weight: 700;
                    font-size: 13px; cursor: pointer; transition: all 0.2s;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .wl-remove-btn:hover { background: rgba(239,68,68,0.22); color: #ef4444; }

                /* toggle */
                .wl-toggle { width: 40px; height: 22px; border-radius: 11px; position: relative; cursor: pointer; transition: background 0.3s; flex-shrink: 0; }
                .wl-toggle-knob { width: 16px; height: 16px; border-radius: 50%; background: #fff; position: absolute; top: 3px; transition: left 0.3s; box-shadow: 0 1px 4px rgba(0,0,0,0.5); }
            `}} />

            <div className="wl-root">

                {/* ══ SIDEBAR ══ */}
                <aside className="wl-sidebar">

                    <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: -0.3 }}>
                        My Watchlist
                    </h1>
                    <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.38)', margin: '0 0 22px', fontWeight: 500 }}>
                        Curated picks and future watches
                    </p>

                    {/* Visibility toggle */}
                    <div style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 12, padding: '20px 30px',
                        marginBottom: 18,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 2 }}>List visible to friends.</div>
                            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.38)' }}>Friends can see your picks.</div>
                        </div>
                        <div
                            className="wl-toggle"
                            style={{ background: isListVisible ? '#fbbf24' : 'rgba(255,255,255,0.15)' }}
                            onClick={() => setIsListVisible(v => !v)}
                        >
                            <div className="wl-toggle-knob" style={{ left: isListVisible ? 21 : 3 }} />
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ marginBottom: 26 }}>
                        {[
                            { key: 'to_watch', count: toWatchList.length, label: 'To Watch' },
                            { key: 'watched',  count: watchedList.length,  label: 'Watched'  },
                            { key: 'all',      count: films.length,        label: 'All'      },
                        ].map(({ key, count, label }) => (
                            <div
                                key={key}
                                className={`wl-stat${activeStat === key ? ' active' : ''}`}
                                onClick={() => setActiveStat(key)}
                            >
                                <span style={{
                                    fontSize: 20, fontWeight: 900, minWidth: 30,
                                    color: activeStat === key ? '#fbbf24' : '#fff',
                                }}>
                                    {String(count).padStart(2, '0')}
                                </span>
                                <span style={{
                                    fontSize: 14, fontWeight: 600,
                                    color: activeStat === key ? '#fbbf24' : 'rgba(255,255,255,0.55)',
                                }}>
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 20 }} />

                    {/* Sort / Filters */}
                    <div style={{ marginBottom: 22, display: 'flex', flexDirection: 'row', justifyContent: 'start', alignItems: 'start', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                            <FaFilter size={11} color="#E0C36A" />
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#E0C36A' }}>Filters:</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {SORTS.map(s => (
                                <Pill key={s} label={s} active={activeSort === s} onClick={() => setActiveSort(s)} />
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 20 }} />

                    {/* Genre */}
                    <div style={{ marginBottom: 2,display: 'flex', flexDirection: 'row', justifyContent: 'start', alignItems: 'start', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                            <span style={{ fontSize: 14 }}>🎬</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#E0C36A' }}>Genre:</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {GENRES.map(g => (
                                <Pill key={g} label={g} active={activeGenre === g} onClick={() => setActiveGenre(g)} />
                            ))}
                        </div>
                    </div>

                </aside>

                {/* ══ POSTER GRID ══ */}
                <div className="wl-grid-area">
                    {displayFilms.length > 0 ? (
                        <div className="wl-grid">
                            {displayFilms.map(film => (
                                <div key={film.id} className="wl-card">
                                    <img
                                        src={film.poster}
                                        alt={film.title}
                                        style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block', borderRadius: 20}}
                                    />
                                    <div style={{ padding: '10px 10px 12px' }}>
                                        <div style={{ fontWeight: 800, fontSize: 14, color: '#fff', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {film.title}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginBottom: 10 }}>
                                            {film.year}
                                        </div>
                                        <button
                                            className={`wl-seen-btn${film.watched ? ' watched' : ''}`}
                                            onClick={() => handleToggleWatched(film.id)}
                                        >
                                            {film.watched ? '✓ Watched' : '"Tap" if you\'ve seen it'}
                                        </button>
                                        <button className="wl-remove-btn" onClick={() => handleRemove(film.id)}>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '80px 0', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'rgba(255,255,255,0.6)' }}>Nothing here yet</h3>
                            <p style={{ fontSize: 15 }}>Try adjusting your filters or adding some films.</p>
                        </div>
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
}
