import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { FaPlay, FaSearch, FaChevronDown, FaTheaterMasks, FaCalendarAlt, FaTv, FaStar, FaArrowRight, FaPlus, FaCheck, FaUsers } from 'react-icons/fa';

// Shared Glass Section Wrapper
const GlassSection = ({ children, style }) => (
    <div style={{
        marginBottom: 24, position: 'relative', overflow: 'hidden',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        padding: '36px 32px',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        ...style
    }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.05), transparent 70%)', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1, animation: 'fadeUp 0.6s ease-out forwards' }}>
            {children}
        </div>
    </div>
);

const SectionTitle = ({ icon, title, subtitle }) => (
    <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>{icon}</span>
            <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, margin: 0 }}>{title}</h2>
        </div>
        {subtitle && <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', margin: '6px 0 0 36px', fontWeight: 500 }}>{subtitle}</p>}
    </div>
);

// 1. Smart Hero
const SmartHero = () => {
    const placeholders = ["Search: Inception", "Search: Breaking Bad", "Search: Sci-Fi Movies", "Search: Tom Cruise"];
    const [placeholder, setPlaceholder] = useState(placeholders[0]);
    useEffect(() => {
        let i = 0;
        const int = setInterval(() => { i = (i + 1) % placeholders.length; setPlaceholder(placeholders[i]); }, 3000);
        return () => clearInterval(int);
    }, []);

    return (
        <div className="search-hero-container" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '24px', position: 'relative', overflow: 'hidden',
            borderRadius: 32, marginBottom: 24,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6)'
        }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: 'url(/branding/terminator_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(20px)', opacity: 0.4 }} />
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'linear-gradient(135deg, rgba(15,15,20,0.95) 0%, rgba(5,5,8,0.8) 100%)' }} />
            <div className="glow-orb" style={{ position: 'absolute', top: '-40%', left: '-10%', width: '60%', height: '140%', background: 'radial-gradient(circle, rgba(0,102,255,0.15), transparent 70%)', filter: 'blur(50px)', zIndex: 0 }} />

            <div style={{ position: 'relative', zIndex: 1, flex: 1, paddingRight: 60 }}>
                <h1 style={{ fontSize: 52, fontWeight: 900, marginBottom: 16, letterSpacing: -1, background: 'linear-gradient(180deg, #FFFFFF 0%, #A0A0B0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Find Your Next Watch
                </h1>
                <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', marginBottom: 40, fontWeight: 500, letterSpacing: 0.5 }}>
                    Search across movies, shows & platforms seamlessly.
                </p>

                <div className="search-input-wrapper hover-glow" style={{
                    display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)',
                    borderRadius: 40, padding: '0 28px', border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(12px)', height: 68, maxWidth: 600
                }}>
                    <FaSearch style={{ color: 'rgba(255,255,255,0.8)', fontSize: 22, marginRight: 18 }} />
                    <input
                        type="text"
                        placeholder={placeholder}
                        style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: 18, outline: 'none', fontWeight: 600, transition: 'all 0.3s ease' }}
                    />
                </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1, width: 280, flexShrink: 0, perspective: 1000, display: 'flex', justifyContent: 'flex-end' }}>
                <div className="hero-poster" style={{
                    width: 220, aspectRatio: '2/3', borderRadius: 20, overflow: 'hidden',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.8), 0 0 40px rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)', transform: 'rotateY(-15deg) rotateX(5deg)', transition: 'all 0.5s ease', transformStyle: 'preserve-3d'
                }}>
                    <img src="/branding/trend2.png" alt="Dune" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: 20 }}>
                        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Dune: Part Two</h3>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--gold-bright)', fontWeight: 700 }}>Trending #1</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 2. Mood Card
