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
    const [searchVal, setSearchVal] = useState(props.searchQuery || '');
    const [activeGenre, setActiveGenre] = useState('All');
    const [activePlatform, setActivePlatform] = useState('All Services');
    const [activeTime, setActiveTime] = useState('This Week');

    // Quick mock data tracking added state locally for UI demo
    const [addedIds, setAddedIds] = useState([2, 5]);

    const handleToggleAdd = (id, e) => {
        e.stopPropagation();
        if (addedIds.includes(id)) {
            setAddedIds(addedIds.filter(i => i !== id));
        } else {
            setAddedIds([...addedIds, id]);
        }
    };

    return (
        <DashboardLayout
            searchQuery={props.searchQuery}
            onSearchChange={props.onSearchChange}
            activeTab={props.activeTab}
            onTabChange={props.onTabChange}
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
                .filter-pill.inactive:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.05);
                }
                .main-search-input {
                    width: 100%;
                    padding: 24px 24px 24px 64px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 100px;
                    font-size: 18px;
                    color: #fff;
                    outline: none;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                    transition: all 0.3s ease;
                }
                .main-search-input:focus {
                    background: rgba(255,255,255,0.06);
                    border-color: rgba(255,255,255,0.3);
                    box-shadow: 0 15px 50px rgba(0,0,0,0.6);
                }
                .hero-card {
                    position: relative;
                    border-radius: 24px;
                    overflow: hidden;
                    aspect-ratio: 21 / 9;
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.6);
                    transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                .hero-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 40px 80px rgba(0,0,0,0.8), 0 0 40px rgba(255,255,255,0.1);
                }
                .hero-card:hover .hero-bg {
                    transform: scale(1.05);
                }
                .hero-card:hover .play-btn {
                    transform: scale(1.1);
                    background: #fbbf24 !important;
                    color: #000 !important;
                    box-shadow: 0 0 30px rgba(251, 191, 36, 0.6) !important;
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
                .list-item-card:hover {
                    transform: scale(1.02) translateX(4px);
                    background: rgba(255, 255, 255, 0.07);
                    border-color: rgba(255, 255, 255, 0.2);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                    z-index: 10;
                }
                .list-item-card:hover .hover-glow {
                    opacity: 1 !important;
                }
                .add-btn-hover:hover {
                    background: rgba(255,255,255,0.15) !important;
                    transform: scale(1.1);
                }
                .add-btn-check {
                    background: rgba(74, 222, 128, 0.15);
                    color: #4ade80;
                    border: 1px solid rgba(74, 222, 128, 0.3);
                }
                .add-btn-check:hover {
                    background: rgba(74, 222, 128, 0.25);
                    transform: scale(1.1);
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .fade-in { animation: fadeIn 0.5s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />

            {/* Cinematic Background Elements */}
            <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.05) 0%, transparent 60%)', filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '-10%', left: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 60%)', filter: 'blur(120px)', zIndex: 0, pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', paddingBottom: 100, paddingTop: 24 }} className="fade-in">

                <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 36, filter: 'drop-shadow(0 0 10px rgba(255,100,0,0.5))' }}>🔥</span>
                    <h1 style={{ fontSize: 38, fontWeight: 900, margin: 0, letterSpacing: -1, color: '#fff' }}>
                        What's Trending with Reel Users
                    </h1>
                </div>

                {/* Filters Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48 }}>
                    {/* Time */}
                    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
                        <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', marginRight: 12, letterSpacing: 1 }}>Time:</div>
                        {FILTERS.time.map(t => (
                            <div key={t} className={`filter-pill ${activeTime === t ? 'active' : 'inactive'}`} onClick={() => setActiveTime(t)}>{t}</div>
                        ))}
                    </div>

                    {/* Genres */}
                    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
                        <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', marginRight: 12, letterSpacing: 1, minWidth: 50 }}>Genre:</div>
                        {FILTERS.genres.map(g => (
                            <div key={g} className={`filter-pill ${activeGenre === g ? 'active' : 'inactive'}`} onClick={() => setActiveGenre(g)}>{g}</div>
                        ))}
                    </div>

                    {/* Platforms */}
                    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
                        <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', marginRight: 12, letterSpacing: 1, minWidth: 50 }}>Watch:</div>
                        {FILTERS.platforms.map(p => (
                            <div key={p} className={`filter-pill ${activePlatform === p ? 'active' : 'inactive'}`} onClick={() => setActivePlatform(p)}>{p}</div>
                        ))}
                    </div>
                </div>

                {/* Hero Trending Section */}
                <div className="hero-card" style={{ marginBottom: 48 }}>
                    <img src="/branding/trend2.png" className="hero-bg" alt="Hero" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(5,5,8,0.95) 0%, rgba(5,5,8,0.7) 40%, rgba(5,5,8,0.1) 100%)', mixBlendMode: 'multiply' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,12,0.95) 0%, rgba(10,10,12,0.4) 60%, transparent 100%)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,12,0.9) 0%, transparent 60%)' }} />

                    <div style={{ position: 'relative', zIndex: 1, padding: '40px 60px', width: '60%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div style={{ background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)', color: '#000', padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 900, marginBottom: 20, letterSpacing: 1, boxShadow: '0 4px 15px rgba(251, 191, 36, 0.3)' }}>
                            #1 THIS WEEK
                        </div>

                        <h1 style={{ fontSize: 56, fontWeight: 900, color: '#fff', margin: '0 0 16px', letterSpacing: -1, textShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
                            Dune: Part Two
                        </h1>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24', fontSize: 18, fontWeight: 800, background: 'rgba(0,0,0,0.4)', padding: '6px 12px', borderRadius: 10, border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                                <FaStar /> 9.0
                            </div>
                            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 600, letterSpacing: 0.5 }}>Action / Sci-Fi &bull; 2024</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <button className="play-btn" style={{
                                width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', color: '#000',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer',
                                transition: 'all 0.3s ease', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                            }}>
                                <FaPlay size={24} style={{ marginLeft: 4 }} />
                            </button>
                            <button
                                onClick={(e) => handleToggleAdd(1, e)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10, padding: '16px 32px', borderRadius: 100,
                                    background: addedIds.includes(1) ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255,255,255,0.05)',
                                    color: addedIds.includes(1) ? '#4ade80' : '#fff',
                                    border: addedIds.includes(1) ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(255,255,255,0.2)',
                                    fontSize: 16, fontWeight: 800, cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = addedIds.includes(1) ? 'rgba(74, 222, 128, 0.25)' : 'rgba(255,255,255,0.15)'}
                                onMouseLeave={e => e.currentTarget.style.background = addedIds.includes(1) ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255,255,255,0.05)'}
                            >
                                {addedIds.includes(1) ? <FaCheck /> : <FaPlus />}
                                {addedIds.includes(1) ? 'Added' : 'Watchlist'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Split Layout: Trending List & Panels */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start' }}>

                    {/* Left side: Ranked List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {[
                            { rank: 2, id: 2, title: 'Fallout', year: 2024, genre: 'Sci-Fi / Action', rating: '8.7', platform: 'PRIME', img: '/branding/trend1.png' },
                            { rank: 3, id: 3, title: 'Shōgun', year: 2024, genre: 'Drama / History', rating: '9.0', platform: 'HULU', img: '/branding/trend3.png' },
                            { rank: 4, id: 4, title: 'The Boys', year: 2022, genre: 'Action / Dark Comedy', rating: '8.7', platform: 'PRIME', img: '/branding/trend5.png' },
                            { rank: 5, id: 5, title: 'Silo', year: 2023, genre: 'Sci-Fi / Thriller', rating: '8.1', platform: 'APPLE TV+', img: '/branding/trend4.png' },
                            { rank: 6, id: 6, title: 'Money Heist', year: 2017, genre: 'Crime / Drama', rating: '8.2', platform: 'NETFLIX', img: '/branding/trend6.png' }
                        ].map((item) => (
                            <div key={item.id} className="list-item-card">
                                <div className="hover-glow" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at left, rgba(255,255,255,0.06) 0%, transparent 60%)', opacity: 0, transition: 'opacity 0.3s ease', pointerEvents: 'none', zIndex: 0 }} />

                                {/* Poster Area with Rank */}
                                <div style={{ position: 'relative', width: 90, height: 130, borderRadius: 12, overflow: 'hidden', flexShrink: 0, zIndex: 1, boxShadow: '0 8px 25px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
                                </div>

                                {/* Rank Number Background Overlay */}
                                <div style={{ position: 'absolute', top: -10, left: 110, fontSize: 130, fontWeight: 900, color: 'rgba(255,255,255,0.04)', pointerEvents: 'none', zIndex: 0, lineHeight: 1, letterSpacing: -5 }}>
                                    {item.rank}
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1, position: 'relative', paddingRight: 20 }}>
                                    <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 6px', letterSpacing: -0.5 }}>{item.title}</h3>
                                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', margin: '0 0 16px', fontWeight: 500 }}>{item.genre} &bull; {item.year}</p>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24', fontSize: 14, fontWeight: 700, background: 'rgba(251, 191, 36, 0.1)', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                                            <FaStar size={12} /> {item.rating}
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)', padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 8, letterSpacing: 0.5, border: '1px solid rgba(255,255,255,0.1)' }}>
                                            {item.platform}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', zIndex: 1 }}>
                                    <button
                                        onClick={(e) => handleToggleAdd(item.id, e)}
                                        className={addedIds.includes(item.id) ? 'add-btn-check' : 'add-btn-hover'}
                                        style={{
                                            width: 48, height: 48, borderRadius: '50%',
                                            background: addedIds.includes(item.id) ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255,255,255,0.05)',
                                            color: addedIds.includes(item.id) ? '#4ade80' : '#fff',
                                            border: addedIds.includes(item.id) ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: addedIds.includes(item.id) ? '0 5px 15px rgba(74, 222, 128, 0.2)' : 'none'
                                        }}
                                    >
                                        {addedIds.includes(item.id) ? <FaCheck size={18} /> : <FaPlus size={18} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right side: Panels */}
                    <div>
                        <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
                            <h4 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 20px', letterSpacing: -0.5 }}>
                                Because you watched...
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.05)' } }}>
                                    <img src="/branding/poster1.png" alt="" style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                                </div>
                                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.05)' } }}>
                                    <img src="/branding/poster2.png" alt="" style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                                </div>
                            </div>
                            <button style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '14px', borderRadius: 12, marginTop: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                                See all
                            </button>
                        </div>

                        <div className="glass-card" style={{ padding: 28 }}>
                            <h4 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 20px', letterSpacing: -0.5 }}>
                                Trending Categories
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {['Mind-Bending Sci-Fi', 'Gritty Crime Dramas', 'Oscar Winners', 'Feel-Good Comedies'].map(cat => (
                                    <div key={cat} style={{
                                        padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 12,
                                        fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.8)', cursor: 'pointer',
                                        border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        transition: 'all 0.2s ease'
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)' }}
                                    >
                                        {cat} <FaChevronRight size={10} style={{ opacity: 0.5 }} />
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
