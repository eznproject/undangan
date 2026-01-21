import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all events
export async function GET(request: NextRequest) {
  try {
    const events = await db.event.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Get events error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data acara' },
      { status: 500 }
    )
  }
}

// POST create event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, date, time, location, description } = body

    if (!title || !date || !time || !location) {
      return NextResponse.json(
        { error: 'Title, date, time, dan location wajib diisi' },
        { status: 400 }
      )
    }

    const event = await db.event.create({
      data: {
        title,
        date,
        time,
        location,
        description,
      },
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat acara' },
      { status: 500 }
    )
  }
}
