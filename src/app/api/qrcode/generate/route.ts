import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventGuestId } = body

    if (!eventGuestId) {
      return NextResponse.json(
        { error: 'Event Guest ID wajib diisi' },
        { status: 400 }
      )
    }

    // Get event guest
    const eventGuest = await db.eventGuest.findUnique({
      where: { id: eventGuestId },
      include: {
        event: true,
        guest: true,
      },
    })

    if (!eventGuest) {
      return NextResponse.json(
        { error: 'Tamu tidak ditemukan' },
        { status: 404 }
      )
    }

    // Generate QR Code
    const invitationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/invitation?id=${eventGuest.token}`
    const qrCodeDataUrl = await QRCode.toDataURL(invitationUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })

    // Update event guest with QR code
    const updatedEventGuest = await db.eventGuest.update({
      where: { id: eventGuestId },
      data: {
        qrCode: qrCodeDataUrl,
      },
      include: {
        guest: true,
        event: true,
      },
    })

    return NextResponse.json({
      eventGuest: updatedEventGuest,
      qrCode: qrCodeDataUrl,
    })
  } catch (error) {
    console.error('Generate QR error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat generate QR Code' },
      { status: 500 }
    )
  }
}
