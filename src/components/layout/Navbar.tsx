import Link from 'next/link'

export function Navbar() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(249,247,244,0.9)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #E8E4DF',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 8, height: 8, background: '#2D5A27', borderRadius: '50%', flexShrink: 0 }} />
          <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.1rem', color: '#1A1714' }}>VerifiedMRR</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/leaderboard" style={{ fontSize: '0.875rem', color: '#6B6560', textDecoration: 'none', fontWeight: 500 }}>Leaderboard</Link>
          <Link href="/submit" style={{
            fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF',
            background: '#1A1714', padding: '0.45rem 1rem', borderRadius: '8px', textDecoration: 'none',
          }}>
            Daftarkan Diri
          </Link>
        </div>
      </div>
    </nav>
  )
}
