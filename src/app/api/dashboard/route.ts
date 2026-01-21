import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID wajib diisi' },
        { status: 400 }
      )
    }

    // Get total guests
    const totalGuests = await db.eventGuest.count({
      where: { eventId },
    })

    // Get checked in guests
    const checkedInGuests = await db.eventGuest.count({
      where: {
        eventId,
        attendance: {
          isNot: null,
        },
      },
    })

    // Get RSVP statuses
    const rsvpConfirmed = await db.eventGuest.count({
      where: {
        eventId,
        rsvpStatus: 'confirmed',
      },
    })

    const rsvpPending = await db.eventGuest.count({
      where: {
        eventId,
        rsvpStatus: 'pending',
      },
    })

    const rsvpRejected = await db.eventGuest.count({
      where: {
        eventId,
        rsvpStatus: 'rejected',
      },
    })

    // Get recent check-ins
    const recentCheckins = await db.attendance.findMany({
      take: 10,
      orderBy: {
        checkinTime: 'desc',
      },
      include: {
        eventGuest: {
          include: {
            guest: true,
            event: true,
          },
        },
      },
    })

    return NextResponse.json({
      totalGuests,
      checkedInGuests,
      pendingGuests: totalGuests - checkedInGuests,
      rsvpConfirmed,
      rsvpPending,
      rsvpRejected,
      recentCheckins,
    })
  } catch (error) {
    console.error('Get dashboard error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data dashboard' },
      { status: 500 }
    )
  }
}
