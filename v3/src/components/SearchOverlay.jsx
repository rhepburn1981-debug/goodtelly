import { useState, useEffect } from 'react';
import { FaPlus, FaCheck, FaSearch } from 'react-icons/fa';

export default function SearchOverlay({ results, loading, addedIds, onOpenFilm, onAddToList, onClose }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading && results.length === 0) {
    return (
      <div style={{
        position: 'fixed', top: 114, left: 0, right: 0, bottom: 0, zIndex: 95,
        background: 'rgba(5, 5, 8, 0.9)', backdropFilter: 'blur(30px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: isMobile ? 18 : 24, fontWeight: 800
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div className="spinner" style={{ width: 40, height: 40, border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <span>Searching Universe...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div style={{
        position: 'fixed', top: 114, left: 0, right: 0, bottom: 0, zIndex: 95,
        background: 'rgba(5, 5, 8, 0.95)', backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16
      }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>
          <FaSearch size={40} />
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, fontWeight: 700 }}>No matching films found</div>
      </div>
    );
  }

  const sorted = [...results].sort((a, b) => sortOrder === 'newest' ? (b.year || 0) - (a.year || 0) : (a.year || 0) - (b.year || 0));

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose && onClose();
        }
      }}
      style={{
        position: 'fixed', top: 114, left: 0, right: 0, bottom: 0, zIndex: 90,
        background: 'rgba(4, 4, 6, 0.85)', backdropFilter: 'blur(40px)',
        paddingTop: isMobile ? 12 : 20, paddingBottom: 60, overflowY: 'auto',
        cursor: 'default'
      }} className="no-scrollbar">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: isMobile ? 20 : 32 }}>
          <div style={{ width: isMobile ? 24 : 32, height: isMobile ? 24 : 32, borderRadius: 6, background: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
            <FaSearch size={isMobile ? 10 : 14} />
          </div>
          <h2 style={{ fontSize: isMobile ? 18 : 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -0.5 }}>Search results ({sorted.length})</h2>
          <button onClick={() => setSortOrder(o => o === 'newest' ? 'oldest' : 'newest')} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 14px', color: 'var(--gold-bright)', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>{sortOrder === 'newest' ? '↓ Newest first' : '↑ Oldest first'}</button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: isMobile ? 12 : 20
        }}>
          {sorted.map((film, idx) => {
            const isAdded = addedIds.includes(film.id);
            const isTmdb = film._fromTmdb || film._fromTvmaze;

            return (
              <div
                key={idx + '_' + (film.id || '') + '_' + (film.title || '')}
                onClick={() => onOpenFilm(film)}
                style={{
                  display: 'flex', gap: isMobile ? 12 : 20, alignItems: 'center', padding: isMobile ? 10 : 14,
                  background: 'rgba(255, 255, 255, 0.03)', borderRadius: 20,
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative', overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                }}
              >
                {film.poster ? (
                  <img
                    src={film.poster}
                    alt=""
                    style={{ width: isMobile ? 54 : 68, aspectRatio: '2/3', borderRadius: 12, objectFit: 'cover', flexShrink: 0, boxShadow: '0 8px 16px rgba(0,0,0,0.4)' }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{ width: isMobile ? 54 : 68, aspectRatio: '2/3', borderRadius: 12, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
                )}

                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: isMobile ? 2 : 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: isMobile ? 15 : 18, fontWeight: 800, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {film.title}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isTmdb && (
                      <span style={{
                        fontSize: 9, fontWeight: 900, color: '#fff',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        borderRadius: 4, padding: '2px 6px', letterSpacing: 0.5
                      }}>
                        TMDB
                      </span>
                    )}
                    <span style={{ fontSize: isMobile ? 11 : 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                      {[film.year, film.genre ? film.genre.split(",")[0].trim() : null].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); onAddToList(film); }}
                  style={{
                    width: isMobile ? 36 : 44, height: isMobile ? 36 : 44, borderRadius: '50%', flexShrink: 0,
                    background: isAdded ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid ' + (isAdded ? 'rgba(74, 222, 128, 0.3)' : 'rgba(255, 255, 255, 0.1)'),
                    color: isAdded ? '#4ade80' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    position: 'relative', zIndex: 5
                  }}
                  onMouseEnter={(e) => {
                    if (!isAdded) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isAdded) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  {isAdded ? <FaCheck size={isMobile ? 14 : 18} /> : <FaPlus size={isMobile ? 14 : 18} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
