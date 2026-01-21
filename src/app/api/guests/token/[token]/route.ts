import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const eventGuest = await db.eventGuest.findUnique({
      where: { token },
      include: {
        guest: true,
        event: true,
        attendance: true,
      },
    })

    if (!eventGuest) {
      return NextResponse.json(
        { error: 'Tamu tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ eventGuest })
  } catch (error) {
    console.error('Get event guest by token error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data tamu' },
      { status: 500 }
    )
  }
}
