import { sql } from './db'

const LIMIT = 5
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

export async function checkRateLimit(ip: string): Promise<{
  allowed: boolean
  retryAfterMs?: number
}> {
  try {
    const windowStart = new Date(Date.now() - WINDOW_MS).toISOString()
    const rows = await sql`
      SELECT COUNT(*)::int AS count FROM generations
      WHERE ip = ${ip} AND created_at > ${windowStart}
    `
    const count = rows[0]?.count ?? 0

    if (count >= LIMIT) {
      const oldest = await sql`
        SELECT created_at FROM generations
        WHERE ip = ${ip} AND created_at > ${windowStart}
        ORDER BY created_at ASC LIMIT 1
      `
      const retryAfterMs = oldest[0]
        ? new Date(oldest[0].created_at).getTime() + WINDOW_MS - Date.now()
        : WINDOW_MS
      return { allowed: false, retryAfterMs: Math.max(0, retryAfterMs) }
    }

    return { allowed: true }
  } catch (err) {
    console.error('Rate limit check error:', err)
    return { allowed: true }
  }
}

export async function recordGeneration(ip: string): Promise<void> {
  await sql`INSERT INTO generations (ip) VALUES (${ip})`
}
