import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getTrending, getProviders, getFilms, getUpcomingTv } from '../api/films';
import { FaPlus, FaCheck, FaChevronRight, FaFilter } from 'react-icons/fa';
import { TiStarFullOutline } from "react-icons/ti";
import { MdMovieCreation } from "react-icons/md";
import { FiPlus } from 'react-icons/fi';

// Constants from Watchlist for consistency
const GENRES = ['All', 'Action', 'Adventure', 'Fantasy', 'Comedy', 'Drama', 'Thriller', 'Crime'];
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
const TIME_FILTERS = ['All', 'This Week', 'This Month', 'This Year'];

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

const DiscoverCard = ({ film, isAdded, onAdd, onClick }) => (
    <div className="wl-card" style={{ cursor: 'copy' }}>
        <img
            src={film.poster_url || film.image || '/branding/poster1.png'}
            alt={film.title || film.name}
            style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block', borderRadius: 20, border: '1px solid #FFFFFF33' }}
            onClick={onClick}
        />
        <div style={{ paddingTop: '10px' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {film.title || film.name}
            </div>
            <div style={{ fontSize: 16, color: '#727272' }}>
                {film.year || '2024'}
            </div>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <TiStarFullOutline key={star} size={24} color={star <= 5 ? "#fbbf24" : "rgba(255,255,255,0.2)"} />
                ))}
                <span style={{ fontSize: 16, color: '#727272', marginLeft: 10 }}>4.8/5</span>
            </div>

            <button
                className={`wl-seen-btn ${isAdded ? 'watched' : ''}`}
                onClick={(e) => { e.stopPropagation(); onAdd(film); }}
                style={{ background: isAdded ? '#E0C36A' : '#2D2715', color: isAdded ? '#2D2715' : '#D9D9D9' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    {isAdded ? <FaCheck size={24} /> : <FiPlus size={24} />}
                    <span>{isAdded ? 'Added' : 'Add to Watchlist'}</span>
                </div>
            </button>
        </div>
    </div>
);

export default function DiscoverDashboard(props) {
    const {
        onOpenFilm,
        onAddToList,
        onWatchTrailer,
        addedIds,
        searchQuery,
        onSearchChange,
        activeTab,
        onTabChange
    } = props;

    const [activeGenre, setActiveGenre] = useState('All');
    const [activePlatform, setActivePlatform] = useState('All');
    const [activeTime, setActiveTime] = useState('All');
    const [activeSort, setActiveSort] = useState('All');
    const [trendingAll, setTrendingAll] = useState(props.trendingAll || []);
    const [providers, setProviders] = useState([]);
    const [allFilms, setAllFilms] = useState(props.allFilms || []);
    const [upcomingShows, setUpcomingShows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getTrending(),
            getProviders(),
            getFilms(),
            getUpcomingTv()
        ]).then(([trending, fetchedProviders, fetchedFilms, upcoming]) => {
            setTrendingAll(trending);
            setProviders(fetchedProviders.slice(0, 8));
            setAllFilms(fetchedFilms);
            setUpcomingShows(upcoming);
            setLoading(false);
        }).catch(err => {
            console.error("Error fetching discover data:", err);
            setLoading(false);
        });
    }, []);

    const filteredFilms = React.useMemo(() => {
        return allFilms.filter(f => {
            const gMatch = activeGenre === 'All' || (f.genre || '').includes(activeGenre);
            const pMatch = activePlatform === 'All' || (f.streamers || []).includes(activePlatform);
            return gMatch && pMatch;
        });
    }, [allFilms, activeGenre, activePlatform]);

    const displayFilms = filteredFilms.length > 0 ? filteredFilms : trendingAll;

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

                .wl-grid-area { flex: 1; overflow-y: auto; }

                .wl-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(284px, 1fr));
                    gap: 25px;
                }

                .wl-card {
                    background: #000;
                    border-radius: 32px;
                    overflow: hidden;
                    border: 1px solid #FFFFFF33;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.25s;
                    padding: 26px;
                }
                .wl-card:hover { box-shadow: 0 20px 50px rgba(0,0,0,0.75); border-color: rgba(255,255,255,0.2); transform: translateY(-5px); }

                .wl-seen-btn {
                    width: 100%; padding: 12px 0; border-radius: 999px; border: 1px solid #FFFFFF33;
                    background: #008633; color: #fff; font-weight: 700; font-size: 16px;
                    cursor: pointer; transition: all 0.2s;
                }
                .wl-seen-btn:hover { background: #16a34a; }
                .wl-seen-btn.watched { background: rgba(74,222,128,0.1); color: #4ade80; border-color: rgba(74,222,128,0.2); }

                .time-filter-bar {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    background: #000;
                    border: 1px solid #FFFFFF33;
                    border-radius: 20px;
                    margin-bottom: 20px;
                    height: 70px;
                    padding: 0 31px;
                }
                .time-pill {
                    flex: 1;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    font-weight: 400;
                    color: #fff;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.3s;
                }
                .time-pill.active {
                    color: #E0C36A;
                    font-weight: 700;
                    position: relative;
                }
                .time-pill.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: #fbbf24;
                }

                .fade-in { animation: fadeIn 0.5s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />

            <div className="wl-root fade-in" style={{ paddingTop: '20px' }}>

                {/* ══ SIDEBAR ══ */}
                <aside className="wl-sidebar">
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
                            {GENRES.map(g => (
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
                                    active={activePlatform === s.name}
                                    onClick={() => setActivePlatform(s.name)}
                                />
                            ))}
                        </div>
                    </div>
                </aside>

                {/* ══ MAIN GRID AREA ══ */}
                <div className="wl-grid-area">
                    {/* Top Time Filter Bar */}
                    <div className="time-filter-bar">
                        {TIME_FILTERS.map(t => (
                            <div
                                key={t}
                                className={`time-pill ${activeTime === t ? 'active' : ''}`}
                                onClick={() => setActiveTime(t)}
                            >
                                {t}
                            </div>
                        ))}
                    </div>

                    {/* Grid of Movie Cards */}
                    {displayFilms.length > 0 ? (
                        <div className="wl-grid">
                            {displayFilms.map(film => (
                                <DiscoverCard
                                    key={film.id}
                                    film={film}
                                    isAdded={addedIds.includes(film.id)}
                                    onAdd={onAddToList}
                                    onClick={() => onOpenFilm(film)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '80px 0', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
                            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'rgba(255,255,255,0.6)' }}>No results found</h3>
                            <p style={{ fontSize: 15 }}>Try adjusting your filters to find more great content.</p>
                        </div>
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
}
