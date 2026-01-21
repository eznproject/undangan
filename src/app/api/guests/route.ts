import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

// GET all event guests for an event
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

    const eventGuests = await db.eventGuest.findMany({
      where: { eventId },
      include: {
        guest: true,
        event: true,
        attendance: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ eventGuests })
  } catch (error) {
    console.error('Get event guests error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data tamu' },
      { status: 500 }
    )
  }
}

// POST create new guest and add to event (single guest)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, name, whatsapp, address, area } = body

    if (!eventId || !name || !whatsapp) {
      return NextResponse.json(
        { error: 'Event ID, nama, dan whatsapp wajib diisi' },
        { status: 400 }
      )
    }

    // Check if guest already exists
    let guest = await db.guest.findFirst({
      where: {
        whatsapp,
      },
    })

    // Create new guest if not exists
    if (!guest) {
      guest = await db.guest.create({
        data: {
          name,
          whatsapp,
          address,
          area,
        },
      })
    }

    // Check if guest is already invited to this event
    const existingEventGuest = await db.eventGuest.findFirst({
      where: {
        eventId,
        guestId: guest.id,
      },
    })

    if (existingEventGuest) {
      return NextResponse.json(
        { error: 'Tamu sudah diundang ke acara ini' },
        { status: 400 }
      )
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex')

    // Create event guest (invite guest to event)
    const eventGuest = await db.eventGuest.create({
      data: {
        eventId,
        guestId: guest.id,
        token,
        rsvpStatus: 'pending',
      },
      include: {
        guest: true,
        event: true,
      },
    })

    return NextResponse.json({ eventGuest }, { status: 201 })
  } catch (error) {
    console.error('Create guest error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat tamu' },
      { status: 500 }
    )
  }
}
