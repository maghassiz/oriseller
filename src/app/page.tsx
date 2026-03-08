import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { LeaderboardCard } from '@/components/ui/LeaderboardCard'
import { formatIDRShort } from '@/lib/utils/currency'

export const revalidate = 3600

async function getLeaderboardPreview() {
  const supabase = await createClient()
  const { data } = await supabase.from('leaderboard').select('*').order('rank', { ascending: true }).limit(5)
  return data || []
}

async function getStats() {
  const supabase = await createClient()
  const { data } = await supabase.from('submissions').select('verified_mrr, verified_total_revenue').eq('status', 'approved')
  const totalMRR = data?.reduce((s, r) => s + (r.verified_mrr || 0), 0) || 0
  const totalRevenue = data?.reduce((s, r) => s + (r.verified_total_revenue || 0), 0) || 0
  return { count: data?.length || 0, totalMRR, totalRevenue }
}

export default async function HomePage() {
  const [entries, stats] = await Promise.all([getLeaderboardPreview(), getStats()])

  return (
    <div style={{ minHeight: '100vh', background: '#F9F7F4' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ paddingTop: 120, paddingBottom: 80, textAlign: 'center', padding: '120px 2rem 80px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#EBF2EA', border: '1px solid #BBF7D0', borderRadius: '100px', padding: '0.3rem 0.875rem', marginBottom: '1.5rem' }}>
            <span style={{ width: 6, height: 6, background: '#2D5A27', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2D5A27', letterSpacing: '0.05em' }}>REVENUE TERVERIFIKASI LANGSUNG DARI PAYMENT GATEWAY</span>
          </div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', color: '#1A1714', lineHeight: 1.15, marginBottom: '1.25rem' }}>
            Bukan Screenshot.<br /><em>Revenue Asli.</em>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#6B6560', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 520, margin: '0 auto 2.5rem' }}>
            VerifiedMRR menampilkan revenue seller digital Indonesia yang diverifikasi langsung dari Mayar, Scalev, dan Lynk. Tidak ada screenshot. Tidak ada kebohongan.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/submit" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#1A1714', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>
              Daftarkan Revenue Kamu →
            </Link>
            <Link href="/leaderboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: '#1A1714', border: '1.5px solid #D0CBC3', padding: '0.75rem 1.75rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem' }}>
              Lihat Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ borderTop: '1px solid #E8E4DF', borderBottom: '1px solid #E8E4DF', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Seller Terverifikasi', value: stats.count.toString() },
            { label: 'Total MRR', value: formatIDRShort(stats.totalMRR) },
            { label: 'Total Revenue', value: formatIDRShort(stats.totalRevenue) },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '0.5rem 2rem' }}>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.75rem', color: '#1A1714' }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: '#9C9590', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '0.125rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Leaderboard preview */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.5rem', color: '#1A1714' }}>Top Seller</h2>
          <Link href="/leaderboard" style={{ fontSize: '0.85rem', color: '#6B6560', textDecoration: 'none', fontWeight: 500 }}>Lihat semua →</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '12px', border: '1px solid #E8E4DF' }}>
              <p style={{ color: '#9C9590', fontSize: '0.9rem' }}>Belum ada seller terverifikasi. <Link href="/submit" style={{ color: '#1A1714', fontWeight: 600 }}>Jadilah yang pertama!</Link></p>
            </div>
          ) : entries.map((entry: any) => (
            <LeaderboardCard key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#1A1714', padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2rem', color: '#FFFFFF', marginBottom: '1rem' }}>Revenue kamu nyata?<br />Buktikan.</h2>
          <p style={{ color: '#9C9590', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem' }}>Submit API key Mayar, Scalev, atau Lynk kamu. Kami verifikasi langsung dari sumbernya.</p>
          <Link href="/submit" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#FFFFFF', color: '#1A1714', padding: '0.8rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem' }}>
            Submit Revenue Sekarang →
          </Link>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid #E8E4DF', padding: '1.5rem 2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: '#9C9590' }}>© 2025 VerifiedMRR · Revenue seller digital Indonesia yang terverifikasi</p>
      </footer>
    </div>
  )
}