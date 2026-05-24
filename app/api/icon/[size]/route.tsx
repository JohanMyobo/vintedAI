import { ImageResponse } from 'next/og'

export async function GET(_req: Request, { params }: { params: { size: string } }) {
  const size = Math.min(512, Math.max(16, parseInt(params.size) || 192))

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1D9E75',
        borderRadius: '20%',
        color: 'white',
        fontSize: Math.round(size * 0.55),
        fontWeight: 900,
        fontFamily: 'sans-serif',
      }}
    >
      V
    </div>,
    { width: size, height: size }
  )
}
