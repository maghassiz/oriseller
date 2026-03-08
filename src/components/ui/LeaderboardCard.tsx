'use client'
import Link from 'next/link'
import { formatIDRShort } from '@/lib/utils/currency'
import { CATEGORY_LABELS, PLATFORM_LABELS } from '@/types'

export function LeaderboardCard({ entry, showRankBadge = false }: { entry: any; showRankBadge?: boolean }) {
  return (
    <Link href={`/${entry.username}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background: entry.is_featured ? '#1A1714' : '#FFFFFF',
          border: `1px solid ${entry.is_featured ? '#1A1714' : '#E8E4DF'}`,
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          transition: 'transform 0.15s, box-shadow 0.15s',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
        }}
      >
        {/* Rank */}
        <div style={{
          width: 36, height: 36,
          background: entry.is_featured ? 'rgba(255,255,255,0.15)' : entry.rank <= 3 ? '#1A1714' : '#F3F0ED',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: (entry.rank <= 3 && !entry.is_featured) ? '#fff' : entry.is_featured ? '#fff' : '#6B6560' }}>
            {showRankBadge && entry.rank <= 3 && !entry.is_featured
              ? ['🥇','🥈','🥉'][entry.rank - 1]
              : `#${entry.rank}`}
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
  )
}
