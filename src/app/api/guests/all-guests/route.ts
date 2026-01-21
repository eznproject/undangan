import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const search = searchParams.get('search')

    // Build query
    const where: any = {}

    // If eventId is provided, get guests NOT already invited to this event
    if (eventId) {
      const invitedGuestIds = await db.$queryRaw`
        SELECT "guestId" FROM "EventGuest" WHERE "eventId" = ${eventId}
      `
      where.id = {
        notIn: (invitedGuestIds as any[]).map((row: any) => row.guestId),
      }
    }

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { whatsapp: { contains: search } },
        { area: { contains: search, mode: 'insensitive' } },
      ]
    }

    const guests = await db.guest.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ guests })
  } catch (error) {
    console.error('Get all guests error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data tamu' },
      { status: 500 }
    )
  }
}
