import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseBrowser } from '@/lib/supabaseBrowser'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = getSupabaseBrowser()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/saved`)
}
