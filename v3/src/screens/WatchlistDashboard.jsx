import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { FaFilter } from 'react-icons/fa';
import { MdMovieCreation } from "react-icons/md";

// Mock films removed in favor of props.myList

const GENRES = ['All', 'Action', 'Adventure', 'Fantasy', 'Comedy', 'Crime'];
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

export default function WatchlistDashboard(props) {
    const {
        onTabChange,
        activeTab,
        searchQuery,
        onSearchChange,
        myList = [],
        watchedIds = [],
        onMarkWatched,
        onUnmarkWatched,
        onRemoveFromList,
        onOpenFilm
    } = props;

    const [isListVisible, setIsListVisible] = useState(true);
    const [activeStat, setActiveStat] = useState('to_watch');
    const [activeSort, setActiveSort] = useState('All');
    const [activeGenre, setActiveGenre] = useState('All');
    const [activeService, setActiveService] = useState('All');

    const toWatchList = myList.filter(f => !watchedIds.includes(f.film_id || f.id));
    const watchedList = myList.filter(f => watchedIds.includes(f.film_id || f.id));

    // Dynamic Genre labels based on myList
    const dynamicGenres = React.useMemo(() => {
        const set = new Set(['All']);
        myList.forEach(item => {
            const film = item.film || item;
            if (film.genre) set.add(film.genre);
        });
        return Array.from(set);
    }, [myList]);

    const baseList =
        activeStat === 'watched' ? watchedList :
            activeStat === 'to_watch' ? toWatchList : myList;

    const displayFilms = baseList
        .filter(item => {
            const film = item.film || item;
            if (activeGenre !== 'All' && !(film.genre || '').toLowerCase().includes(activeGenre.toLowerCase())) return false;
            // Additional search filter consistency
            if (searchQuery && !film.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => {
            const fa = a.film || a;
            const fb = b.film || b;
            return activeSort === 'A-Z' ? fa.title.localeCompare(fb.title) : 0;
        });

    return (
        <DashboardLayout
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            activeTab={activeTab}
            onTabChange={onTabChange}
        >
            <style dangerouslySetInnerHTML={{
                __html: `
                /* pull content edge-to-edge, removing DashboardLayout padding */
                .wl-root { display: flex; min-height: calc(100vh - 114px);gap:24px }

                /* ── sidebar ── */
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

                /* stat rows */
                .wl-stat { display: flex; align-items: center;justify-content: center;gap: 10px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: background 0.2s; }
                .wl-stat:hover { background: rgba(255,255,255,0.05); }
                .wl-stat.active {
                    background: #E0C36A33;
                    border: 3px solid #E0C36A;
                    border-radius: 30px;
                    padding: 9px 16px;
                }

                /* ── grid area ── */
                .wl-grid-area { flex: 1; overflow-y: auto; }
                .wl-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(284px, 1fr));
                    gap: 25px;
                }

                /* ── poster card ── */
                .wl-card {
                    background: #000;
                    border-radius: 32px;
                    overflow: hidden;
                    border: 1px solid #FFFFFF33;
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.25s, box-shadow 0.25s;
                    padding: 26px;
                }
                .wl-card:hover { box-shadow: 0 20px 50px rgba(0,0,0,0.75); border-color: rgba(255,255,255,0.2); }

                .wl-seen-btn {
                    width: 100%; padding: 9px 0; border-radius: 999px; border: 1px solid #FFFFFF33;
                    background: #008633; color: #fff; font-weight: 700; font-size: 16px;
                    cursor: pointer; margin-bottom: 10px; transition: background 0.2s;
                }
                .wl-seen-btn:hover { background: #16a34a; }
                .wl-seen-btn.watched { background: rgba(74,222,128,0.18); color: #4ade80; }
                .wl-seen-btn.watched:hover { background: rgba(74,222,128,0.3); }

                .wl-remove-btn {
                    width: 100%; padding: 9px 0; border-radius: 999px; border: none;
                    background: #B1060F33; color: #fff; font-weight: 700;
                    font-size: 16px; cursor: pointer; transition: all 0.2s;
                    border: 1px solid #FFFFFF33;
                }
                .wl-remove-btn:hover { background: rgba(239,68,68,0.22); color: #ef4444; }

                /* toggle */
                .wl-toggle { width: 40px; height: 22px; border-radius: 11px; position: relative; cursor: pointer; transition: background 0.3s; flex-shrink: 0; }
                .wl-toggle-knob { width: 30px; height: 30px; border-radius: 50%; background: #E0C36A; position: absolute; top: -4px; transition: left 0.3s; box-shadow: 0 1px 4px rgba(0,0,0,0.5); }
            `}} />

            <div className="wl-root">

                {/* ══ SIDEBAR ══ */}
                <aside className="wl-sidebar">

                    <h1 style={{ fontSize: 30, fontWeight: 600, color: '#fff', marginTop: '20px', letterSpacing: -0.3 }}>
                        My Watchlist
                    </h1>
                    <p style={{ fontSize: 20, color: '#A09E9F', margin: '0 0 30px', fontWeight: 500 }}>
                        Curated picks and future watches
                    </p>

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
                            { key: 'to_watch', count: toWatchList.length, label: 'To Watch' },
                            { key: 'watched', count: watchedList.length, label: 'Watched' },
                            { key: 'all', count: myList.length, label: 'All' },
                        ].map(({ key, count, label }) => (
                            <div
                                key={key}
                                className={`wl-stat${activeStat === key ? ' active' : ''}`}
                                onClick={() => setActiveStat(key)}
                            >
                                <span style={{
                                    fontSize: 20,
                                    color: '#fff',
                                    fontWeight: activeStat === key ? '700' : '400',
                                }}>
                                    {String(count).padStart(2, '0')}
                                </span>
                                <span style={{
                                    fontSize: 20,
                                    color: '#fff',
                                    fontWeight: activeStat === key ? '700' : '400',
                                }}>
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    {/* <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 20 }} /> */}

                    {/* Sort / Filters */}
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

                    {/* Divider */}
                    {/* <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 20 }} /> */}

                    {/* Genre */}
                    <div style={{ marginBottom: 2, flexDirection: 'row', justifyContent: 'start', alignItems: 'start', gap: 12 }}>
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

                    {/* Services */}
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

                {/* ══ POSTER GRID ══ */}
                <div className="wl-grid-area">
                    {displayFilms.length > 0 ? (
                        <div className="wl-grid">
                            {displayFilms.map(item => {
                                const film = item.film || item;
                                const filmId = film.id || item.film_id;
                                const isWatched = watchedIds.includes(filmId);
                                return (
                                    <div key={filmId} className="wl-card" onClick={() => onOpenFilm(film)} style={{ cursor: 'pointer' }}>
                                        <img
                                            src={film.poster_url}
                                            alt={film.title}
                                            style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block', borderRadius: 20, border: '1px solid #FFFFFF33' }}
                                        />
                                        <div style={{ padding: '10px 11px 0' }}>
                                            <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', marginTop: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {film.title}
                                            </div>
                                            <div style={{ fontSize: 16, color: '#727272', marginBottom: 15 }}>
                                                {film.year}
                                            </div>
                                            <button
                                                className={`wl-seen-btn${isWatched ? ' watched' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    isWatched ? onUnmarkWatched(film) : onMarkWatched(film);
                                                }}
                                            >
                                                {isWatched ? '✓ Watched' : '"Tap" if you\'ve seen it'}
                                            </button>
                                            <button className="wl-remove-btn" onClick={(e) => {
                                                e.stopPropagation();
                                                onRemoveFromList(film);
                                            }}>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
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
