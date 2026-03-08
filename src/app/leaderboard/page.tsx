import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { LeaderboardCard } from '@/components/ui/LeaderboardCard'
import { formatIDRShort } from '@/lib/utils/currency'

export const revalidate = 3600

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: entries } = await supabase.from('leaderboard').select('*').order('rank', { ascending: true })
  const list = entries || []
  const totalMRR = list.reduce((s: number, e: any) => s + (e.verified_mrr || 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: '#F9F7F4' }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '90px 2rem 4rem' }}>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2rem', color: '#1A1714', marginBottom: '0.5rem' }}>Leaderboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <p style={{ fontSize: '0.875rem', color: '#6B6560' }}>{list.length} seller terverifikasi</p>
            <p style={{ fontSize: '0.875rem', color: '#6B6560' }}>Total MRR: <strong style={{ color: '#1A1714' }}>{formatIDRShort(totalMRR)}</strong></p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '16px', border: '1px solid #E8E4DF' }}>
              <p style={{ color: '#9C9590', marginBottom: '1rem' }}>Belum ada seller terverifikasi.</p>
              <Link href="/submit" style={{ display: 'inline-flex', background: '#1A1714', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                Jadilah yang pertama →
              </Link>
            </div>
          ) : list.map((entry: any) => (
            <LeaderboardCard key={entry.id} entry={entry} showRankBadge />
          ))}
        </div>

        <div style={{ marginTop: '2.5rem', background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.2rem', color: '#1A1714', marginBottom: '0.5rem' }}>Revenue kamu nyata?</p>
          <p style={{ fontSize: '0.875rem', color: '#6B6560', marginBottom: '1.25rem' }}>Submit API key kamu dan kami verifikasi dalam 1–2 hari kerja.</p>
          <Link href="/submit" style={{ display: 'inline-flex', background: '#1A1714', color: '#fff', padding: '0.65rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
            Daftarkan Diri →
          </Link>
        </div>
      </div>
    </div>
  )
}