const MoodCard = ({ icon, title, bg1, bg2, accent }) => (
    <div className="hover-card mood-card" style={{
        flexShrink: 0, width: 220, height: 140, borderRadius: 16, overflow: 'hidden', position: 'relative', cursor: 'pointer',
        border: `1px solid rgba(255,255,255,0.1)`
    }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
            <img src={bg1} style={{ flex: 1, objectFit: 'cover' }} alt="" />
            <img src={bg2} style={{ flex: 1, objectFit: 'cover', opacity: 0.6 }} alt="" />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${accent}f0 0%, ${accent}60 100%)`, mixBlendMode: 'multiply' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 100%)' }} />

        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <span style={{ fontSize: 32, marginBottom: 12, textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>{icon}</span>
            <span style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, textShadow: '0 4px 10px rgba(0,0,0,0.8)', textAlign: 'center' }}>{title}</span>
        </div>
    </div>
);

// 3. Platform Card
const PlatformVisualCard = ({ logoUrl, gradient, bgImg, invertLogo }) => (
    <div className="platform-card hover-card" style={{
        flexShrink: 0, width: 280, height: 160, borderRadius: 20, background: gradient,
        cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden', position: 'relative'
    }}>
        {bgImg && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${bgImg})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.5, mixBlendMode: 'overlay', filter: 'blur(1px)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.1) 100%)', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', width: '100%', boxSizing: 'border-box' }}>
            <img src={logoUrl} alt="logo" style={{ height: 36, maxWidth: 120, objectFit: 'contain', alignSelf: 'flex-start', filter: invertLogo ? 'invert(1) brightness(10)' : 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }} />
            <div className="platform-explore-text" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 800, color: '#fff', opacity: 0.8 }}>
                Explore Platform <FaArrowRight size={12} />
            </div>
        </div>
    </div>
);

// Filter Bar
const FilterPill = ({ label, active }) => (
    <div className={`filter-pill ${active ? 'active' : ''}`} style={{
        padding: '10px 24px', background: active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
        borderRadius: 30, border: `1px solid ${active ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
        cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        color: active ? '#fff' : 'rgba(255,255,255,0.7)', transition: 'all 0.3s ease', backdropFilter: 'blur(10px)'
    }}>
        {label} <FaChevronDown size={10} style={{ opacity: 0.6 }} />
    </div>
);

// Standard Poster Card
const PosterCard = ({ img, title, rating }) => (
    <div className="hover-card" style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, width: 170, minWidth: 170 }}>
        <img src={img} alt={title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} />
        {rating && (
            <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', padding: '4px 8px', borderRadius: 8, fontSize: 13, fontWeight: 900, color: 'var(--gold-bright)', border: '1px solid rgba(255,215,0,0.3)', display: 'flex', alignItems: 'center', gap: 4, zIndex: 2 }}>
                ★ {rating}
            </div>
        )}
        <div className="hover-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, transition: 'opacity 0.2s ease', zIndex: 2 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaPlay size={14} style={{ marginLeft: 3 }} /></div>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaPlus size={14} /></div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '30px 14px 14px', background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 40%, transparent 100%)', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{title}</span>
        </div>
    </div>
);

