'use client'
import { useState, useRef } from 'react'
import { Button, Input, Alert } from '@/components/ui'
import { formatIDRShort } from '@/lib/utils/currency'
import { CATEGORY_LABELS, PLATFORM_LABELS } from '@/types'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  // Store password in ref so async functions always have latest value
  const passwordRef = useRef('')

  async function loadSubmissions(pw: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/admin?action=list', {
        headers: { 'x-admin-key': pw }
      })
      const data = await res.json()
      if (!res.ok) {
        setAuthError(data.error || 'Gagal memuat data.')
        setAuthed(false)
        return
      }
      setSubmissions(data.submissions || [])
    } catch (err: any) {
      setAuthError('Koneksi gagal: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAuth() {
    passwordRef.current = password
    setAuthError('')
    // Try fetching to validate password
    const res = await fetch('/api/admin?action=list', {
      headers: { 'x-admin-key': password }
    })
    if (res.status === 401) {
      setAuthError('Password salah.')
      return
    }
    const data = await res.json()
    setSubmissions(data.submissions || [])
    setAuthed(true)
  }

  async function doAction(body: object) {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': passwordRef.current },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (res.ok) {
      setMessage(data.message || 'Berhasil.')
      setMessageType('success')
    } else {
      setMessage(data.error || 'Terjadi kesalahan.')
      setMessageType('error')
    }
    await loadSubmissions(passwordRef.current)
  }

  async function verify(id: string) {
    setActionLoading(id + '_verify')
    await doAction({ action: 'verify', id })
    setActionLoading(null)
  }

  async function approve(id: string, mrr: number, totalRevenue: number, totalOrders: number) {
    setActionLoading(id + '_approve')
    await doAction({ action: 'approve', id, mrr, total_revenue: totalRevenue, total_orders: totalOrders })
    setActionLoading(null)
  }

  async function reject(id: string) {
    const reason = prompt('Alasan penolakan (opsional):') ?? ''
    setActionLoading(id + '_reject')
    await doAction({ action: 'reject', id, reason })
    setActionLoading(null)
  }

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#F9F7F4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: '#fff', border: '1px solid #E8E4DF', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: 360 }}>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.5rem', color: '#1A1714', marginBottom: '1.5rem' }}>Admin</h1>
          {authError && <div style={{ marginBottom: '1rem' }}><Alert variant="error">{authError}</Alert></div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAuth()} autoFocus />
            <Button onClick={handleAuth} fullWidth>Masuk</Button>
          </div>
        </div>
      </div>
    )
  }

  const pending = submissions.filter(s => s.status === 'pending')
  const approved = submissions.filter(s => s.status === 'approved')

  return (
    <div style={{ minHeight: '100vh', background: '#F9F7F4', padding: '2rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.75rem', color: '#1A1714' }}>Admin Dashboard</h1>
          <Button variant="secondary" size="sm" onClick={() => loadSubmissions(passwordRef.current)} loading={loading}>
            Refresh
          </Button>
        </div>

        {message && (
          <div style={{ marginBottom: '1rem' }}>
            <Alert variant={messageType}>{message}</Alert>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Pending', value: submissions.filter(s => s.status === 'pending').length, color: '#92400E' },
            { label: 'Approved', value: approved.length, color: '#2D5A27' },
            { label: 'Rejected', value: submissions.filter(s => s.status === 'rejected').length, color: '#B91C1C' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #E8E4DF', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2rem', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#6B6560', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pending */}
        <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.2rem', color: '#1A1714', marginBottom: '1rem' }}>
          Pending ({pending.length})
        </h2>

        {loading ? (
          <p style={{ color: '#9C9590' }}>Memuat...</p>
        ) : pending.length === 0 ? (
          <p style={{ color: '#9C9590', fontSize: '0.875rem', marginBottom: '2rem' }}>Tidak ada submission pending.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {pending.map((s: any) => (
              <SubmissionCard
                key={s.id} s={s}
                onVerify={() => verify(s.id)}
                onApprove={(mrr: number, rev: number, ord: number) => approve(s.id, mrr, rev, ord)}
                onReject={() => reject(s.id)}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}

        {/* Approved */}
        {approved.length > 0 && (
          <>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.2rem', color: '#1A1714', marginBottom: '1rem' }}>
              Approved ({approved.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {approved.map((s: any) => (
                <div key={s.id} style={{ background: '#fff', border: '1px solid #E8E4DF', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>{s.full_name}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#9C9590', marginLeft: '0.5rem' }}>@{s.username}</span>
                    <span style={{ fontSize: '0.72rem', color: '#2D5A27', background: '#EBF2EA', padding: '0.15rem 0.5rem', borderRadius: '100px', marginLeft: '0.5rem', fontWeight: 600 }}>✓ Approved</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1rem', color: '#1A1714' }}>{formatIDRShort(s.verified_mrr)} MRR</div>
                    <div style={{ fontSize: '0.75rem', color: '#9C9590' }}>{PLATFORM_LABELS[s.platform as keyof typeof PLATFORM_LABELS]}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SubmissionCard({ s, onVerify, onApprove, onReject, actionLoading }: any) {
  const [mrrInput, setMrrInput] = useState('')
  const [revInput, setRevInput] = useState('')
  const [ordInput, setOrdInput] = useState('')
  const [showManual, setShowManual] = useState(false)

  return (
    <div style={{ background: '#fff', border: '1px solid #E8E4DF', borderRadius: '12px', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <strong style={{ fontSize: '0.95rem', color: '#1A1714' }}>{s.full_name}</strong>
          <span style={{ fontSize: '0.8rem', color: '#9C9590', marginLeft: '0.5rem' }}>@{s.username}</span>
          <div style={{ fontSize: '0.78rem', color: '#6B6560', marginTop: '0.25rem' }}>
            📧 {s.email} &nbsp;·&nbsp; {CATEGORY_LABELS[s.category as keyof typeof CATEGORY_LABELS]} &nbsp;·&nbsp; {PLATFORM_LABELS[s.platform as keyof typeof PLATFORM_LABELS]}
          </div>
          {s.bio && <div style={{ fontSize: '0.78rem', color: '#9C9590', marginTop: '0.25rem', fontStyle: 'italic' }}>"{s.bio}"</div>}
          <div style={{ fontSize: '0.75rem', color: '#C0BBB5', marginTop: '0.25rem' }}>
            {new Date(s.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <Button size="sm" variant="secondary" onClick={onVerify} loading={actionLoading === s.id + '_verify'}>
            🔍 Verify via API
          </Button>
          <Button size="sm" variant="danger" onClick={onReject} loading={actionLoading === s.id + '_reject'}>
            Tolak
          </Button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #F3F0ED', paddingTop: '0.75rem' }}>
        <button onClick={() => setShowManual(!showManual)} style={{ fontSize: '0.78rem', color: '#6B6560', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          {showManual ? '▲ Tutup input manual' : '▼ Input manual & approve'}
        </button>
        {showManual && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 130 }}>
              <Input label="MRR (Rupiah)" type="number" placeholder="5000000" value={mrrInput} onChange={e => setMrrInput(e.target.value)} hint="Contoh: 5000000" />
            </div>
            <div style={{ flex: 1, minWidth: 130 }}>
              <Input label="Total Revenue (Rupiah)" type="number" placeholder="50000000" value={revInput} onChange={e => setRevInput(e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: 90 }}>
              <Input label="Total Orders" type="number" placeholder="100" value={ordInput} onChange={e => setOrdInput(e.target.value)} />
            </div>
            <Button
              size="sm"
              onClick={() => onApprove(Number(mrrInput) * 100, Number(revInput) * 100, Number(ordInput))}
              loading={actionLoading === s.id + '_approve'}
              style={{ marginBottom: 2 }}
            >
              ✓ Approve
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}