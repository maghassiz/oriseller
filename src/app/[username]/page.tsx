import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { formatIDRShort, formatIDR } from '@/lib/utils/currency'
import { CATEGORY_LABELS, PLATFORM_LABELS } from '@/types'

export default async function SellerProfilePage({ params }: { params: { username: string } }) {
  const supabase = await createClient()
  const { data: entry } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!entry) notFound()

  return (
    <div style={{ minHeight: '100vh', background: '#F9F7F4' }}>
      <Navbar />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '90px 2rem 4rem' }}>

        {/* Back */}
        <Link href="/leaderboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.85rem', color: '#6B6560', textDecoration: 'none', marginBottom: '1.5rem' }}>
          ← Kembali ke Leaderboard
        </Link>

        {/* Profile card */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: '16px', padding: '2rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.5rem', color: '#1A1714' }}>{entry.full_name}</h1>
                <span style={{ fontSize: '0.72rem', background: '#EBF2EA', color: '#2D5A27', padding: '0.2rem 0.625rem', borderRadius: '100px', fontWeight: 700 }}>✓ Verified</span>
                {entry.is_featured && <span style={{ fontSize: '0.72rem', background: '#1A1714', color: '#fff', padding: '0.2rem 0.625rem', borderRadius: '100px', fontWeight: 700 }}>⭐ Featured</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: '#9C9590' }}>@{entry.username}</span>
                <span style={{ fontSize: '0.75rem', background: '#F3F0ED', color: '#4A4540', padding: '0.15rem 0.5rem', borderRadius: '100px', fontWeight: 500 }}>
                  {CATEGORY_LABELS[entry.category as keyof typeof CATEGORY_LABELS]}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: '#9C9590', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Rank</div>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.75rem', color: '#1A1714' }}>#{entry.rank}</div>
            </div>
          </div>

          {entry.bio && <p style={{ fontSize: '0.9rem', color: '#6B6560', lineHeight: 1.7, marginBottom: '1.25rem' }}>{entry.bio}</p>}

          {/* Social links */}
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
            {entry.website && (
              <a href={`https://${entry.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#6B6560', textDecoration: 'none', background: '#F3F0ED', padding: '0.3rem 0.75rem', borderRadius: '100px' }}>
                🌐 Website
              </a>
            )}
            {entry.twitter && (
              <a href={`https://twitter.com/${entry.twitter}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#6B6560', textDecoration: 'none', background: '#F3F0ED', padding: '0.3rem 0.75rem', borderRadius: '100px' }}>
                𝕏 @{entry.twitter}
              </a>
            )}
            {entry.instagram && (
              <a href={`https://instagram.com/${entry.instagram}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#6B6560', textDecoration: 'none', background: '#F3F0ED', padding: '0.3rem 0.75rem', borderRadius: '100px' }}>
                📸 @{entry.instagram}
              </a>
            )}
          </div>
        </div>

        {/* Revenue stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
          {[
            { label: 'MRR', value: formatIDRShort(entry.verified_mrr), sub: 'per bulan' },
            { label: 'Total Revenue', value: formatIDRShort(entry.verified_total_revenue), sub: 'sepanjang waktu' },
            { label: 'Total Orders', value: entry.verified_total_orders.toLocaleString('id-ID'), sub: 'transaksi' },
          ].map(s => (
            <div key={s.label} style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: '12px', padding: '1.25rem 1rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.3rem', color: '#1A1714', marginBottom: '0.25rem' }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: '#9C9590', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: '0.7rem', color: '#C0BBB5' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Verified via */}
        <div style={{ background: '#EBF2EA', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>✓</span>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2D5A27' }}>Revenue Terverifikasi</div>
            <div style={{ fontSize: '0.78rem', color: '#4A7A44' }}>
              Diverifikasi via {PLATFORM_LABELS[entry.platform as keyof typeof PLATFORM_LABELS]} API
              {entry.verified_at && ` · ${new Date(entry.verified_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
