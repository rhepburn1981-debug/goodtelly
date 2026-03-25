import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { FaPlay, FaPlus, FaShareAlt, FaWhatsapp, FaChevronRight, FaTimes, FaSearchPlus, FaCheck, FaPen, FaUserPlus } from 'react-icons/fa';

const FeatureCard = () => (
    <div style={{ marginBottom: 24 }}>
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
                <div className="feature-btn-container">
                    <button className="feature-btn feature-btn-secondary">
                        <FaPlay size={12} color="#fff" /> Watch Trailer
                    </button>

                    <button className="feature-btn feature-btn-primary">
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

export default function WatchlistDashboard(props) {
    return (
        <DashboardLayout searchQuery={props.searchQuery} onSearchChange={props.onSearchChange}>
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', paddingTop: 24 }}>
                <FeatureCard />

                {/* Trending Grid */}
                <div style={{
                    marginBottom: 24, position: 'relative', overflow: 'hidden',
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(10px)',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 20px px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.05), transparent 70%)', zIndex: 0 }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <span style={{ fontSize: 24 }}>🔖</span>
                            <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>Look what&rsquo;s Trending!</h2>
                        </div>
                        <div className="grid-responsive-6-dashboard">
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
                <div style={{
                    position: 'relative', overflow: 'hidden',
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(10px)',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.05), transparent 70%)', zIndex: 0 }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <span style={{ fontSize: 24 }}>💭</span>
                            <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>Friends Watchlist</h2>
                            <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', marginLeft: 12, fontWeight: 500 }}>See what your friends are recommending</span>
                        </div>
                        <div className="grid-responsive-6-dashboard">
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
    );
}
