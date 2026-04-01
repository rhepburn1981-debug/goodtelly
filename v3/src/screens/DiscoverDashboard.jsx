import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { FaSearch, FaPlay, FaPlus, FaCheck, FaStar, FaChevronRight } from 'react-icons/fa';

// Filters Data
const FILTERS = {
    genres: ['All', 'Drama', 'Crime', 'History', 'Thriller', 'Action', 'Sci-Fi'],
    platforms: ['All Services', 'Netflix', 'Paramount+', 'Apple TV+', 'Prime', 'Hulu'],
    time: ['This Week', 'This Month', 'This Year', 'All Time']
};

export default function DiscoverDashboard(props) {
    const {
        trendingAll = [],
        onOpenFilm,
        onAddToList,
        addedIds,
        searchQuery,
        onSearchChange,
        activeTab,
        onTabChange
    } = props;

    const [activeGenre, setActiveGenre] = useState('All');
    const [activePlatform, setActivePlatform] = useState('All Services');
    const [activeTime, setActiveTime] = useState('This Week');

    const heroFilm = trendingAll[0] || {
        id: 1,
        title: 'Dune: Part Two',
        year: 2024,
        genre: 'Action / Sci-Fi',
        rating: '9.0',
        poster: '/branding/trend2.png'
    };

    const displayFilms = trendingAll.slice(1, 10);

    return (
        <DashboardLayout
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            activeTab={activeTab}
            onTabChange={onTabChange}
        >
            <style dangerouslySetInnerHTML={{
                __html: `
                .glass-card {
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
                }
                .filter-pill {
                    padding: 10px 24px;
                    border-radius: 100px;
                    font-size: 14px;
                    font-weight: 700;
                    white-space: nowrap;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .filter-pill.active {
                    background: rgba(251, 191, 36, 0.15);
                    color: #fbbf24;
                    border: 1px solid rgba(251, 191, 36, 0.5);
                    box-shadow: 0 4px 15px rgba(251, 191, 36, 0.2);
                }
                .filter-pill.inactive {
                    background: rgba(255, 255, 255, 0.03);
                    color: rgba(255, 255, 255, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .hero-card {
                    position: relative;
                    border-radius: 24px;
                    overflow: hidden;
                    aspect-ratio: 21 / 6;
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.6);
                    transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                .list-item-card {
                    position: relative;
                    display: flex;
                    gap: 20px;
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    padding: 16px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .add-btn-check {
                    background: rgba(74, 222, 128, 0.15);
                    color: #4ade80;
                    border: 1px solid rgba(74, 222, 128, 0.3);
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .fade-in { animation: fadeIn 0.5s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />

            <div style={{ position: 'relative', zIndex: 1, paddingBottom: 100, paddingTop: 100 }} className="fade-in">

                <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 36, filter: 'drop-shadow(0 0 10px rgba(255,100,0,0.5))' }}>🔥</span>
                    <h1 style={{ fontSize: 38, fontWeight: 900, margin: 0, letterSpacing: -1, color: '#fff' }}>
                        What's Trending
                    </h1>
                </div>

                {/* Filters Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 56 }}>
                    {/* Row 1: Time */}
                    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, alignItems: 'center' }} className="no-scrollbar">
                        <div style={{ minWidth: 100, color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Time:</div>
                        {FILTERS.time.map(t => (
                            <div key={t} className={`filter-pill ${activeTime === t ? 'active' : 'inactive'}`} onClick={() => setActiveTime(t)}>{t}</div>
                        ))}
                    </div>

                    {/* Row 2: Services */}
                    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, alignItems: 'center' }} className="no-scrollbar">
                        <div style={{ minWidth: 100, color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Services:</div>
                        {FILTERS.platforms.map(p => (
                            <div key={p} className={`filter-pill ${activePlatform === p ? 'active' : 'inactive'}`} onClick={() => setActivePlatform(p)}>{p}</div>
                        ))}
                    </div>

                    {/* Row 3: Genre */}
                    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, alignItems: 'center' }} className="no-scrollbar">
                        <div style={{ minWidth: 100, color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Genre:</div>
                        {FILTERS.genres.map(g => (
                            <div key={g} className={`filter-pill ${activeGenre === g ? 'active' : 'inactive'}`} onClick={() => setActiveGenre(g)}>{g}</div>
                        ))}
                    </div>
                </div>

                {/* Hero Trending Section */}
                <div className="hero-card" style={{ marginBottom: 48 }} onClick={() => onOpenFilm(heroFilm)}>
                    <img src={heroFilm.poster_url} className="hero-bg" alt="Hero" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,12,0.95) 0%, rgba(10,10,12,0.4) 60%, transparent 100%)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,12,0.9) 0%, transparent 60%)' }} />

                    <div style={{ position: 'relative', zIndex: 1, padding: '40px 60px', width: '60%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div style={{ background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)', color: '#000', padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 900, marginBottom: 20, letterSpacing: 1 }}>
                            #1 TRENDING
                        </div>
                        <h1 style={{ fontSize: 56, fontWeight: 900, color: '#fff', margin: '0 0 16px', letterSpacing: -1 }}>{heroFilm.title}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 600 }}>{heroFilm.year}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <button className="play-btn" style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                                <FaPlay size={24} style={{ marginLeft: 4 }} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onAddToList(heroFilm); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10, padding: '16px 32px', borderRadius: 100,
                                    background: addedIds.includes(heroFilm.id) ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255,255,255,0.05)',
                                    color: addedIds.includes(heroFilm.id) ? '#4ade80' : '#fff',
                                    border: addedIds.includes(heroFilm.id) ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(255,255,255,0.2)',
                                    fontSize: 16, fontWeight: 800, cursor: 'pointer'
                                }}
                            >
                                {addedIds.includes(heroFilm.id) ? <FaCheck /> : <FaPlus />}
                                {addedIds.includes(heroFilm.id) ? 'Added' : 'Watchlist'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Ranked List */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {displayFilms.map((item, idx) => (
                            <div key={item.id} className="list-item-card" onClick={() => onOpenFilm(item)}>
                                <div style={{ position: 'relative', width: 90, height: 130, borderRadius: 12, overflow: 'hidden', flexShrink: 0, zIndex: 1 }}>
                                    <img src={item.poster_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ position: 'absolute', top: -10, left: 110, fontSize: 130, fontWeight: 900, color: 'rgba(255,255,255,0.04)', pointerEvents: 'none', zIndex: 0, lineHeight: 1 }}>
                                    {idx + 2}
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1 }}>
                                    <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>{item.title}</h3>
                                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', margin: '0' }}>{item.year}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', zIndex: 1 }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onAddToList(item); }}
                                        className={addedIds.includes(item.id) ? 'add-btn-check' : 'add-btn-hover'}
                                        style={{
                                            width: 48, height: 48, borderRadius: '50%',
                                            background: addedIds.includes(item.id) ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255,255,255,0.05)',
                                            color: addedIds.includes(item.id) ? '#4ade80' : '#fff',
                                            border: addedIds.includes(item.id) ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                        }}
                                    >
                                        {addedIds.includes(item.id) ? <FaCheck size={18} /> : <FaPlus size={18} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <div className="glass-card" style={{ padding: 28 }}>
                            <h4 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 20px' }}>Trending Categories</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {['Sci-Fi Hits', 'Oscar Winners', 'Indie Gems'].map(cat => (
                                    <div key={cat} style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.8)', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                                        {cat} <FaChevronRight size={10} style={{ alignSelf: 'center' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
