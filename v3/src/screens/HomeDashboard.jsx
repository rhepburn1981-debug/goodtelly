import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getTrending, getWatchlistRecent, getUpcomingTv } from '../api/films';
import { FaPlay, FaPlus, FaStar, FaUserFriends, FaChevronRight } from 'react-icons/fa';
import { TiStarFullOutline } from "react-icons/ti";
import { HiPlus } from "react-icons/hi";
import { RiPlayLargeFill } from "react-icons/ri";
import { IoCloseOutline } from "react-icons/io5";
import { IoMdStar } from "react-icons/io";
import { FiChevronRight } from "react-icons/fi";

const FALLBACK_RECENT = [
    { id: 'f1', title: 'Saipan', year: 2026, poster_url: '/branding/poster3.png' },
    { id: 'f2', title: 'The Teacher', year: 2026, poster_url: '/branding/poster2.png' },
    { id: 'f3', title: 'Beyond Paradise', year: 2026, poster_url: '/branding/poster1.png' },
    { id: 'f4', title: 'The Capture', year: 2026, poster_url: '/branding/trend1.png' },
    { id: 'f5', title: 'GOAT', year: 2026, poster_url: '/branding/poster4.png' },
];

const NavShortcut = ({ icon: Icon, title, subtitle, iconColor, onClick, bgColor, borderColor }) => (
    <div onClick={onClick} style={{
        display: 'flex', alignItems: 'center', gap: 28, padding: '20px 25px',
        background: bgColor || '#A09E9F',
        border: `1px solid ${borderColor || 'rgba(255, 255, 255, 0.1)'}`,
        borderRadius: '18px', cursor: 'pointer', width: '100%',
        backdropFilter: 'blur(20px)',
        transition: 'all 0.2s ease',
    }}>
        <div style={{
            width: 45, height: 44, borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
            <Icon size={32} color={iconColor || "#fff"} />
        </div>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '3px', letterSpacing: '-0.3px' }}>{title}</div>
            <div style={{ fontSize: '14px', color: '#A09E9F', fontWeight: '400' }}>{subtitle}</div>
        </div>
        <FiChevronRight size={20} color="rgba(255, 255, 255, 0.6)" />
    </div>
);

