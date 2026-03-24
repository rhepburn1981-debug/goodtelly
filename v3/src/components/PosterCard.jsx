// Small poster card — 90×130px poster, title + count text below (NOT overlaid)
// Used in horizontal scroll rows (What's NEW, trending)

export default function PosterCard({ film, onClick, subtext }) {
  return (
    <div
      onClick={() => onClick && onClick(film)}
      style={{ cursor: 'pointer', flexShrink: 0, width: 90 }}
    >
      <div style={{
        width: 90,
        height: 130,
        borderRadius: 10,
        overflow: 'hidden',
        background: 'var(--surface3)',
        border: '1px solid var(--border)',
        marginBottom: 6,
      }}>
        {film.poster_url ? (
          <img
            src={film.poster_url}
            alt={film.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="lazy"
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--muted)',
            fontSize: 11,
            padding: 6,
            textAlign: 'center',
          }}>
            {film.title}
          </div>
        )}
      </div>

      <div style={{
        fontSize: 11,
        color: 'var(--text)',
        lineHeight: 1.3,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {film.title}
      </div>

      {subtext && (
        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>
          {subtext}
        </div>
      )}
    </div>
  )
}
