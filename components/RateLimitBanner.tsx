'use client'

import { useEffect, useState } from 'react'

interface Props {
  retryAfterMs: number
  onExpire: () => void
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
}

export default function RateLimitBanner({ retryAfterMs, onExpire }: Props) {
  const [remaining, setRemaining] = useState(retryAfterMs)

  useEffect(() => {
    if (remaining <= 0) {
      onExpire()
      return
    }
    const timer = setInterval(() => {
      setRemaining((r) => {
        const next = r - 1000
        if (next <= 0) {
          clearInterval(timer)
          onExpire()
          return 0
        }
        return next
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [retryAfterMs])

  return (
    <div className="rounded-xl bg-orange-50 border border-orange-300 p-4 text-orange-800 text-sm flex items-start gap-3">
      <span className="text-xl">⏳</span>
      <div>
        <p className="font-semibold">Limite de 5 générations/heure atteinte</p>
        <p className="mt-1">
          Prochain slot disponible dans{' '}
          <span className="font-mono font-bold">{formatCountdown(remaining)}</span>
        </p>
      </div>
    </div>
  )
}
