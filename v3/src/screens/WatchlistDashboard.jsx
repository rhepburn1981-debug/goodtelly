import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { FaCheck, FaTimes, FaGlobe, FaEyeSlash, FaTrash, FaCheckCircle, FaFilter } from 'react-icons/fa';

// Mock data to flesh out the premium UI
const INITIAL_WATCHLIST = [
    { id: 1, title: 'Blade Runner 2049', year: 2017, genre: 'Sci-Fi / Thriller', poster: '/branding/poster1.png', isVisible: true, isWatched: false },
    { id: 2, title: 'The Dark Knight', year: 2008, genre: 'Action / Crime', poster: '/branding/poster2.png', isVisible: true, isWatched: false },
    { id: 3, title: 'Interstellar', year: 2014, genre: 'Sci-Fi / Drama', poster: '/branding/poster3.png', isVisible: false, isWatched: true },
    { id: 4, title: 'Parasite', year: 2019, genre: 'Thriller / Comedy', poster: '/branding/poster4.png', isVisible: true, isWatched: false },
    { id: 5, title: 'Dune: Part Two', year: 2024, genre: 'Sci-Fi / Adventure', poster: '/branding/trend2.png', isVisible: true, isWatched: false },
    { id: 6, title: 'The Matrix', year: 1999, genre: 'Sci-Fi / Action', poster: '/branding/terminator_poster.png', isVisible: true, isWatched: true },
];

const FilterPill = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        style={{
            padding: '8px 20px',
            borderRadius: 100,
            background: active ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: active ? '1px solid rgba(251, 191, 36, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            color: active ? '#fbbf24' : 'rgba(255, 255, 255, 0.6)',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            flexShrink: 0
        }}
        className="filter-pill"
    >
        {label}
    </button>
);

const StatCard = ({ label, value, active, onClick }) => (
    <div
        onClick={onClick}
        className="stat-card"
        style={{
            flex: 1,
            background: active ? 'rgba(251, 191, 36, 0.08)' : 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(12px)',
            border: active ? '1px solid rgba(251, 191, 36, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: active ? '0 10px 40px rgba(251, 191, 36, 0.15)' : 'none'
        }}
    >
        <div style={{ fontSize: 36, fontWeight: 900, color: active ? '#fbbf24' : '#fff', lineHeight: 1, marginBottom: 8 }}>
            {value}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: active ? 'rgba(251, 191, 36, 0.8)' : 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>
            {label}
        </div>
    </div>
);

