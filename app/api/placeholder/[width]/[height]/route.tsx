import { NextRequest } from 'next/server'
import { ImageResponse } from 'next/og'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ width: string; height: string }> }
) {
  const { width, height } = await params
  const { searchParams } = new URL(request.url)
  const text = searchParams.get('text') || 'No Image'

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 30,
          background: '#e5e5e5',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666666',
        }}
      >
        {text}
      </div>
    ),
    {
      width: parseInt(width),
      height: parseInt(height),
    }
  )
}