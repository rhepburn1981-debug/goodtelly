const STREAMER_LOGOS = {
    'Netflix':      { src: '/branding/netflix.png',       width: 22 },
    'Prime Video':  { src: '/branding/prime.png',         width: 36 },
    'Disney+':      { src: '/branding/disney.png',        width: 36 },
    'Apple TV+':    { src: '/branding/I-tv.png',          width: 38 },
    'NOW TV':       { src: '/branding/now_logo.png',      width: 36 },
    'Paramount+':   { src: '/branding/paramountplus.png', width: 36 },
    'Discovery+':   { src: '/branding/discovery.png',     width: 36 },
    'ITVX':         { src: '/branding/itvx.svg',          width: 44 },
    'BBC iPlayer':  { src: '/branding/bbc.png',           width: 36 },
    'Channel 4':    { src: '/branding/channel4.png',      width: 30 },
};

export default function StreamerBadge({ streamers }) {
    const match = (streamers || []).find(s => STREAMER_LOGOS[s]);
    if (!match) return null;
    const logo = STREAMER_LOGOS[match];
    return (
        <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 56, height: 70,
            background: 'rgba(0,0,0,0.85)',
            borderTopLeftRadius: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2,
        }}>
            <img src={logo.src} alt={match} style={{ width: logo.width, height: 'auto', objectFit: 'contain' }} />
        </div>
    );
}
