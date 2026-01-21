import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Token wajib diisi' },
        { status: 400 }
      )
    }

    // Find event guest by token
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
        { error: 'QR Code tidak valid' },
        { status: 404 }
      )
    }

    // Check if already checked in
    if (eventGuest.attendance) {
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        guest: {
          name: eventGuest.guest.name,
          checkinTime: eventGuest.attendance.checkinTime,
          eventName: eventGuest.event.title,
        },
        message: 'QR Code sudah digunakan',
      })
    }

    // Create attendance record
    const attendance = await db.attendance.create({
      data: {
        eventGuestId: eventGuest.id,
        checkinTime: new Date(),
        status: 'checked_in',
      },
    })

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: false,
      guest: {
        name: eventGuest.guest.name,
        checkinTime: attendance.checkinTime,
        eventName: eventGuest.event.title,
      },
      message: 'Check-in berhasil',
    })
  } catch (error) {
    console.error('Scan error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat scan' },
      { status: 500 }
    )
  }
}
