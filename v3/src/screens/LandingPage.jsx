import { useState, useEffect, useRef } from 'react';
import whatsapp from '../../public/branding/wp.png';
import { FaPlay, FaListUl, FaWifi, FaSearch, FaEllipsisH } from 'react-icons/fa';

const POSTERS = [
  '/branding/poster1.png',
  '/branding/poster2.png',
  '/branding/poster3.png',
  '/branding/poster4.png',
]

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" style={{ marginRight: 10 }}>
    <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84a4.14 4.14 0 0 1-1.8 2.71v2.24h2.92c1.71-1.58 2.68-3.9 2.68-6.58z" fill="#4285f4" />
    <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.24c-.8.54-1.84.87-3.04.87-2.33 0-4.3-1.58-5-3.71H.95v2.3A8.99 8.99 0 0 0 9 18z" fill="#34a853" />
    <path d="M4 10.74a5.4 5.4 0 0 1 0-3.48V4.96H.95a8.99 8.99 0 0 0 0 8.08L4 10.74z" fill="#fbbc05" />
    <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.47C13.47.97 11.43 0 9 0 5.48 0 2.44 2.02.95 4.96L4 7.26c.7-2.13 2.67-3.68 5-3.68z" fill="#ea4335" />
  </svg>
)

const SLIDE_ITEMS = [...POSTERS, ...POSTERS, ...POSTERS, ...POSTERS, ...POSTERS, ...POSTERS]

const BlurableBackground = ({ src, blur = 20, brightness = 0.35, opacity = 1 }) => (
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
      background: 'linear-gradient(to bottom, var(--ink) 0%, transparent 20%, transparent 80%, var(--ink) 100%)',
    }} />
  </div>
)

