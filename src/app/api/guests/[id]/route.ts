import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET event guest by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const eventGuest = await db.eventGuest.findUnique({
      where: { id },
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
    console.error('Get event guest error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data tamu' },
      { status: 500 }
    )
  }
}

// PUT update event guest (RSVP status)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { rsvpStatus } = body

    const eventGuest = await db.eventGuest.update({
      where: { id },
      data: {
        ...(rsvpStatus && { rsvpStatus }),
      },
      include: {
        guest: true,
        event: true,
      },
    })

    return NextResponse.json({ eventGuest })
  } catch (error) {
    console.error('Update event guest error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate tamu' },
      { status: 500 }
    )
  }
}

// DELETE event guest (remove from event, not delete guest record)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.eventGuest.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete event guest error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus tamu dari acara' },
      { status: 500 }
    )
  }
}
