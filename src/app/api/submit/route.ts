import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { full_name, username, email, bio, category, platform, api_key, website, twitter, instagram } = body

    if (!full_name || !username || !email || !category || !platform || !api_key) {
      return NextResponse.json({ error: 'Field wajib tidak lengkap.' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Check username not taken
    const { data: existing } = await supabase.from('submissions').select('id').eq('username', username).single()
    if (existing) return NextResponse.json({ error: 'Username sudah digunakan.' }, { status: 400 })

    const { error } = await supabase.from('submissions').insert({
      full_name, username, email, bio: bio || null, category, platform, api_key,
      website: website || null,
      twitter: twitter || null,
      instagram: instagram || null,
      status: 'pending',
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
