import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { FaPlay, FaPlus, FaSearchPlus, FaCheck, FaInfoCircle, FaStar, FaUserFriends, FaChevronRight } from 'react-icons/fa';

const NavShortcut = ({ icon: Icon, title, subtitle, iconBg, iconColor, onClick }) => (
    <div onClick={onClick} className="hover-card" style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
        background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 16, cursor: 'pointer', width: '100%'
    }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, border: `1px solid ${iconColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={18} color={iconColor} />
        </div>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 2, letterSpacing: -0.3 }}>{title}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{subtitle}</div>
        </div>
        <FaChevronRight size={12} color="rgba(255,255,255,0.2)" />
    </div>
);

const FeatureCard = () => (
    <div style={{ marginBottom: 24 }}>
        <div style={{
            position: 'relative',
            borderRadius: 16,
            overflow: 'hidden',
            background: '#0f0f12',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        }}>
            <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                backgroundImage: 'url(/branding/terminator_bg.png)',
                backgroundSize: 'cover', backgroundPosition: 'center',
                opacity: 0.8
            }} />

            <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                background: 'linear-gradient(to right, rgba(10,10,12,0.95) 0%, rgba(10,10,12,0.7) 40%, rgba(10,10,12,0.1) 100%)'
            }} />
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                background: 'linear-gradient(to top, rgba(10,10,12,0.95) 0%, rgba(10,10,12,0) 60%)'
            }} />

            <div style={{ position: 'relative', zIndex: 2, padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img
                            src="/branding/terminator_poster.png"
                            alt="The Terminator"
                            style={{
                                width: 130, aspectRatio: '2/3', objectFit: 'cover', borderRadius: 10,
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
                        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--gold-bright)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                            Freddy Recommending
                        </div>
                        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', margin: '0 0 6px', letterSpacing: -0.5 }}>
                            The Terminator
                        </h1>
                        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', margin: 0, fontWeight: 500 }}>
                            1984 &bull; Sci-Fi/Action
                        </p>
                    </div>
                </div>

                <div className="feature-btn-container" style={{ marginTop: 8 }}>
                    <button className="feature-btn feature-btn-secondary" style={{ flex: 'none', width: 'auto', padding: '14px 28px' }}>
                        <FaPlay size={12} color="#fff" /> Watch Now
                    </button>

                    <button className="feature-btn feature-btn-primary" style={{ flex: 'none', width: 'auto', padding: '14px 28px' }}>
                        <FaPlus size={12} /> Add to Watchlist
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const HorizontalScroller = ({ children }) => (
    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 24, margin: '0 -16px', padding: '0 16px 24px' }} className="no-scrollbar">
        {children}
    </div>
);

const TrendingItem = ({ num, img, platform, label, pColor }) => (
    <div className="hover-card" style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, width: 160, minWidth: 160 }}>
        <img src={img} alt={label} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} />
        <div style={{
            position: 'absolute', top: 0, left: 0, background: '#e50914', padding: '4px 10px',
            fontSize: 14, fontWeight: 900, borderBottomRightRadius: 8, boxShadow: '2px 2px 10px rgba(0,0,0,0.5)'
        }}>{num}</div>
        <div className="hover-overlay" style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, transition: 'opacity 0.2s ease', zIndex: 2
        }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaPlay size={14} style={{ marginLeft: 3 }} /></div>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaPlus size={14} /></div>
        </div>
        <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 12px 12px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)',
            display: 'flex', flexDirection: 'column', gap: 2, zIndex: 1
        }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: pColor || '#fff', letterSpacing: 0.5 }}>{platform}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
        </div>
    </div>
);

const StandardCard = ({ img, label }) => (
    <div className="hover-card" style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, width: 140, minWidth: 140 }}>
        <img src={img} alt={label} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} />
        <div className="hover-overlay" style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, transition: 'opacity 0.2s ease', zIndex: 2
        }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaPlay size={12} style={{ marginLeft: 3 }} /></div>
        </div>
    </div>
);

const ContinueCard = ({ img, title, timeLeft, progress }) => (
    <div className="hover-card" style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, width: 260, minWidth: 260, background: '#141416', border: '1px solid rgba(255,255,255,0.05)' }}>
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

const FriendAvatar = ({ name, movie, active }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', width: 64, flexShrink: 0 }} title={`${name} is watching ${movie}`}>
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
    return (
        <DashboardLayout
            searchQuery={props.searchQuery}
            onSearchChange={props.onSearchChange}
            activeTab={props.activeTab}
            onTabChange={props.onTabChange}
        >
            <style dangerouslySetInnerHTML={{
                __html: `
                .hover-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
                .hover-card:hover { transform: scale(1.05); box-shadow: 0 20px 40px rgba(0,0,0,0.5); z-index: 10; }
                .hover-card:hover .hover-overlay { opacity: 1 !important; }
            `}} />
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto' }}>

                <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>
                        Welcome back, {props.currentUser?.display_name || props.currentUser?.username || 'User'}
                    </h1>
                </div>

                <div style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
                    <NavShortcut
                        icon={FaStar}
                        title="My Watchlist"
                        subtitle="Your saved films and shows to watch"
                        iconBg="rgba(59, 130, 246, 0.15)"
                        iconColor="#60a5fa"
                        onClick={() => props.onTabChange && props.onTabChange('list')}
                    />
                    <NavShortcut
                        icon={FaUserFriends}
                        title="Friends Watchlist"
                        subtitle="See what your friends are watching"
                        iconBg="rgba(255, 255, 255, 0.05)"
                        iconColor="rgba(255, 255, 255, 0.5)"
                        onClick={() => props.onTabChange && props.onTabChange('friends')}
                    />
                </div>

                <FeatureCard />

                <div style={{
                    marginBottom: 24, position: 'relative', overflow: 'hidden',
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(10px)',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.05), transparent 70%)', zIndex: 0 }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <span style={{ fontSize: 22 }}>🔥</span>
                            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, margin: 0 }}>Trending Now</h2>
                        </div>
                        <HorizontalScroller>
                            <TrendingItem num="1" img="/branding/trend1.png" platform="NETFLIX" label="Fallout" pColor="#E50914" />
                            <TrendingItem num="2" img="/branding/trend2.png" platform="PRIME" label="Dune: Part Two" pColor="#00A8E1" />
                            <TrendingItem num="3" img="/branding/trend3.png" platform="HULU" label="Shōgun" pColor="#1CE783" />
                            <TrendingItem num="4" img="/branding/trend4.png" platform="APPLE" label="Silo" pColor="#fff" />
                            <TrendingItem num="5" img="/branding/trend5.png" platform="PRIME" label="The Boys" pColor="#00A8E1" />
                            <TrendingItem num="6" img="/branding/trend6.png" platform="NETFLIX" label="Money Heist" pColor="#E50914" />
                        </HorizontalScroller>
                    </div>
                </div>

                <div style={{
                    marginBottom: 24, position: 'relative', overflow: 'hidden',
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(10px)',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.05), transparent 70%)', zIndex: 0 }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ fontSize: 22 }}>🤖</span>
                                <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, margin: 0 }}>Because You Watched</h2>
                            </div>
                            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0 34px' }}>Based on your recent activity</p>
                        </div>
                        <HorizontalScroller>
                            <StandardCard img="/branding/poster1.png" label="Movie 1" />
                            <StandardCard img="/branding/poster2.png" label="Movie 2" />
                            <StandardCard img="/branding/poster3.png" label="Movie 3" />
                            <StandardCard img="/branding/poster4.png" label="Movie 4" />
                            <StandardCard img="/branding/trend5.png" label="Movie 5" />
                            <StandardCard img="/branding/trend6.png" label="Movie 6" />
                        </HorizontalScroller>
                    </div>
                </div>

                <div style={{
                    marginBottom: 24, position: 'relative', overflow: 'hidden',
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(10px)',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.05), transparent 70%)', zIndex: 0 }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <span style={{ fontSize: 22 }}>▶</span>
                            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, margin: 0 }}>Continue Watching</h2>
                        </div>
                        <HorizontalScroller>
                            <ContinueCard img="/branding/trend1.png" title="Fallout - S1 E3" timeLeft="24m" progress={65} />
                            <ContinueCard img="/branding/trend3.png" title="Shōgun - S1 E8" timeLeft="12m" progress={85} />
                            <ContinueCard img="/branding/terminator_bg.png" title="The Terminator" timeLeft="1h 5m" progress={30} />
                        </HorizontalScroller>
                    </div>
                </div>

                <div style={{
                    marginBottom: 24, position: 'relative', overflow: 'hidden',
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(10px)',
                    padding: '24px 16px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.05), transparent 70%)', zIndex: 0 }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                            <span style={{ fontSize: 22 }}>👥</span>
                            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, margin: 0 }}>Friends Activity</h2>
                        </div>
                        <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 16 }} className="no-scrollbar">
                            <FriendAvatar name="Rahul M." movie="Interstellar" active={true} />
                            <FriendAvatar name="Sarah J." movie="Dune" active={true} />
                            <FriendAvatar name="Mike T." movie="The Boys" active={false} />
                            <FriendAvatar name="Emma W." movie="Shōgun" active={true} />
                            <FriendAvatar name="David K." movie="Fallout" active={false} />
                            <FriendAvatar name="Lisa R." movie="Money Heist" active={false} />
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', width: 64, flexShrink: 0 }}>
                                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <FaSearchPlus size={20} />
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Find</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
