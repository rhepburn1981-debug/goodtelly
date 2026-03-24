import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { FaPlay, FaPlus, FaShareAlt, FaWhatsapp, FaChevronRight, FaTimes, FaSearchPlus, FaCheck, FaPen, FaUserPlus } from 'react-icons/fa';

const BlurableBackground = ({ src, blur = 25, brightness = 0.25, opacity = 1 }) => (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <img src={src} alt="" style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            filter: `blur(${blur}px) brightness(${brightness})`,
            transform: 'scale(1.1)',
            opacity: opacity
        }} />
        <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 0%, rgba(10,10,12,0.6) 20%, rgba(10,10,12,0.6) 80%, transparent 100%)',
        }} />
    </div>
)

const FeatureCard = () => (
    <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.9)', letterSpacing: 0.5 }}>
            Freddy recommending...
        </h2>
        <div style={{
            position: 'relative',
            borderRadius: 16,
            overflow: 'hidden',
            background: '#0f0f12',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        }}>
            {/* Background Image Layer */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                backgroundImage: 'url(/branding/terminator_bg.png)',
                backgroundSize: 'cover', backgroundPosition: 'center',
                opacity: 0.8
            }} />

            {/* Dark Gradient Overlay to make text legible */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                background: 'linear-gradient(to right, rgba(10,10,12,0.95) 0%, rgba(10,10,12,0.7) 40%, rgba(10,10,12,0.1) 100%)'
            }} />
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                background: 'linear-gradient(to top, rgba(10,10,12,0.95) 0%, rgba(10,10,12,0) 60%)'
            }} />

            {/* Close Button */}
            <div style={{
                position: 'absolute', top: 16, right: 16, zIndex: 10,
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.85)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#111',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s ease'
            }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <FaTimes size={14} />
            </div>

            {/* Content Layer */}
            <div style={{ position: 'relative', zIndex: 2, padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Top Section: Poster + Title */}
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img
                            src="/branding/terminator_poster.png"
                            alt="The Terminator"
                            style={{
                                width: 110, aspectRatio: '2/3', objectFit: 'cover', borderRadius: 10,
                                border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
                            }}
                        />
                        <div style={{
                            position: 'absolute', bottom: -10, right: -10,
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'rgba(10,10,12,0.8)', backdropFilter: 'blur(5px)',
                            border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
                        }}>
                            <FaSearchPlus size={12} />
                        </div>
                    </div>

                    <div style={{ alignSelf: 'flex-start', paddingTop: 12 }}>
                        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#fff', margin: '0 0 6px', letterSpacing: -0.5 }}>
                            The Terminator
                        </h1>
                        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', margin: 0, fontWeight: 500 }}>
                            1984
                        </p>
                    </div>
                </div>

                {/* Bottom Section: Buttons */}
                <div style={{ display: 'flex', gap: 12, marginTop: -4 }}>
                    <button style={{
                        flex: '0.4',
                        background: 'rgba(20, 20, 24, 0.9)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 30, padding: '14px 0',
                        color: '#fff', fontSize: 15, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        cursor: 'pointer', backdropFilter: 'blur(10px)',
                        transition: 'background 0.2s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                        <FaPlay size={12} color="#fff" /> Watch Trailer
                    </button>

                    <button style={{
                        flex: '0.6',
                        background: 'linear-gradient(to right, rgba(40,30,20,0.9), rgba(60,45,25,0.8))',
                        border: '1px solid rgba(218, 165, 32, 0.5)',
                        borderRadius: 30, padding: '14px 0',
                        color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        cursor: 'pointer', backdropFilter: 'blur(10px)',
                        transition: 'background 0.2s ease',
                        boxShadow: '0 4px 20px rgba(218,165,32,0.15)'
                    }}>
                        + Watchlist
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const TrendingItem = ({ num, img, platform, label, pColor }) => (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s ease' }}>
        <img src={img} alt={label} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} />
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            background: '#e50914',
            padding: '4px 10px',
            fontSize: 14,
            fontWeight: 900,
            borderBottomRightRadius: 8,
            boxShadow: '2px 2px 10px rgba(0,0,0,0.5)'
        }}>{num}</div>
        <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '24px 12px 12px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
        }}>
            <span style={{ fontSize: 12, fontWeight: 900, color: pColor || '#fff', letterSpacing: 0.5 }}>{platform}</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{label}</span>
        </div>
    </div>
);

