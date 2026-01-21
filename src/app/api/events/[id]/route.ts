import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get event details with statistics
    const event = await db.event.findUnique({
      where: { id },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Acara tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get all event guests for this event
    const eventGuests = await db.eventGuest.findMany({
      where: { eventId: id },
      include: {
        guest: true,
        attendance: true,
      },
    })

    // Calculate statistics
    const totalGuests = eventGuests.length
    const checkedInGuests = eventGuests.filter(eg => eg.attendance !== null).length
    const pendingGuests = totalGuests - checkedInGuests
    const rsvpConfirmed = eventGuests.filter(eg => eg.rsvpStatus === 'confirmed').length
    const rsvpPending = eventGuests.filter(eg => eg.rsvpStatus === 'pending').length
    const rsvpRejected = eventGuests.filter(eg => eg.rsvpStatus === 'rejected').length

    // Get recent check-ins
    const recentCheckins = await db.attendance.findMany({
      where: {
        eventGuest: {
          eventId: id,
        },
      },
      orderBy: {
        checkinTime: 'desc',
      },
      take: 10,
      include: {
        eventGuest: {
          include: {
            guest: true,
          },
        },
      },
    })

    return NextResponse.json({
      event,
      statistics: {
        totalGuests,
        checkedInGuests,
        pendingGuests,
        rsvpConfirmed,
        rsvpPending,
        rsvpRejected,
        attendanceRate: totalGuests > 0 ? ((checkedInGuests / totalGuests) * 100).toFixed(1) : 0,
      },
      eventGuests,
      recentCheckins,
    })
  } catch (error) {
    console.error('Get event details error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil detail acara' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Delete event (this will cascade delete all eventGuests and attendance)
    await db.event.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Acara berhasil dihapus' })
  } catch (error) {
    console.error('Delete event error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus acara' },
      { status: 500 }
    )
  }
}