const FeatureCard = ({ rec, onAddToList, onWatchTrailer, onDismiss }) => {
    const displayRec = rec || {
        id: 'terminator-rec',
        title: 'The Terminator',
        year: 1984,
        poster_url: '/branding/terminator_poster.png',
        backdrop_url: '/branding/bg-1.jpg',
        rating: 4.5,
        genre: 'Sci-Fi/Action'
    };

    const trailerUrl = displayRec.trailer_url || displayRec.trailerUrl || 'https://www.youtube.com/watch?v=k64P4l2Wmeg';

    return (
        <div style={{
            position: 'relative',
            // flex: 1,
            width: '100%',
            // minHeight: '230px',
            borderRadius: '20px',
            // overflow: 'hidden',
            border: '1px solid #FFFFFF33',
            cursor: 'pointer',
            background: 'rgba(23, 23, 23, 0.4)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            // display: 'flex''
            padding: '25px',
        }} onClick={() => onWatchTrailer && onWatchTrailer(trailerUrl)}>
            <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(0deg, rgba(0, 0, 0, 0.74), rgba(0, 0, 0, 0.74)), url("${displayRec.backdrop_url || displayRec.poster_url}")`,
                backgroundSize: '100%', backgroundPosition: 'center',
                opacity: 1, zIndex: 0, backgroundRepeat: 'no-repeat', borderRadius: '20px'
            }} />

            <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', gap: '20px' }}>
                <div style={{ width: '135px', height: '200px', borderRadius: '12.5px', overflow: 'hidden', flexShrink: 0, border: '1px solid #FFFFFF33' }}>
                    <img src={displayRec.poster_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '14px', color: '#E2C367', fontWeight: '600', textTransform: 'capitalize', marginBottom: '10px' }}>FREDDY'S Recommending</div>
                    <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#fff', margin: '0 0 10px', letterSpacing: '-0.4px' }}>{displayRec.title}</h2>

                    <div style={{ display: 'flex', gap: '3px', color: '#ffd700', fontSize: '32px', marginBottom: '10px' }}>
                        {Array(4).fill(0).map((_, i) => <span key={i} style={{ display: 'flex', alignItems: 'center' }}><TiStarFullOutline /></span>)}
                        <span style={{ color: '#727272', display: 'flex', alignItems: 'center' }}><TiStarFullOutline /></span>
                    </div>

                    <div style={{ fontSize: '14px', color: '#A09E9F', marginBottom: '10px', fontWeight: '600' }}>
                        {displayRec.year} • {displayRec.genre}
                    </div>

                    <p style={{ fontSize: '13px', color: '#fff', lineHeight: '1.4', marginBottom: '20px' }}>
                        hey, you'll love this.
                    </p>

                    {/* <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={(e) => { e.stopPropagation(); onWatchTrailer && onWatchTrailer(trailerUrl); }}
                            style={{
                                padding: '0 24px', height: '44px', borderRadius: '22px', background: '#2979ff',
                                color: '#fff', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M8 5v14l11-7z" /></svg>
                            Watch Now
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddToList && onAddToList(displayRec); }}
                            style={{
                                padding: '0 24px', height: '44px', borderRadius: '22px', background: 'rgba(30, 28, 20, 0.6)',
                                color: '#c5a36e', border: '1px solid #c5a36e66', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <span style={{ fontSize: '20px', marginBottom: '2px' }}>+</span>
                            Add to Watchlist
                        </button>
                    </div> */}
                </div>

                <div onClick={(e) => { e.stopPropagation(); onDismiss && onDismiss(); }} style={{
                    position: 'absolute', top: '16px', right: '16px', width: '36px', height: '36px', borderRadius: '50%',
                    background: '#353639', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>
                    <span style={{ color: '#fff', display: 'flex', alignItems: 'center' }}><IoCloseOutline size={34} /></span>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', position: 'relative', marginTop: '10px' }}>
                <button
                    onClick={(e) => { e.stopPropagation(); onWatchTrailer && onWatchTrailer(trailerUrl); }}
                    style={{
                        padding: '0 24px', height: '44px', borderRadius: '22px', background: '#3C81C8',
                        color: '#D9D9D9', fontWeight: '600', fontSize: '15px', cursor: 'pointer', border: '1px solid #727272',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', maxWidth: '275px', width: '100%'
                    }}
                >
                    <RiPlayLargeFill size={24} />
                    Watch Now
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onAddToList && onAddToList(displayRec); }}
                    style={{
                        padding: '0 24px', height: '44px', borderRadius: '22px', background: '#2D2715',
                        color: '#D9D9D9', border: '1px solid #c5a36e66', fontWeight: '700', fontSize: '14px', cursor: 'pointer', justifyContent: 'center',
                        display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '275px', width: '100%'
                    }}
                >
                    <HiPlus size={24} />
                    Add to Watchlist
                </button>
            </div>
        </div>
    );
};

const HorizontalScroller = ({ children }) => (
    <div style={{ display: 'flex', gap: 25, overflowX: 'auto', paddingBottom: 24, }} className="no-scrollbar">
        {children}
    </div>
);

// const TrendingItem = ({ num, img, platform, label, pColor, onClick }) => (
//     <div onClick={onClick} className="hover-card" style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, width: 160, minWidth: 160 }}>
//         <img src={img} alt={label} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} />
//         <div style={{
//             position: 'absolute', top: 0, left: 0, background: '#e50914', padding: '4px 10px',
//             fontSize: 14, fontWeight: 900, borderBottomRightRadius: 8, boxShadow: '2px 2px 10px rgba(0,0,0,0.5)'
//         }}>{num}</div>
//         <div className="hover-overlay" style={{
//             position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0,
//             display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, transition: 'opacity 0.2s ease', zIndex: 2
//         }}>
//             <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaPlay size={14} style={{ marginLeft: 3 }} /></div>
//             <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaPlus size={14} /></div>
//         </div>
//         <div style={{
//             position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 12px 12px',
//             background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)',
//             display: 'flex', flexDirection: 'column', gap: 2, zIndex: 1
//         }}>
//             <span style={{ fontSize: 11, fontWeight: 900, color: pColor || '#fff', letterSpacing: 0.5 }}>{platform}</span>
//             <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
//         </div>
//     </div>
// );

const StandardCard = ({ img, label, year, platform, onClick }) => {
    const renderPlatformLogo = () => {
        if (platform === 'netflix') return <img src="/branding/netflix.png" alt="Netflix" style={{ width: '18px', height: 'auto', objectFit: 'contain' }} />;
        if (platform === 'apple') return <img src="/branding/I-tv.png" alt="Apple TV" style={{ width: '38px', height: 'auto', objectFit: 'contain' }} />;
        if (platform === 'hbo') return <img src="/branding/hbo.png" alt="HBO" style={{ width: '40px', height: 'auto', objectFit: 'contain' }} />;
        return null;
    };

    return (
        <div onClick={onClick} style={{ cursor: 'pointer', flexShrink: 0, maxWidth: '185px', }}>
            <div className="hover-card" style={{ position: 'relative', borderRadius: '18px', overflow: 'hidden', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.08)', height: '260px' }}>
                <img src={img} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {platform && (
                    <div style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: '56px', height: '70px',
                        background: 'rgba(0,0,0,0.85)',
                        borderTopLeftRadius: '28px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 2
                    }}>
                        {renderPlatformLogo()}
                    </div>
                )}
            </div>
            <div style={{ padding: '0 4px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</h4>
                <p style={{ fontSize: '16px', color: '#727272', margin: 0 }}>{year}</p>
            </div>
        </div>
    );
};

const RankedPoster = ({ num, img, title, year, platform, onClick }) => {
    const renderPlatformLogo = () => {
        if (platform === 'netflix') return <img src="/branding/netflix.png" alt="Netflix" style={{ width: '18px', height: 'auto', objectFit: 'contain' }} />;
        if (platform === 'apple') return <img src="/branding/I-tv.png" alt="Apple TV" style={{ width: '38px', height: 'auto', objectFit: 'contain' }} />;
        if (platform === 'hbo') return <img src="/branding/hbo.png" alt="HBO" style={{ width: '40px', height: 'auto', objectFit: 'contain' }} />;
        return null;
    };

    return (
        <div onClick={onClick} style={{ cursor: 'pointer', flexShrink: 0, maxWidth: '185px', }}>
            <div style={{ position: 'relative', borderRadius: '18px', overflow: 'hidden', marginBottom: '10px', border: '1px solid #FFFFFF33', height: '260px' }}>
                <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(151.67deg, #000000 16.51%, rgba(0, 0, 0, 0) 55.9%)', zIndex: 1 }} />
                <div style={{
                    position: 'absolute', top: '10px', left: '10px', fontSize: '40px', fontWeight: '900',
                    color: '#E0C36A', WebkitTextStroke: '1px rgba(255,255,255,0.3)',
                    lineHeight: 1, zIndex: 1, pointerEvents: 'none', letterSpacing: '-2px',
                    textShadow: '0 0 20px rgba(0,0,0,0.5)'
                }}>
                    {num}
                </div>
                {platform && (
                    <div style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: '56px', height: '70px',
                        background: 'rgba(0,0,0,0.85)',
                        borderTopLeftRadius: '28px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 2,
                    }}>
                        {renderPlatformLogo()}
                    </div>
                )}
            </div>
            <div style={{ padding: '0 4px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h4>
                <p style={{ fontSize: '16px', color: '#727272', margin: 0 }}>{year}</p>
            </div>
        </div>
    );
};

const OnTVCard = ({ img, title, date, provider, onClick }) => (
    <div onClick={onClick} style={{ cursor: 'pointer', flexShrink: 0, width: 462 }}>
        <div className="hover-card" style={{ position: 'relative', overflow: 'hidden', marginBottom: '10px', }}>
            <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ padding: '0 4px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', margin: '0 0 10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h4>
                <p style={{ fontSize: '14px', color: '#727272', margin: 0 }}>{date}</p>
            </div>
            {provider && (
                <div style={{
                    padding: '8px 16px',
                    background: '#FFFFFF33', borderRadius: '100px',
                    fontSize: '16px', fontWeight: '600', color: '#fff'
                }}>
                    {provider}
                </div>
            )}
        </div>
    </div>
);

const ContinueCard = ({ img, title, timeLeft, progress, onClick }) => (
    <div onClick={onClick} className="hover-card" style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, width: 260, minWidth: 260, background: '#141416', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
            <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaPlay size={14} color="#fff" style={{ marginLeft: 3 }} />
            </div>
            {/* Progress Bar overlaying the bottom of the image */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.2)' }}>
                <div style={{ height: '100%', background: '#e50914', width: `${progress}%` }} />
            </div>
        </div>
        <div style={{ padding: '12px 14px' }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h4>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{timeLeft} remaining</p>
        </div>
    </div>
);

const FriendAvatar = ({ name, movie, active, onClick }) => (
    <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', width: 64, flexShrink: 0 }} title={`${name} is watching ${movie}`}>
        <div style={{
            position: 'relative', width: 56, height: 56, borderRadius: '50%', padding: 2,
            background: active ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' : 'rgba(255,255,255,0.1)'
        }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '2px solid #0f0f12' }}>
                <img src={`https://i.pravatar.cc/100?u=${name.replace(/ /g, '')}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.8)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
            {name.split(' ')[0]}
        </span>
    </div>
);

export default function HomeDashboard(props) {
    const {
        currentUser,
        recommendations,
        friends,
        onOpenFilm,
        onAddToList,
        onWatchTrailer,
        onDismissRec,
        addedIds,
        onTabChange
    } = props;

    const [trendingNow, setTrendingNow] = useState(props.trendingAll || []);
    const [upcomingShows, setUpcomingShows] = useState(props.upcomingTv || []);
    const [watchlistRecent, setWatchlistRecent] = useState([]);
    const [loading, setLoading] = useState(!props.trendingAll?.length);

    // Sync from props (fixes refresh issue)
    useEffect(() => {
        if (props.trendingAll?.length) setTrendingNow(props.trendingAll);
        if (props.upcomingTv?.length) setUpcomingShows(props.upcomingTv);
    }, [props.trendingAll, props.upcomingTv]);

    useEffect(() => {
        setLoading(true);
        // Independent fetches for better resilience
        getTrending().then(setTrendingNow).catch(() => { });
        getUpcomingTv().then(setUpcomingShows).catch(() => { });
        getWatchlistRecent().then(data => {
            if (data && data.length > 0) setWatchlistRecent(data);
            else setWatchlistRecent(FALLBACK_RECENT);
        }).catch(() => {
            setWatchlistRecent(FALLBACK_RECENT);
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    return (
        <DashboardLayout
            searchQuery={props.searchQuery}
            onSearchChange={props.onSearchChange}
            activeTab={props.activeTab}
            onTabChange={onTabChange}
        >
            <style dangerouslySetInnerHTML={{
                __html: `
                .hover-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
                .hover-card:hover { transform: scale(1.05); box-shadow: 0 20px 40px rgba(0,0,0,0.5); z-index: 10; }
                .hover-card:hover .hover-overlay { opacity: 1 !important; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
            <div style={{ position: 'relative', zIndex: 1 }}>

                <div style={{ marginBottom: 35, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h1 style={{ fontSize: 30, fontWeight: 600, margin: 0, letterSpacing: -0.5 }}>
                        Welcome back, {currentUser?.display_name || currentUser?.username || 'User'}
                    </h1>
                </div>
                {/* FEATURED: Real Friend Recommendation pair style */}
                {recommendations && recommendations.length > 0 && (
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '25px', overflowX: 'auto', paddingBottom: '10px' }} className="no-scrollbar">
                        {recommendations.slice(0, 2).map((rec, idx) => (
                            <FeatureCard
                                key={rec.id || idx}
                                rec={rec}
                                onAddToList={onAddToList}
                                onWatchTrailer={onWatchTrailer}
                                onDismiss={() => onDismissRec && onDismissRec(rec.id)}
                            />
                        ))}
                    </div>
                )}
                <div style={{ marginBottom: 25, display: 'flex', gap: 24, padding: '0 80px' }}>
                    <NavShortcut
                        icon={IoMdStar}
                        title="My Watchlist"
                        subtitle="Your saved films and shows to watch"
                        bgColor="rgba(60, 129, 200, 0.15)"
                        borderColor="#3C81C8"
                        iconColor="#fff"
                        onClick={() => onTabChange && onTabChange('list')}
                    />
                    <NavShortcut
                        icon={FaUserFriends}
                        title="Friends Watchlist"
                        subtitle="See what your friends are watching"
                        iconColor="#727272"
                        bgColor="rgba(23, 23, 23, 0.4)"
                        borderColor="rgba(255, 255, 255, 0.1)"
                        onClick={() => onTabChange && onTabChange('friends')}
                    />
                </div>


                {/* Redesigned Sections Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '10px' }}>

                    {/* What's NEW (Ranked) */}
                    {trendingNow.length > 0 && (
                        <div style={{
                            background: '#352F21',
                            borderRadius: '20px', padding: '25px',
                            border: '1px solid #E2C36780',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden'
                        }}>
                            {/* <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.03), transparent 70%)', pointerEvents: 'none' }} /> */}
                            <div style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '10px', position: 'relative', padding: '10px' }}>Whats New
                            </div>
                            <HorizontalScroller>
                                {trendingNow.slice(0, 8).map((show, idx) => {
                                    const platforms = ['netflix', null, 'apple', 'hbo', null, null, null, null];
                                    return (
                                        <RankedPoster
                                            key={show.id}
                                            num={idx + 1}
                                            img={show.poster_url}
                                            title={show.title || show.name}
                                            year={show.year || (show.first_air_date ? show.first_air_date.split('-')[0] : '2025')}
                                            platform={platforms[idx]}
                                            onClick={() => onOpenFilm(show)}
                                        />
                                    );
                                })}
                            </HorizontalScroller>
                        </div>
                    )}

                    {/* What WatchMates users are watching right now */}
                    {(watchlistRecent.length > 0) && (
                        <div style={{
                            background: '#000000', borderRadius: '20px', padding: '25px',
                            border: '1px solid #FFFFFF33',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '10px', padding: '10px' }}>Trending with WatchMates Users
                            </div>
                            <HorizontalScroller>
                                {watchlistRecent.map((show, idx) => {
                                    const platforms = [null, 'netflix', 'apple', 'hbo', null, null, null, null];
                                    return (
                                        <StandardCard
                                            key={show.id}
                                            img={show.poster_url}
                                            label={show.title || show.name}
                                            year={show.year || '2024'}
                                            platform={platforms[idx]}
                                            onClick={() => onOpenFilm(show)}
                                        />
                                    );
                                })}
                            </HorizontalScroller>
                        </div>
                    )}

                    {/* On TV this week */}
                    {upcomingShows.length > 0 && (
                        <div style={{
                            background: '#000000', borderRadius: '20px', padding: '25px',
                            border: '1px solid #FFFFFF33',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{ fontSize: '20px', fontWeight: '600', color: '#fff', marginBottom: '10px', padding: '10px' }}>Whats on this week</div>
                            <HorizontalScroller>
                                {upcomingShows.slice(0, 3).map((show, idx) => {
                                    const designData = [
                                        { title: 'EFL Highlights', date: '11th Mar', provider: 'Skysports', img: '/branding/on-week1.png' },
                                        { title: 'Football Focus', date: '12th Mar', provider: 'BBC sports', img: '/branding/on-week2.png' },
                                        { title: 'The Capture', date: '12th Mar', provider: 'Peacock', img: '/branding/on-week3.png' }
                                    ];
                                    const item = designData[idx] || {};
                                    return (
                                        <OnTVCard
                                            key={show.id}
                                            img={item.img || show.image}
                                            title={item.title || show.name}
                                            date={item.date || (show.airdate ? new Date(show.airdate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '11th Mar')}
                                            provider={item.provider || show.network?.name || 'BBC'}
                                            onClick={() => onOpenFilm({ ...show, title: show.name, poster_url: show.image, _isExternal: true })}
                                        />
                                    );
                                })}
                            </HorizontalScroller>
                        </div>
                    )}

                    {/* Friends Activity */}
                    {friends && friends.length > 0 && (
                        <div style={{
                            background: 'rgba(15, 15, 15, 0.4)', borderRadius: '24px', padding: '24px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <div style={{ fontSize: '20px', fontWeight: '600', color: '#fff' }}>Friends Activity</div>
                            </div>
                            <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 16 }} className="no-scrollbar">
                                {friends.map(friend => (
                                    <FriendAvatar
                                        key={friend.username}
                                        name={friend.display_name || friend.username}
                                        avatar={friend.avatar}
                                        active={false}
                                        onClick={() => onTabChange && onTabChange('friends')}
                                    />
                                ))}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', width: 64, flexShrink: 0 }} onClick={() => onTabChange('friends')}>
                                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <FaPlus size={20} />
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Add</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
}