const ActivityItem = ({ name, action, movie, icon: Icon }) => (
    <div style={{ display: 'flex', gap: 14, marginBottom: 20, alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 44, height: 44 }}>
            <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <img src={`https://i.pravatar.cc/100?u=${name}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            {Icon && (
                <div style={{
                    position: 'absolute', bottom: -2, right: -2,
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#81b67f',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #141416',
                    color: '#000'
                }}>
                    <Icon size={8} />
                </div>
            )}
        </div>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{name}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{action} <span style={{ color: '#fff', fontWeight: 600 }}>{movie}</span></div>
        </div>
    </div>
);

const RightSidebar = () => (
    <aside style={{
        width: 320,
        padding: '32px 24px',
        background: 'rgb(15 15 18 / 62%)',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        height: 'calc(100vh - 80px)',
        overflowY: 'auto',
        marginTop: 80,
        zIndex: 1,
    }} className="no-scrollbar">
        <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, letterSpacing: -0.5 }}>Activity</h3>
            <ActivityItem name="Renée Francois" action="Added" movie="Stranger Things" icon={FaCheck} />
            <ActivityItem name="Róisín Lynn Theodakis" action="Rated" movie="★★★★★" icon={FaPen} />
            <ActivityItem name="Dwayne Gossett Downe" action="Recommended" movie="| Swear" icon={FaCheck} />
        </div>

        <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'rgba(255,255,255,0.6)' }}>Buine Franois</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button style={{
                    background: 'rgba(40, 50, 80, 0.4)',
                    color: '#fff',
                    border: '1px solid rgba(100, 150, 255, 0.2)',
                    borderRadius: 24,
                    padding: '12px',
                    fontSize: 14,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    cursor: 'pointer'
                }}>
                    <FaUserPlus size={14} /> Share Reel
                </button>
                <button style={{
                    background: 'rgba(30, 80, 50, 0.4)',
                    color: '#fff',
                    border: '1px solid rgba(50, 150, 80, 0.3)',
                    borderRadius: 24,
                    padding: '12px',
                    fontSize: 14,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    cursor: 'pointer'
                }}>
                    <FaWhatsapp size={16} color="#4ade80" /> Invite or Text/WhatsApp
                </button>
            </div>
        </div>

        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, background: '#fff', color: '#000', padding: '4px 8px' }}>Trending This Week</h3>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontWeight: 600 }}>View All</span>
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 16 }} className="no-scrollbar">
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ flexShrink: 0, width: 85, height: 120, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <img src={`/branding/poster${i}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    </div>
                ))}
            </div>
            <button style={{
                width: '100%', padding: '10px 0', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24,
                color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer'
            }}>View All</button>
        </div>

        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, background: '#fff', color: '#000', padding: '4px 8px' }}>Up & Coming This Week</h3>
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 16 }} className="no-scrollbar">
                {[4, 3, 1].map(i => (
                    <div key={i} style={{ flexShrink: 0, width: 85, height: 120, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <img src={`/branding/poster${i}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    </div>
                ))}
            </div>
            <button style={{
                width: '100%', padding: '10px 0', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24,
                color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer'
            }}>View All</button>
        </div>
    </aside>
);

export default function WatchlistDashboard({ onTabChange }) {
    return (
        <div style={{ display: 'flex', background: '#020202', minHeight: '100vh', width: '100%', position: 'relative' }}>
            {/* GLOBAL Background Posters Grid (Blurred) */}
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 0,
                opacity: .6,
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: 8,
                pointerEvents: 'none',
                filter: 'blur(3px)'
            }}>
                {Array(60).fill(0).map((_, i) => (
                    <img key={i} src={`/branding/poster${(i % 5) + 1}.png`} style={{ width: '100%', opacity: 0.5 }} alt="" />
                ))}
            </div>

            <DashboardLayout activeTab="watchlist" onTabChange={onTabChange}>

                <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto' }}>
                    <FeatureCard />

                    {/* Trending Grid */}
                    <div style={{ marginBottom: 48, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                <span style={{ fontSize: 24 }}>🔖</span>
                                <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>Look what&rsquo;s Trending!</h2>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
                                <TrendingItem num="1" img="/branding/trend1.png" platform="NETFLIX" label="Fallout" pColor="#E50914" />
                                <TrendingItem num="2" img="/branding/trend2.png" platform="PRIME" label="Dune: Part Two" pColor="#00A8E1" />
                                <TrendingItem num="3" img="/branding/trend3.png" platform="HULU" label="Shōgun" pColor="#1CE783" />
                                <TrendingItem num="4" img="/branding/trend4.png" platform="SILO" label="Silo" pColor="#fff" />
                                <TrendingItem num="5" img="/branding/trend5.png" platform="PRIME" label="The Boys" pColor="#00A8E1" />
                                <TrendingItem num="6" img="/branding/trend6.png" platform="NETFLIX" label="Money Heist" pColor="#E50914" />
                            </div>
                        </div>
                    </div>

                    {/* Friends Watchlist */}
                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                <span style={{ fontSize: 24 }}>💭</span>
                                <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>Friends Watchlist</h2>
                                <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', marginLeft: 12, fontWeight: 500 }}>See what your friends are recommending</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
                                {[1, 2, 3, 4, 1, 2].map((i, idx) => (
                                    <div key={idx} style={{
                                        borderRadius: 14, overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                        transition: 'transform 0.3s ease',
                                        cursor: 'pointer'
                                    }}>
                                        <img src={`/branding/poster${i}.png`} alt="" style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
            <RightSidebar />

            {/* Hide global BottomNav styles on large screens */}
            <style dangerouslySetInnerHTML={{
                __html: `
            @media (min-width: 1024px) {
                nav[style*="position: fixed"][style*="bottom: 0"] {
                    display: none !important;
                }
            }
        `}} />
        </div>
    );
}
