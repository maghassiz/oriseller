import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'admin123'

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-key') === ADMIN_KEY
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = await createAdminClient()
  const { data } = await supabase.from('submissions').select('*').order('submitted_at', { ascending: false })
  return NextResponse.json({ submissions: data || [] })
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action, id } = body
  const supabase = await createAdminClient()

  if (action === 'verify') {
    // Pull submission data
    const { data: sub } = await supabase.from('submissions').select('*').eq('id', id).single()
    if (!sub) return NextResponse.json({ error: 'Submission not found' }, { status: 404 })

    try {
      let mrr = 0, totalRevenue = 0, totalOrders = 0

      if (sub.platform === 'scalev') {
        const res = await fetch('https://api.scalev.com/v2/order', {
          headers: { 'Authorization': `Bearer ${sub.api_key}` }
        })
        if (!res.ok) return NextResponse.json({ error: `Scalev API error: ${res.status} ${res.statusText}` })
        const data = await res.json()
        const orders = data.data || []
        const paid = orders.filter((o: any) => o.status === 'paid' || o.payment_status === 'paid')
        totalOrders = paid.length
        totalRevenue = paid.reduce((s: number, o: any) => s + (o.total || o.amount || 0), 0) * 100 // to cents
        const now = new Date()
        const thisMonth = paid.filter((o: any) => {
          const d = new Date(o.created_at || o.paid_at)
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        })
        mrr = thisMonth.reduce((s: number, o: any) => s + (o.total || o.amount || 0), 0) * 100
      }

      if (sub.platform === 'mayar') {
        const res = await fetch('https://api.mayar.id/hl/v1/payment/list?status=paid&pageSize=100', {
          headers: { 'Authorization': `Bearer ${sub.api_key}` }
        })
        if (!res.ok) return NextResponse.json({ error: `Mayar API error: ${res.status}` })
        const data = await res.json()
        const payments = data.data || []
        totalOrders = payments.length
        totalRevenue = payments.reduce((s: number, p: any) => s + (p.amount || 0), 0) * 100
        const now = new Date()
        const thisMonth = payments.filter((p: any) => {
          const d = new Date(p.createdAt || p.created_at)
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        })
        mrr = thisMonth.reduce((s: number, p: any) => s + (p.amount || 0), 0) * 100
      }

      // Update with verified data
      await supabase.from('submissions').update({
        verified_mrr: mrr,
        verified_total_revenue: totalRevenue,
        verified_total_orders: totalOrders,
        status: 'approved',
        verified_at: new Date().toISOString(),
      }).eq('id', id)

      return NextResponse.json({ message: `✓ Verified & approved! MRR: Rp ${(mrr/100).toLocaleString('id-ID')}` })
    } catch (err: any) {
      return NextResponse.json({ error: `Verification failed: ${err.message}` }, { status: 500 })
    }
  }

  if (action === 'approve') {
    const { mrr, total_revenue, total_orders } = body
    await supabase.from('submissions').update({
      status: 'approved',
      verified_mrr: mrr || 0,
      verified_total_revenue: total_revenue || 0,
      verified_total_orders: total_orders || 0,
      verified_at: new Date().toISOString(),
    }).eq('id', id)
    return NextResponse.json({ message: '✓ Submission approved!' })
  }

  if (action === 'reject') {
    await supabase.from('submissions').update({
      status: 'rejected',
      rejection_reason: body.reason || null,
    }).eq('id', id)
    return NextResponse.json({ message: 'Submission rejected.' })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