// Social Discovery Card
const SocialCard = ({ img, title, friends }) => (
    <div className="hover-card" style={{ position: 'relative', flexShrink: 0, width: 170, minWidth: 170, paddingBottom: 28 }}>
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <img src={img} alt={title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} />
            <div className="hover-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s ease', zIndex: 2 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaPlay size={14} style={{ marginLeft: 3 }} /></div>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)', padding: '20px 12px 10px', zIndex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{title}</span>
            </div>
        </div>
        {/* Social Meta overlapping bottom edge */}
        <div style={{ position: 'absolute', bottom: 10, left: 6, display: 'flex', alignItems: 'center', zIndex: 5 }}>
            <div style={{ display: 'flex' }}>
                {friends.map((f, i) => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=${f}`} style={{ width: 26, height: 26, borderRadius: '50%', border: '2px solid #111', marginLeft: i > 0 ? -12 : 0, boxShadow: '0 2px 5px rgba(0,0,0,0.5)', zIndex: 10 - i }} alt="" />
                ))}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginLeft: 8 }}>{friends.length} friends</span>
        </div>
    </div>
);

const HorizontalScroller = ({ children }) => (
    <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 16, margin: '0 -16px', padding: '0 16px 16px' }} className="no-scrollbar">
        {children}
    </div>
);

export default function DiscoverDashboard(props) {
    return (
        <DashboardLayout searchQuery={props.searchQuery} onSearchChange={props.onSearchChange}>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes floatPanel { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0px); } }
                @keyframes fadeUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }

                .search-hero-container { animation: floatPanel 7s ease-in-out infinite; }

                .hover-card { transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease; }
                .hover-card:hover { transform: scale(1.04) translateY(-4px); box-shadow: 0 25px 50px rgba(0,0,0,0.6); z-index: 10; cursor: pointer; }
                .hover-card:hover .hover-overlay { opacity: 1 !important; }

                .platform-card:hover .platform-explore-text { opacity: 1 !important; transform: translateX(5px); transition: all 0.3s ease; }

                .search-input-wrapper:focus-within { border-color: rgba(255,255,255,0.5) !important; background: rgba(0,0,0,0.8) !important; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
                .hover-glow:focus-within { border-color: rgba(255,255,255,0.5) !important; }

                .mood-card:hover { filter: brightness(1.2) contrast(1.1); }
                .filter-pill:hover { background: rgba(255,255,255,0.1) !important; }

                .sticky-filters::-webkit-scrollbar { display: none; }
                .sticky-filters { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', paddingTop: 32, paddingBottom: 24 }}>

                {/* 1. Smart Hero */}
                <SmartHero />

                {/* 2. Mood Discovery */}
                <GlassSection style={{ padding: '36px 32px 20px' }}>
                    <SectionTitle icon="🧠" title="What are you in the mood for?" subtitle="Discover content based on your current vibe" />
                    <HorizontalScroller>
                        <MoodCard icon="🔥" title="Trending" accent="#E50914" bg1="/branding/trend1.png" bg2="/branding/trend2.png" />
                        <MoodCard icon="😂" title="Feel Good" accent="#F5B041" bg1="/branding/poster4.png" bg2="/branding/trend5.png" />
                        <MoodCard icon="😱" title="Thriller" accent="#7D3C98" bg1="/branding/trend4.png" bg2="/branding/terminator_bg.png" />
                        <MoodCard icon="🚀" title="Sci-Fi" accent="#2E86C1" bg1="/branding/poster1.png" bg2="/branding/terminator_poster.png" />
                        <MoodCard icon="💔" title="Emotional" accent="#117A65" bg1="/branding/trend3.png" bg2="/branding/poster3.png" />
                    </HorizontalScroller>
                </GlassSection>

                {/* 3. Platform Explorer */}
                <GlassSection style={{ padding: '36px 32px 20px' }}>
                    <SectionTitle icon="🎬" title="Explore by Platform" subtitle="Browse content from your favorite services" />
                    <HorizontalScroller>
                        <PlatformVisualCard logoUrl="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" gradient="#E50914" bgImg="/branding/image1.png" />
                        <PlatformVisualCard logoUrl="https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg" gradient="#00A8E1" bgImg="/branding/image2.png" invertLogo />
                        <PlatformVisualCard logoUrl="https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg" gradient="#113CCF" bgImg="/branding/image3.png" invertLogo />
                        <PlatformVisualCard logoUrl="https://upload.wikimedia.org/wikipedia/commons/c/ce/Max_logo.svg" gradient="#5200FF" bgImg="/branding/image5.png" invertLogo />
                    </HorizontalScroller>
                </GlassSection>

                {/* 4. Filter + Results Stacked inside one GlassSection to simulate mini-Netflix UI */}
                <GlassSection style={{ padding: '0px 32px 36px', overflow: 'visible' }}>
                    <div className="sticky-filters" style={{
                        position: 'sticky', top: 0, zIndex: 100,
                        display: 'flex', gap: 12, overflowX: 'auto',
                        padding: '24px 0 24px', margin: '0 -32px 24px',
                        background: 'rgba(5, 5, 8, 0.85)', backdropFilter: 'blur(16px)',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        paddingLeft: 32, paddingRight: 32
                    }}>
                        <FilterPill label="Genre" active />
                        <FilterPill label="Release Year" />
                        <FilterPill label="Platform" />
                        <FilterPill label="Rating" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '24px 16px' }}>
                        {[...Array(12)].map((_, i) => (
                            <PosterCard key={i} img={`/branding/${i % 2 === 0 ? 'poster' : 'trend'}${(i % 4) + 1}.png`} title={`Featured Title ${i + 1}`} rating={(9.5 - (i * 0.1)).toFixed(1)} />
                        ))}
                    </div>
                </GlassSection>

                {/* 5. Curated Rows */}
                <GlassSection style={{ padding: '36px 32px 20px' }}>
                    <SectionTitle icon="⭐" title="Top Rated This Week" />
                    <HorizontalScroller>
                        <PosterCard img="/branding/trend2.png" title="Dune: Part Two" rating="9.1" />
                        <PosterCard img="/branding/trend3.png" title="Shōgun" rating="9.0" />
                        <PosterCard img="/branding/trend1.png" title="Fallout" rating="8.7" />
                        <PosterCard img="/branding/terminator_poster.png" title="The Terminator" rating="8.6" />
                        <PosterCard img="/branding/poster1.png" title="Interstellar" rating="8.5" />
                        <PosterCard img="/branding/trend6.png" title="Money Heist" rating="8.2" />
                    </HorizontalScroller>
                </GlassSection>

                {/* 6. Social Discovery */}
                <GlassSection style={{ padding: '36px 32px 20px' }}>
                    <SectionTitle icon="👥" title="Popular Among Your Friends" subtitle="See what your network is obsessed with right now" />
                    <HorizontalScroller>
                        <SocialCard img="/branding/trend1.png" title="Fallout" friends={['Alex', 'Sarah', 'Mike']} />
                        <SocialCard img="/branding/trend2.png" title="Dune: Part Two" friends={['Lisa', 'John']} />
                        <SocialCard img="/branding/trend5.png" title="The Boys" friends={['Tom', 'Jerry', 'Spike']} />
                        <SocialCard img="/branding/terminator_poster.png" title="Anatomy of a Fall" friends={['Emma']} />
                        <SocialCard img="/branding/trend4.png" title="Silo" friends={['David', 'Chloe']} />
                        <SocialCard img="/branding/poster3.png" title="Society of Snow" friends={['Raj', 'Sam']} />
                    </HorizontalScroller>
                </GlassSection>

            </div>
        </DashboardLayout>
    );
}
