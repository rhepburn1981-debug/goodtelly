import { FaPlus, FaCheck, FaSearch } from 'react-icons/fa';

export default function SearchOverlay({ results, loading, addedIds, onOpenFilm, onAddToList, onClose }) {
  if (loading && results.length === 0) {
    return (
      <div style={{
        position: 'fixed', top: 80, left: 0, right: 0, bottom: 0, zIndex: 95,
        background: 'rgba(5, 5, 8, 0.9)', backdropFilter: 'blur(30px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 24, fontWeight: 800
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
        position: 'fixed', top: 80, left: 0, right: 0, bottom: 0, zIndex: 95,
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

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose && onClose();
        }
      }}
      style={{
        position: 'fixed', top: 80, left: 0, right: 0, bottom: 0, zIndex: 90,
        background: 'rgba(4, 4, 6, 0.85)', backdropFilter: 'blur(40px)',
        paddingTop: 20, paddingBottom: 60, overflowY: 'auto',
        cursor: 'default'
      }} className="no-scrollbar">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
            <FaSearch size={14} />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -0.5 }}>Search results ({results.length})</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20
        }}>
          {results.map((film) => {
            const isAdded = addedIds.includes(film.id);
            const isTmdb = film._fromTmdb || film._fromTvmaze;

            return (
              <div
                key={(film.id || '') + (film.title || '')}
                onClick={() => onOpenFilm(film)}
                style={{
                  display: 'flex', gap: 20, alignItems: 'center', padding: 14,
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
                {film.poster_url ? (
                  <img
                    src={film.poster_url}
                    alt=""
                    style={{ width: 68, aspectRatio: '2/3', borderRadius: 12, objectFit: 'cover', flexShrink: 0, boxShadow: '0 8px 16px rgba(0,0,0,0.4)' }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{ width: 68, aspectRatio: '2/3', borderRadius: 12, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
                )}

                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                      {[film.year, film.genre].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); onAddToList(film); }}
                  style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
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
                  {isAdded ? <FaCheck size={18} /> : <FaPlus size={18} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
