import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'admin123'

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-key') === ADMIN_KEY
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = await createAdminClient()
  const { data, error } = await supabase.from('submissions').select('*').order('submitted_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ submissions: data || [] })
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action, id } = body
  const supabase = await createAdminClient()

  if (action === 'verify') {
    const { data: sub } = await supabase.from('submissions').select('*').eq('id', id).single()
    if (!sub) return NextResponse.json({ error: 'Submission not found' }, { status: 404 })

    try {
      let mrr = 0, totalRevenue = 0, totalOrders = 0

      if (sub.platform === 'scalev') {
        console.log('Calling Scalev API for:', sub.username)

        let res: Response
        try {
          res = await fetch('https://api.scalev.id/v2/order', {
            headers: { 'Authorization': `Bearer ${sub.api_key}` }
          })
        } catch (fetchErr: any) {
          console.error('Scalev fetch error:', fetchErr)
          return NextResponse.json({ error: `Scalev network error: ${fetchErr.message}` }, { status: 500 })
        }

        console.log('Scalev response status:', res.status)
        const rawText = await res.text()
        console.log('Scalev response body:', rawText.substring(0, 500))

        if (!res.ok) {
          return NextResponse.json({ error: `Scalev API ${res.status}: ${rawText.substring(0, 200)}` }, { status: 500 })
        }

        let data: any
        try {
          data = JSON.parse(rawText)
        } catch {
          return NextResponse.json({ error: `Scalev returned invalid JSON: ${rawText.substring(0, 200)}` }, { status: 500 })
        }

        // Log full data.data shape to understand structure
        console.log('data.data type:', typeof data.data, 'isArray:', Array.isArray(data.data))
        if (data.data && typeof data.data === 'object') {
          console.log('data.data keys:', Object.keys(data.data))
        }

        // Scalev response: { code, status, data: { data: [...], total, ... } } or { data: [...] }
        let orders: any[] = []
        if (Array.isArray(data.data)) {
          orders = data.data
        } else if (Array.isArray(data.data?.data)) {
          orders = data.data.data
        } else if (Array.isArray(data.data?.items)) {
          orders = data.data.items
        } else if (Array.isArray(data.data?.results)) {
          orders = data.data.results
        } else if (Array.isArray(data.data?.orders)) {
          orders = data.data.orders
        } else {
          // Last resort: log everything and return error with full shape
          console.log('Full response:', JSON.stringify(data).substring(0, 500))
          return NextResponse.json({ error: `Cannot find orders array. data.data keys: ${data.data ? Object.keys(data.data).join(', ') : 'null'}` }, { status: 500 })
        }
        console.log('Orders found:', orders.length)

        const paid = orders.filter((o: any) => ['paid', 'success', 'completed'].includes(o.status || o.payment_status))
        totalOrders = paid.length
        totalRevenue = paid.reduce((s: number, o: any) => s + Number(o.total || o.amount || o.grand_total || 0), 0) * 100
        const now = new Date()
        const thisMonth = paid.filter((o: any) => {
          const d = new Date(o.created_at || o.paid_at || o.updated_at)
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        })
        mrr = thisMonth.reduce((s: number, o: any) => s + Number(o.total || o.amount || o.grand_total || 0), 0) * 100
      }

      if (sub.platform === 'mayar') {
        console.log('Calling Mayar API for:', sub.username)

        let res: Response
        try {
          res = await fetch('https://api.mayar.id/hl/v1/payment/list?status=paid&pageSize=100', {
            headers: { 'Authorization': `Bearer ${sub.api_key}` }
          })
        } catch (fetchErr: any) {
          return NextResponse.json({ error: `Mayar network error: ${fetchErr.message}` }, { status: 500 })
        }

        const rawText = await res.text()
        console.log('Mayar status:', res.status, 'body:', rawText.substring(0, 300))

        if (!res.ok) return NextResponse.json({ error: `Mayar API ${res.status}: ${rawText.substring(0, 200)}` }, { status: 500 })

        const data = JSON.parse(rawText)
        const payments = data.data || []
        totalOrders = payments.length
        totalRevenue = payments.reduce((s: number, p: any) => s + Number(p.amount || 0), 0) * 100
        const now = new Date()
        const thisMonth = payments.filter((p: any) => {
          const d = new Date(p.createdAt || p.created_at)
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        })
        mrr = thisMonth.reduce((s: number, p: any) => s + Number(p.amount || 0), 0) * 100
      }

      if (sub.platform === 'lynk') {
        return NextResponse.json({ error: 'Lynk tidak mendukung auto-verify. Gunakan input manual.' }, { status: 400 })
      }

      await supabase.from('submissions').update({
        verified_mrr: mrr,
        verified_total_revenue: totalRevenue,
        verified_total_orders: totalOrders,
        status: 'approved',
        verified_at: new Date().toISOString(),
      }).eq('id', id)

      return NextResponse.json({
        message: `✓ Verified & approved! MRR: Rp ${(mrr / 100).toLocaleString('id-ID')} · Orders: ${totalOrders}`
      })

    } catch (err: any) {
      console.error('Verify error:', err)
      return NextResponse.json({ error: `Verification failed: ${err.message}` }, { status: 500 })
    }
  }

  if (action === 'approve') {
    const { mrr, total_revenue, total_orders } = body
    const { error } = await supabase.from('submissions').update({
      status: 'approved',
      verified_mrr: mrr || 0,
      verified_total_revenue: total_revenue || 0,
      verified_total_orders: total_orders || 0,
      verified_at: new Date().toISOString(),
    }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
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