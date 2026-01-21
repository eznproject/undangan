import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, guestIds } = body

    if (!eventId || !guestIds || !Array.isArray(guestIds)) {
      return NextResponse.json(
        { error: 'Event ID dan guest IDs wajib diisi' },
        { status: 400 }
      )
    }

    if (guestIds.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada tamu yang dipilih' },
        { status: 400 }
      )
    }

    const results = {
      success: 0,
      skipped: 0,
    }

    for (const guestId of guestIds) {
      // Check if guest is already invited to this event
      const existingEventGuest = await db.eventGuest.findFirst({
        where: {
          eventId,
          guestId,
        },
      })

      if (existingEventGuest) {
        results.skipped++
        continue
      }

      // Generate unique token
      const token = crypto.randomBytes(32).toString('hex')

      // Create event guest (invite guest to event)
      await db.eventGuest.create({
        data: {
          eventId,
          guestId,
          token,
          rsvpStatus: 'pending',
        },
      })

      results.success++
    }

    return NextResponse.json({ results }, { status: 200 })
  } catch (error) {
    console.error('Invite guests error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengundang tamu' },
      { status: 500 }
    )
  }
}