const WatchlistItem = ({ film, onToggleWatched, onRemove }) => (
    <div
        className="watchlist-item"
        style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 16,
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative'
        }}
    >
        {/* Glow effect on hover */}
        <div className="hover-glow" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 70%)', opacity: 0, transition: 'opacity 0.3s ease', pointerEvents: 'none' }} />

        {/* Poster */}
        <div style={{ width: 100, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.05)' }}>
            <img src={film.poster_url} alt={film.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
        </div>

        {/* Content */}
        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: -0.3 }}>{film.title}</h3>
                    <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.4)', fontWeight: 500 }}>
                        {film.genre} &bull; {film.year}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'auto' }}>
                {film.isVisible ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: 100 }}>
                        <FaGlobe size={10} color="rgba(255,255,255,0.6)" />
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Visible to Friends</span>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 100 }}>
                        <FaEyeSlash size={10} color="rgba(255,255,255,0.4)" />
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>Private</span>
                    </div>
                )}
            </div>
        </div>

        {/* Actions - Vertical on the right */}
        <div style={{
            display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', width: 140
        }}>
            <button
                onClick={() => onToggleWatched(film.id)}
                className="action-btn-watched"
                style={{
                    flex: 1, border: 'none',
                    background: film.isWatched ? 'rgba(74, 222, 128, 0.15)' : 'transparent',
                    color: film.isWatched ? '#4ade80' : 'rgba(255,255,255,0.6)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                    cursor: 'pointer', transition: 'all 0.2s ease', padding: 12
                }}
            >
                {film.isWatched ? <FaCheckCircle size={18} /> : <FaCheck size={18} />}
                <span style={{ fontSize: 11, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>
                    {film.isWatched ? 'Watched' : "Tap if you've\nseen it"}
                </span>
            </button>
            <button
                onClick={() => onRemove(film.id)}
                className="action-btn-remove"
                style={{
                    height: 50, border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    cursor: 'pointer', transition: 'all 0.2s ease', fontSize: 11, fontWeight: 700
                }}
            >
                <FaTrash size={12} /> Remove
            </button>
        </div>
    </div>
);

export default function WatchlistDashboard(props) {
    const {
        myList = [],
        watchedIds = [],
        onOpenFilm,
        onMarkWatched,
        onUnmarkWatched,
        onRemoveFromList,
        onTabChange,
        activeTab,
        searchQuery,
        onSearchChange
    } = props;

    const [isListVisible, setIsListVisible] = useState(true);
    const [activeStat, setActiveStat] = useState('to_watch'); // 'to_watch', 'watched', 'all'

    // Filters
    const [activeSort, setActiveSort] = useState('Recently Added');
    const [activeGenre, setActiveGenre] = useState('All');
    const [activePlatform, setActivePlatform] = useState('All');

    const handleToggleWatched = (filmId) => {
        const film = myList.find(f => f.id === filmId);
        if (!film) return;
        if (watchedIds.includes(filmId)) {
            onUnmarkWatched(film);
        } else {
            onMarkWatched(film);
        }
    };

    const handleRemove = (filmId) => {
        const film = myList.find(f => f.id === filmId);
        if (film) onRemoveFromList(film);
    };

    const toWatchList = myList.filter(f => !watchedIds.includes(f.id));
    const watchedList = myList.filter(f => watchedIds.includes(f.id));

    const toWatchCount = toWatchList.length;
    const watchedCount = watchedList.length;
    const totalCount = myList.length;

    // Genres dynamic
    const allGenres = ["All", ...new Set(myList.flatMap(f => (f.genre || "").split(",").map(g => g.trim()).filter(Boolean)))];

    const displayFilms = (activeStat === 'watched' ? watchedList : activeStat === 'to_watch' ? toWatchList : myList)
        .filter(f => {
            if (activeGenre !== 'All' && !(f.genre || "").includes(activeGenre)) return false;
            // Platform filtering would need mapping of providers/streamers, which is in props.allFilms or similar
            // For now, let's keep it simple or implement if data is clear
            return true;
        })
        .sort((a, b) => {
            if (activeSort === 'A–Z') return (a.title || "").localeCompare(b.title || "");
            // 'Recently Added' is default order usually if sorted by backend
            return 0;
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
                .watchlist-item:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.5); border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.06); z-index: 10; }
                .watchlist-item:hover .hover-glow { opacity: 1 !important; }
                .action-btn-watched:hover { background: rgba(74, 222, 128, 0.2) !important; color: #4ade80 !important; }
                .action-btn-remove:hover { color: #ef4444 !important; background: rgba(239, 68, 68, 0.1) !important; }
                .filter-pill:hover { background: rgba(255,255,255,0.1) !important; }
                .toggle-switch { width: 44px; height: 24px; background: rgba(255,255,255,0.1); border-radius: 12px; position: relative; cursor: pointer; transition: 0.3s; border: 1px solid rgba(255,255,255,0.1); }
                .toggle-switch.active { background: rgba(251, 191, 36, 0.2); border-color: rgba(251, 191, 36, 0.5); }
                .toggle-knob { width: 18px; height: 18px; background: #fff; border-radius: 50%; position: absolute; top: 2px; left: 3px; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
                .toggle-switch.active .toggle-knob { left: 21px; background: #fbbf24; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .fade-in { animation: fadeIn 0.4s ease; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
            `}} />

            {/* Background elements for cinematic feel */}
            <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)', filter: 'blur(120px)', zIndex: 0, pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1, paddingBottom: 100 }} className="fade-in">

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
                    <div>
                        <h1 style={{ fontSize: 40, fontWeight: 900, margin: '0 0 4px', letterSpacing: -1, color: '#fff' }}>
                            My Watchlist
                        </h1>
                        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 500 }}>
                            Curated picks and future watches
                        </p>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)', padding: '8px 16px', borderRadius: 100, border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                        {totalCount} Films
                    </div>
                </div>

                {/* Visibility Toggle Card */}
                <div style={{
                    marginBottom: 32,
                    background: 'rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 20,
                    padding: '24px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: isListVisible ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: isListVisible ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)', transition: 'all 0.3s ease' }}>
                            {isListVisible ? <FaGlobe size={22} color="#4ade80" /> : <FaEyeSlash size={22} color="rgba(255,255,255,0.4)" />}
                        </div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 4 }}>List visible to friends</div>
                            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{isListVisible ? 'Friends can see your picks and activities' : 'Only you can see your watchlist'}</div>
                        </div>
                    </div>
                    <div className={`toggle-switch ${isListVisible ? 'active' : ''}`} onClick={() => setIsListVisible(!isListVisible)}>
                        <div className="toggle-knob" />
                    </div>
                </div>

                {/* Stats Section */}
                <div style={{ display: 'flex', gap: 20, marginBottom: 40 }}>
                    <StatCard label="To Watch" value={toWatchCount} active={activeStat === 'to_watch'} onClick={() => setActiveStat('to_watch')} />
                    <StatCard label="Watched" value={watchedCount} active={activeStat === 'watched'} onClick={() => setActiveStat('watched')} />
                    <StatCard label="All" value={totalCount} active={activeStat === 'all'} onClick={() => setActiveStat('all')} />
                </div>

                {/* Filters & Sorting */}
                <div style={{ marginBottom: 40, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 32 }}>

                    {/* Row 1: Sorting */}
                    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }} className="no-scrollbar">
                        <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.3)', marginRight: 8, fontSize: 14, fontWeight: 700 }}><FaFilter size={12} style={{ marginRight: 6 }} /> Sort:</div>
                        {['Recently Added', 'Friends\' Rating', 'A–Z'].map(sort => (
                            <FilterPill key={sort} label={sort} active={activeSort === sort} onClick={() => setActiveSort(sort)} />
                        ))}
                    </div>

                    {/* Row 2: Genres */}
                    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }} className="no-scrollbar">
                        <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.3)', marginRight: 8, fontSize: 14, fontWeight: 700, width: 50 }}>Genre:</div>
                        {allGenres.slice(0, 10).map(g => (
                            <FilterPill key={g} label={g} active={activeGenre === g} onClick={() => setActiveGenre(g)} />
                        ))}
                    </div>
                </div>

                {/* Grid List */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: 24 }}>
                    {displayFilms.map((film) => (
                        <WatchlistItem
                            key={film.id}
                            film={{ ...film, isWatched: watchedIds.includes(film.id), isVisible: isListVisible }}
                            onToggleWatched={() => handleToggleWatched(film.id)}
                            onRemove={() => handleRemove(film.id)}
                            onClick={() => onOpenFilm(film)}
                        />
                    ))}
                </div>

                {displayFilms.length === 0 && (
                    <div style={{ padding: '80px 0', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
                        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'rgba(255,255,255,0.6)' }}>Nothing here yet</h3>
                        <p style={{ fontSize: 15 }}>Try adjusting your filters or adding some films.</p>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
}
