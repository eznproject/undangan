import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, guests } = body

    if (!eventId || !guests || !Array.isArray(guests)) {
      return NextResponse.json(
        { error: 'Event ID dan data tamu wajib diisi' },
        { status: 400 }
      )
    }

    if (guests.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data tamu untuk diimport' },
        { status: 400 }
      )
    }

    const results = {
      success: 0,
      skipped: 0,
      errors: 0,
      details: [] as Array<{
        name: string
        whatsapp: string
        status: string
        message?: string
      }>,
    }

    for (const guestData of guests) {
      try {
        const { name, whatsapp, address, area } = guestData

        if (!name || !whatsapp) {
          results.errors++
          results.details.push({
            name: name || '-',
            whatsapp: whatsapp || '-',
            status: 'error',
            message: 'Nama dan WhatsApp wajib diisi',
          })
          continue
        }

        // Check if guest already exists
        let guest = await db.guest.findFirst({
          where: {
            whatsapp: whatsapp.toString().trim(),
          },
        })

        // Create new guest if not exists
        if (!guest) {
          guest = await db.guest.create({
            data: {
              name: name.toString().trim(),
              whatsapp: whatsapp.toString().trim(),
              address: address?.toString().trim(),
              area: area?.toString().trim(),
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
          results.skipped++
          results.details.push({
            name: guest.name,
            whatsapp: guest.whatsapp,
            status: 'skipped',
            message: 'Tamu sudah diundang ke acara ini',
          })
          continue
        }

        // Generate unique token
        const token = crypto.randomBytes(32).toString('hex')

        // Create event guest (invite guest to event)
        await db.eventGuest.create({
          data: {
            eventId,
            guestId: guest.id,
            token,
            rsvpStatus: 'pending',
          },
        })

        results.success++
        results.details.push({
          name: guest.name,
          whatsapp: guest.whatsapp,
          status: 'success',
        })
      } catch (error) {
        console.error('Error importing guest:', error)
        results.errors++
        results.details.push({
          name: guestData.name || '-',
          whatsapp: guestData.whatsapp || '-',
          status: 'error',
          message: 'Terjadi kesalahan saat memproses tamu',
        })
      }
    }

    return NextResponse.json({ results }, { status: 200 })
  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat import data tamu' },
      { status: 500 }
    )
  }
}
