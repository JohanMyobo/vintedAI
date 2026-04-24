import { supabaseAdmin } from './supabase'

const LIMIT = 5
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

export async function checkRateLimit(ip: string): Promise<{
  allowed: boolean
  retryAfterMs?: number
}> {
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString()

  const { count, error } = await supabaseAdmin
    .from('generations')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', windowStart)

  if (error) {
    console.error('Rate limit check error:', error)
    return { allowed: true }
  }

  if ((count ?? 0) >= LIMIT) {
    const { data: oldest } = await supabaseAdmin
      .from('generations')
      .select('created_at')
      .eq('ip', ip)
      .gte('created_at', windowStart)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    const retryAfterMs = oldest
      ? new Date(oldest.created_at).getTime() + WINDOW_MS - Date.now()
      : WINDOW_MS

    return { allowed: false, retryAfterMs: Math.max(0, retryAfterMs) }
  }

  return { allowed: true }
}

export async function recordGeneration(ip: string): Promise<void> {
  await supabaseAdmin.from('generations').insert({ ip })
}
