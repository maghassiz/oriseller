import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { formatIDRShort } from '@/lib/utils/currency'
import { CATEGORY_LABELS, PLATFORM_LABELS } from '@/types'

export const revalidate = 3600

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: entries } = await supabase
    .from('leaderboard')
    .select('*')
    .order('rank', { ascending: true })

  const list = entries || []
  const totalMRR = list.reduce((s: number, e: any) => s + (e.verified_mrr || 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: '#F9F7F4' }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '90px 2rem 4rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2rem', color: '#1A1714', marginBottom: '0.5rem' }}>Leaderboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <p style={{ fontSize: '0.875rem', color: '#6B6560' }}>{list.length} seller terverifikasi</p>
            <p style={{ fontSize: '0.875rem', color: '#6B6560' }}>Total MRR: <strong style={{ color: '#1A1714' }}>{formatIDRShort(totalMRR)}</strong></p>
          </div>
        </div>

        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '16px', border: '1px solid #E8E4DF' }}>
              <p style={{ color: '#9C9590', marginBottom: '1rem' }}>Belum ada seller terverifikasi.</p>
              <Link href="/submit" style={{ display: 'inline-flex', background: '#1A1714', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                Jadilah yang pertama →
              </Link>
            </div>
          ) : list.map((entry: any) => (
            <Link key={entry.id} href={`/${entry.username}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: entry.is_featured ? '#1A1714' : '#FFFFFF',
                border: `1px solid ${entry.is_featured ? '#1A1714' : '#E8E4DF'}`,
                borderRadius: '12px', padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
              >
                {/* Rank */}
                <div style={{ width: 36, height: 36, background: entry.is_featured ? 'rgba(255,255,255,0.15)' : entry.rank <= 3 ? '#1A1714' : '#F3F0ED', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: entry.rank <= 3 && !entry.is_featured ? '#fff' : entry.is_featured ? '#fff' : '#6B6560' }}>
                    {entry.rank <= 3 && !entry.is_featured ? ['🥇','🥈','🥉'][entry.rank - 1] : `#${entry.rank}`}
                  </span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: entry.is_featured ? '#fff' : '#1A1714' }}>{entry.full_name}</span>
                    <span style={{ fontSize: '0.75rem', color: entry.is_featured ? 'rgba(255,255,255,0.5)' : '#9C9590' }}>@{entry.username}</span>
                    <span style={{ fontSize: '0.68rem', background: entry.is_featured ? 'rgba(255,255,255,0.15)' : '#EBF2EA', color: entry.is_featured ? '#fff' : '#2D5A27', padding: '0.15rem 0.5rem', borderRadius: '100px', fontWeight: 600 }}>✓ Verified</span>
                    {entry.is_featured && <span style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '0.15rem 0.5rem', borderRadius: '100px', fontWeight: 600 }}>⭐ Featured</span>}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: entry.is_featured ? 'rgba(255,255,255,0.5)' : '#9C9590', marginTop: '0.125rem' }}>
                    {CATEGORY_LABELS[entry.category as keyof typeof CATEGORY_LABELS]} · {PLATFORM_LABELS[entry.platform as keyof typeof PLATFORM_LABELS]}
                  </div>
                </div>

                {/* Revenue */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.15rem', color: entry.is_featured ? '#fff' : '#1A1714' }}>{formatIDRShort(entry.verified_mrr)}</div>
                  <div style={{ fontSize: '0.72rem', color: entry.is_featured ? 'rgba(255,255,255,0.5)' : '#9C9590', fontWeight: 500 }}>MRR / bulan</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Submit CTA */}
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
