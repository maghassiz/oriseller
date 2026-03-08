'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Button, Input, Textarea, Select, Alert } from '@/components/ui'
import { CATEGORIES, PLATFORMS } from '@/types'

const STEPS = ['Identitas', 'Platform', 'Sosial']

export default function SubmitPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    full_name: '', username: '', email: '', bio: '', category: '',
    platform: '', api_key: '',
    website: '', twitter: '', instagram: '',
  })

  const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan')
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function next() {
    if (step === 0 && (!form.full_name || !form.username || !form.email || !form.category)) {
      setError('Lengkapi semua field yang wajib diisi.')
      return
    }
    if (step === 1 && (!form.platform || !form.api_key)) {
      setError('Pilih platform dan masukkan API key.')
      return
    }
    setError('')
    if (step < 2) setStep(s => s + 1)
    else handleSubmit()
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#F9F7F4' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 440 }}>
            <div style={{ width: 64, height: 64, background: '#EBF2EA', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.75rem' }}>✓</div>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.75rem', color: '#1A1714', marginBottom: '0.75rem' }}>Submission Diterima!</h1>
            <p style={{ color: '#6B6560', lineHeight: 1.7, marginBottom: '2rem' }}>
              Kami akan memverifikasi revenue kamu via API dalam 1–2 hari kerja. Kamu akan muncul di leaderboard setelah diverifikasi.
            </p>
            <Link href="/leaderboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#1A1714', color: '#fff', padding: '0.7rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              Lihat Leaderboard →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9F7F4' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '100px 2rem 4rem', minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.75rem', color: '#1A1714', marginBottom: '0.5rem' }}>Daftarkan Revenue Kamu</h1>
            <p style={{ fontSize: '0.875rem', color: '#6B6560' }}>Kami verifikasi langsung dari payment gateway kamu.</p>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem', alignItems: 'center' }}>
                <div style={{ height: 3, width: '100%', borderRadius: '2px', background: i <= step ? '#1A1714' : '#E8E4DF', transition: 'background 0.3s' }} />
                <span style={{ fontSize: '0.7rem', color: i <= step ? '#1A1714' : '#9C9590', fontWeight: i <= step ? 600 : 400 }}>{s}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E8E4DF', borderRadius: '16px', padding: '2rem' }}>
            {error && <div style={{ marginBottom: '1.25rem' }}><Alert variant="error">{error}</Alert></div>}

            {step === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Input label="Nama Lengkap *" placeholder="Budi Santoso" value={form.full_name} onChange={e => update('full_name', e.target.value)} />
                <Input label="Username *" prefix="@" placeholder="budisantoso" value={form.username} hint="Digunakan untuk URL profil publik" onChange={e => update('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} />
                <Input label="Email *" type="email" placeholder="kamu@email.com" value={form.email} onChange={e => update('email', e.target.value)} hint="Untuk notifikasi verifikasi. Tidak ditampilkan publik." />
                <Textarea label="Bio" placeholder="Ceritakan tentang produk digitalmu..." value={form.bio} onChange={e => update('bio', e.target.value)} hint="Opsional. Maks 200 karakter." maxLength={200} />
                <Select label="Kategori Produk *" options={CATEGORIES} placeholder="Pilih kategori..." value={form.category} onChange={e => update('category', e.target.value)} />
              </div>
            )}

            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Select label="Platform *" options={PLATFORMS} placeholder="Pilih platform..." value={form.platform} onChange={e => update('platform', e.target.value)} hint="Platform yang kamu gunakan untuk menjual produk digital." />
                <Input
                  label="API Key *"
                  type="password"
                  placeholder={form.platform === 'mayar' ? 'myr_...' : form.platform === 'scalev' ? 'sk_...' : 'API key kamu'}
                  value={form.api_key}
                  onChange={e => update('api_key', e.target.value)}
                  hint="API key hanya digunakan untuk verifikasi sekali. Disimpan terenkripsi dan tidak pernah ditampilkan publik."
                />
                <div style={{ background: '#F9F7F4', border: '1px solid #E8E4DF', borderRadius: '10px', padding: '1rem', fontSize: '0.8rem', color: '#6B6560', lineHeight: 1.6 }}>
                  <strong style={{ color: '#1A1714', display: 'block', marginBottom: '0.375rem' }}>Cara mendapatkan API key:</strong>
                  {form.platform === 'mayar' && <span>Mayar Dashboard → Settings → API → Generate API Key</span>}
                  {form.platform === 'scalev' && <span>Scalev Dashboard → Settings → Developers → API Keys → Create API Key (pilih Secret)</span>}
                  {form.platform === 'lynk' && <span>Lynk Dashboard → Settings → Integrations → API Key</span>}
                  {!form.platform && <span>Pilih platform terlebih dahulu.</span>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#6B6560', marginBottom: '0.5rem' }}>Opsional, tapi membantu calon pembeli mengenalmu.</p>
                <Input label="Website" prefix="https://" placeholder="websitekamu.com" value={form.website} onChange={e => update('website', e.target.value)} />
                <Input label="Twitter / X" prefix="@" placeholder="username" value={form.twitter} onChange={e => update('twitter', e.target.value)} />
                <Input label="Instagram" prefix="@" placeholder="username" value={form.instagram} onChange={e => update('instagram', e.target.value)} />
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
              {step > 0 && (
                <Button variant="secondary" onClick={() => { setStep(s => s - 1); setError('') }} style={{ flex: 1 }}>
                  ← Kembali
                </Button>
              )}
              <Button onClick={next} loading={loading} style={{ flex: 2 }}>
                {step < 2 ? 'Lanjut →' : 'Submit Sekarang'}
              </Button>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9C9590', marginTop: '1.25rem', lineHeight: 1.6 }}>
            Dengan submit, kamu setuju bahwa data revenue yang ditampilkan diambil langsung dari API platform kamu.
          </p>
        </div>
      </div>
    </div>
  )
}