const PosterGrid = () => (
  <div style={{
    position: 'absolute', top: 0, left: 0, right: 0, height: '120vh',
    zIndex: -1, pointerEvents: 'none', overflow: 'hidden',
    display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 0',
  }}>
    <style>{`
      @keyframes slideLeft {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }
      @keyframes slideRight {
        from { transform: translateX(-50%); }
        to   { transform: translateX(0); }
      }
      .poster-row { display: flex; gap: 12; flex-shrink: 0; }
    `}</style>

    {/* Row 1 — slides left */}
    <div style={{ display: 'flex', gap: 12, animation: 'slideLeft 80s linear infinite', width: 'max-content' }}>
      {SLIDE_ITEMS.map((src, i) => (
        <div key={i} style={{ width: 280, aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
          <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ))}
    </div>

    {/* Row 2 — slides right */}
    <div style={{ display: 'flex', gap: 12, animation: 'slideRight 100s linear infinite', width: 'max-content' }}>
      {SLIDE_ITEMS.map((src, i) => (
        <div key={i} style={{ width: 280, aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
          <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ))}
    </div>

    {/* Row 3 — slides left (slower) */}
    <div style={{ display: 'flex', gap: 12, animation: 'slideLeft 120s linear infinite', width: 'max-content' }}>
      {SLIDE_ITEMS.map((src, i) => (
        <div key={i} style={{ width: 280, aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
          <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ))}
    </div>

    {/* Row 4 — slides right */}
    <div style={{ display: 'flex', gap: 12, animation: 'slideRight 90s linear infinite', width: 'max-content' }}>
      {SLIDE_ITEMS.map((src, i) => (
        <div key={i} style={{ width: 280, aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
          <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ))}
    </div>
    {/* Overlay */}
    <div style={{
      position: 'absolute', inset: 0,
      backdropFilter: 'blur(5px)',
      background: `
        radial-gradient(ellipse at center, rgba(7,7,9,0.05) 0%, rgba(7,7,9,0.35) 70%, rgba(7,7,9,0.85) 100%),
        linear-gradient(to bottom, rgba(7,7,9,0.05) 0%, var(--ink) 100%)
      `,
    }} />
  </div>
)

const FeatureCard = ({ title, subtitle, icon }) => (
  <div style={{
    background: 'radial-gradient(ellipse at 50% 0%, #373439, #1E232E',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    padding: '10px 24px 26px',
    textAlign: 'left',
    flex: 1, minWidth: 280,
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
  }}>
    <div style={{ fontSize: 28, color: '#F5C518', marginBottom: 5, display: 'flex', gap: 3, letterSpacing: 2 }}>
      {Array(5).fill(0).map((_, i) => <span key={i}>★</span>)}
    </div>
    <div style={{ fontWeight: 700, fontSize: 20, color: '#ffffff', marginBottom: 6, lineHeight: 1.35 }}>&ldquo;{title}&rdquo;</div>
    <div style={{ fontSize: 16, color: '#DFDFE0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
      — {subtitle}
      {icon && icon}
    </div>
  </div>
)

const StepCard = ({ icon, title, subtitle }) => (
  <div style={{
    background: 'radial-gradient(ellipse at 50% 0%, #373439, #1E232E)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '24px 16px 20px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
  }}>
    <div style={{
      width: 64, height: 64,
      borderRadius: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 16px',
      overflow: 'hidden',
    }}>
      <img src={icon.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
    <div style={{ fontWeight: 600, fontSize: 18, color: '#fff', marginBottom: 6, lineHeight: 1.3, textAlign: 'start' }}>{title}</div>
    <div style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.87)', lineHeight: 1.5, textAlign: 'start' }}>{subtitle}</div>
  </div>
)

const DoubleChevron = () => (
  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 22, fontWeight: 900, flexShrink: 0, padding: '0 6px', alignSelf: 'center', marginBottom: 0, letterSpacing: -4 }}>»»</div>
)

const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
)

const ChevronLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
)

const FriendCard = ({ name, img, label, quote }) => (
  <div style={{
    background: 'radial-gradient(ellipse at 50% 0%, #373439, #1E232E)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6,
    display: 'flex', alignItems: 'stretch', overflow: 'hidden',
    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
    padding: 12,
  }}>
    {/* Rectangular left image */}
    <img src={img} alt={name} style={{ width: 100, height: 140, objectFit: 'cover', flexShrink: 0, display: 'block', borderRadius: 4 }} />
    {/* Content */}
    <div style={{ flex: 1, padding: '16px 18px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
          {name} {label}:
        </div>
        <div style={{ fontWeight: 500, fontSize: 18, color: '#fff', lineHeight: 1.4 }}>{quote}</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 6, padding: '10px 18px', fontSize: 14, fontWeight: 600,
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        }}><FaPlay size={12} /> Watch Trailer</button>
        <button style={{
          background: 'rgb(52 52 52 / 24%)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 6, padding: '6px 12px', fontSize: 14, fontWeight: 600,
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        }}><FaListUl size={14} /> Add to Watchlist</button>
      </div>
    </div>
  </div>
)

const SliderButton = ({ direction, onClick }) => (
  <button
    onClick={onClick}
    style={{
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      [direction === 'left' ? 'left' : 'right']: 10,
      zIndex: 10,
      background: 'rgba(0,0,0,0.5)',
      color: '#fff',
      border: 'none',
      borderRadius: '50%',
      width: 44,
      height: 44,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      backdropFilter: 'blur(4px)',
      border: '1px solid rgba(255,255,255,0.1)',
      transition: 'all 0.2s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(0,0,0,0.8)';
      e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'rgba(0,0,0,0.5)';
      e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
    }}
  >
    {direction === 'left' ? <ChevronLeft /> : <ChevronRight />}
  </button>
)

export default function LandingPage({ onShowLogin, onShowRegister }) {
  const trendingRef = useRef(null)
  const friendsRef = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const scroll = (ref, direction) => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollAmount = clientWidth * 0.8;
      ref.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  return (
    <div style={{ minHeight: '100dvh', overflowX: 'hidden', position: 'relative' }}>
      {/* Background Layer */}
      <PosterGrid />

      {/* Navigation */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 32px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, background: 'var(--red)', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(229, 9, 20, 0.5)'
          }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff' }} />
          </div>
          <span style={{ fontFamily: 'var(--ff-poppins)', fontSize: 32, fontWeight: 700, color: 'var(--text)', letterSpacing: -1.2 }}>reel.</span>
        </div>
        <button
          onClick={onShowLogin}
          style={{
            background: 'linear-gradient(180deg, #E83536, #B1211E)', color: '#fff', border: 'none',
            borderRadius: 5, padding: '12px 34px', fontSize: 18, fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 6px 18px rgba(186, 29, 27, 0.45)',
            transition: 'transform 0.1s ease',
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Sign In
        </button>
      </header>


      {/* Hero & Features Header Block */}
      {/* Hero Section */}
      <section style={{
        textAlign: 'center', padding: '160px 24px 10px', position: 'relative',
        zIndex: 5, maxWidth: 1024, margin: '0 auto'
      }}>
        <h1 style={{
          fontFamily: 'var(--ff-poppins)', fontSize: 'clamp(48px, 10vw, 84px)',
          fontWeight: 700, color: 'var(--text)', lineHeight: 1.2,
          letterSpacing: -3, marginBottom: 20, textShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          Stop scrolling.<br />Start watching better.
        </h1>
        <p style={{ fontSize: 'clamp(18px, 4vw, 22px)', color: 'var(--white)', marginBottom: 50, fontWeight: 500 }}>
          See what your friends are recommending across every platform.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400, margin: '0 auto' }}>
          <button
            onClick={onShowRegister}
            style={{
              background: 'linear-gradient(180deg, #E83536, #B1211E)', color: '#fff', border: 'none',
              borderRadius: 6, padding: '16px 0', fontSize: 26, fontWeight: 900,
              cursor: 'pointer', boxShadow: '0 10px 40px rgba(229, 9, 20, 0.45)',
              transition: 'transform 0.1s ease, filter 0.1s ease',
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Join Reel — It&rsquo;s Free
          </button>
          <button
            onClick={onShowLogin}
            style={{
              background: '#fff', color: '#111', border: 'none',
              borderRadius: 6, padding: '16px 0', fontSize: 20, fontWeight: 800,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255,255,255,0.1)',
            }}
          >
            <GoogleIcon /> Continue with Google
          </button>
        </div>
      </section>

      {/* Features Block with BlurableBackground */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* <BlurableBackground src={POSTERS[0]} opacity={0.6} /> */}
        {/* Features Row */}
        <section style={{
          padding: '40px 24px 100px', display: 'flex', gap: 20, overflowX: 'auto',
          maxWidth: 1440, margin: '0 auto', scrollPadding: '0 24px',
          msOverflowStyle: 'none', scrollbarWidth: 'none',
          position: 'relative', zIndex: 5
        }}>
          <style>{`section::-webkit-scrollbar { display: none; }`}</style>
          <FeatureCard title="No more scrolling for hours" subtitle="Watch trailers instantly" />
          <FeatureCard title="Add to your watchlist" subtitle="Save the good stuff" />
          <FeatureCard title="Recommend to friends" subtitle="Share via app or WhatsApp" icon={
            <img src={whatsapp} alt="whatsapp" style={{ width: 36 }} />
          } />
        </section>
      </div>

      {/* How it works */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <BlurableBackground src={POSTERS[1]} />

        <section style={{ position: 'relative', zIndex: 2, padding: '20px 24px 20px', textAlign: 'center' }}>
          {/* Ruled title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
            <div style={{ flex: 1, maxWidth: 160, height: 2, background: 'rgba(255,255,255,0.25)' }} />
            <h2 style={{ fontFamily: 'var(--ff-poppins)', fontSize: 40, fontWeight: 700, color: '#fff', margin: 0, whiteSpace: 'nowrap' }}>
              How Reel works
            </h2>
            <div style={{ flex: 1, maxWidth: 160, height: 1, background: 'rgba(255,255,255,0.25)' }} />
          </div>
          <div style={{ fontSize: 20, color: '#fff', marginBottom: 48, letterSpacing: 1, fontWeight: 500 }}>
            Discover ~ Save ~ Share ~ Repeat
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, maxWidth: 1440, margin: '0 auto' }}>
            <StepCard
              icon={{ src: '/branding/image1.png' }}
              title="Find something to watch"
              subtitle="Watch trailers instantly"
            />
            <StepCard
              icon={{ src: '/branding/image2.png' }}
              title="Add to your watchlist"
              subtitle="Save the good stuff"
            />
            <StepCard
              icon={{ src: '/branding/image3.png' }}
              title="Recommend to friends"
              subtitle="Share via app or WhatsApp"
            />
            <StepCard
              icon={{ src: '/branding/image4.png' }}
              title="Friends watch &amp; save"
              subtitle="They watch trailers and add it too."
            />
            <StepCard
              icon={{ src: '/branding/image5.png' }}
              title="Better TV for everyone"
              subtitle="No more endless scrolling"
            />
          </div>
        </section>
      </div>


      {/* Trending Section */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <BlurableBackground src={POSTERS[2]} />
        <section style={{ position: 'relative', zIndex: 2, padding: '48px 32px 64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', marginBottom: 32 }}>
            <div style={{ flex: 1, maxWidth: 160, height: 2, background: 'rgba(255,255,255,0.25)' }} />
            <h2 style={{ fontFamily: 'var(--ff-poppins)', fontSize: 40, fontWeight: 700, color: '#fff', margin: 0, whiteSpace: 'nowrap' }}>
              🔥 Trending with Reel users
            </h2>
            <div style={{ flex: 1, maxWidth: 160, height: 2, background: 'rgba(255,255,255,0.25)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, margin: '0 auto' }}>
            {[
              { src: '/branding/trend1.png', num: 1, color: '#e5091493', label: 'Fallout', platform: 'NETFLIX' },
              { src: '/branding/trend2.png', num: 2, color: '#2d2d2da8', label: 'Dune: Part Two', platform: 'PRIME' },
              { src: '/branding/trend3.png', num: 3, color: '#3a4bbd94', label: 'Shōgun', platform: 'HULU' },
              { src: '/branding/trend4.png', num: 4, color: '#1a6e3c9a', label: 'The Boys', platform: 'PRIME' },
              { src: '/branding/trend5.png', num: 5, color: '#e8a60098', label: 'Shōgun S2', platform: 'FX' },
              { src: '/branding/trend6.png', num: 6, color: '#1a6bcc98', label: 'Breaking Bad', platform: 'AMC' },
            ].map(({ src, num, color, label }) => (
              <div key={num} style={{ position: 'relative', borderRadius: 4, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                {/* Number badge */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, zIndex: 2,
                  width: 36, height: 36, borderRadius: '0 0 4px 0',
                  background: color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 24, color: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                }}>
                  {num}
                </div>
                <img
                  src={src}
                  alt={label}
                  style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Friends Feed Section */}
      {/* Friends Section */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <BlurableBackground src={POSTERS[3]} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to bottom, var(--ink) 0%, rgba(8,8,12,0.5) 20%, rgba(8,8,12,0.5) 80%, var(--ink) 100%)',
        }} />
        <section style={{ position: 'relative', zIndex: 2, padding: '48px 32px 130px' }}>
          {/* Ruled title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', marginBottom: 32 }}>
            <div style={{ flex: 1, maxWidth: 160, height: 1, background: 'rgba(255,255,255,0.25)' }} />
            <h2 style={{ fontFamily: 'var(--ff-poppins)', fontSize: 40, fontWeight: 700, color: '#fff', margin: 0, whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: 62, lineHeight: 0 }}>&#8734;</span> What your friends are watching
            </h2>
            <div style={{ flex: 1, maxWidth: 160, height: 1, background: 'rgba(255,255,255,0.25)' }} />
          </div>
          {/* 2-column grid — only 2 cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 1140, margin: '0 auto' }}>
            <FriendCard
              name="Rik"
              img="/branding/trend1.png"
              label="recommends"
              quote='"Fallout is amazing!"'
            />
            <FriendCard
              name="Emily"
              img="/branding/trend3.png"
              label="says"
              quote='"Knuckles is hilarious!"'
            />
          </div>

          {/* 4 feature icons strip */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, margin: '40px auto 32px', maxWidth: 940 }}>
            {[
              { src: '/branding/image6.png', label: 'All platforms in one place' },
              { src: '/branding/image7.png', label: 'Powered by friends' },
              { src: '/branding/image8.png', label: 'Find anything instantly' },
              { src: '/branding/image9.png', label: 'Never miss a show' },
            ].map(({ src, label }) => (
              <div key={label} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                  <img src={src} alt={label} style={{ width: 80, height: 80, objectFit: 'contain' }} />
                </div>
                <div style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.86)', fontWeight: 600, lineHeight: 1.2, maxWidth: 150, margin: 'auto' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', maxWidth: 1140, margin: '8px auto 24px' }} />

          {/* Tagline + CTA */}
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <p style={{ color: '#fff', fontSize: 20, marginBottom: 24 }}>
              Fed up with scrolling for hours and finding nothing? We built Reel to fix it.
            </p>
            <button
              onClick={onShowRegister}
              style={{
                background: 'linear-gradient(180deg, #E83536, #B1211E)', color: '#fff', border: 'none',
                borderRadius: 6, padding: '16px 40px', fontSize: 26, fontWeight: 900,
                cursor: 'pointer', boxShadow: '0 10px 40px rgba(229, 9, 20, 0.45)',
                transition: 'transform 0.1s ease, filter 0.1s ease',
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Start watching better — it&rsquo;s free
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
