'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QrCode, MapPin, Clock, Calendar, Share2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

interface Guest {
  id: string
  token: string
  rsvpStatus: string
  qrCode?: string
  attendance?: {
    checkinTime: string
  } | null
  guest: {
    name: string
    whatsapp: string
    address?: string
    area?: string
  }
  event: {
    title: string
    date: string
    time: string
    location: string
    description?: string
  }
}

export default function InvitationPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('id')
  const [guest, setGuest] = useState<Guest | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingRsvp, setUpdatingRsvp] = useState(false)

  useEffect(() => {
    if (token) {
      fetchGuest()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchGuest = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/guests/token/${token}`)
      const data = await response.json()

      if (response.ok) {
        setGuest(data.eventGuest)
      } else {
        toast.error('Undangan tidak valid atau tidak ditemukan')
      }
    } catch (error) {
      toast.error('Gagal memuat undangan')
    } finally {
      setLoading(false)
    }
  }

  const handleRsvp = async (status: 'confirmed' | 'rejected') => {
    if (!guest) return

    setUpdatingRsvp(true)
    try {
      const response = await fetch(`/api/guests/${guest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rsvpStatus: status }),
      })

      if (response.ok) {
        const data = await response.json()
        setGuest(data.eventGuest)
        toast.success(status === 'confirmed' ? 'Konfirmasi kehadiran berhasil' : 'Mohon maaf Anda tidak dapat hadir')
      } else {
        toast.error('Gagal mengupdate RSVP')
      }
    } catch (error) {
      toast.error('Gagal mengupdate RSVP')
    } finally {
      setUpdatingRsvp(false)
    }
  }

  const shareInvitation = async () => {
    const shareData = {
      title: guest?.event.title || 'Undangan',
      text: `Anda diundang ke ${guest?.event.title}`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link undangan berhasil disalin')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memuat undangan...</p>
      </div>
    )
  }

  if (!guest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <QrCode className="h-16 w-16 text-neutral-400" />
              </div>
              <h2 className="text-2xl font-bold">Undangan Tidak Ditemukan</h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Pastikan link undangan yang Anda akses benar
              </p>
              <Button onClick={() => window.location.href = '/'}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Beranda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-neutral-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => window.location.href = '/'}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <Button variant="ghost" onClick={shareInvitation}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Invitation Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-neutral-900 dark:text-neutral-50">
                  Undangan Digital
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Kepada Yth. Bapak/Ibu/Saudara/i
                </p>
              </div>

              {/* Guest Name */}
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-6 mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-center text-neutral-900 dark:text-neutral-50">
                  {guest.guest.name}
                </h2>
                {guest.guest.area && (
                  <p className="text-center text-neutral-600 dark:text-neutral-400 mt-2">
                    Area: {guest.guest.area}
                  </p>
                )}
                {guest.guest.address && (
                  <p className="text-center text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {guest.guest.address}
                  </p>
                )}
              </div>

              {/* Event Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 mt-0.5 text-neutral-600 dark:text-neutral-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-50">Tanggal</p>
                    <p className="text-neutral-600 dark:text-neutral-400">{guest.event.date}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 mt-0.5 text-neutral-600 dark:text-neutral-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-50">Waktu</p>
                    <p className="text-neutral-600 dark:text-neutral-400">{guest.event.time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5 text-neutral-600 dark:text-neutral-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-50">Lokasi</p>
                    <p className="text-neutral-600 dark:text-neutral-400">{guest.event.location}</p>
                  </div>
                </div>
                {guest.event.description && (
                  <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line">
                      {guest.event.description}
                    </p>
                  </div>
                )}
              </div>

              {/* QR Code */}
              {guest.qrCode ? (
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow-inner">
                    <img
                      src={guest.qrCode}
                      alt="QR Code Undangan"
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                    Tunjukkan QR Code ini saat check-in di acara
                  </p>
                </div>
              ) : (
                <div className="text-center py-4 mb-6">
                  <p className="text-neutral-600 dark:text-neutral-400">
                    QR Code akan segera tersedia
                  </p>
                </div>
              )}

              {/* RSVP Status */}
              <div className="border-t pt-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    Status Konfirmasi Kehadiran
                  </p>
                  <Badge
                    variant={
                      guest.rsvpStatus === 'confirmed' ? 'default' :
                      guest.rsvpStatus === 'rejected' ? 'destructive' : 'secondary'
                    }
                    className="text-base px-4 py-1"
                  >
                    {guest.rsvpStatus === 'confirmed' ? 'Akan Hadir' :
                     guest.rsvpStatus === 'rejected' ? 'Tidak Dapat Hadir' : 'Belum Dikonfirmasi'}
                  </Badge>
                </div>

                {guest.rsvpStatus === 'pending' && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleRsvp('confirmed')}
                      disabled={updatingRsvp}
                      className="flex-1"
                    >
                      {updatingRsvp ? 'Memproses...' : 'Saya Akan Hadir'}
                    </Button>
                    <Button
                      onClick={() => handleRsvp('rejected')}
                      disabled={updatingRsvp}
                      variant="outline"
                      className="flex-1"
                    >
                      {updatingRsvp ? 'Memproses...' : 'Tidak Dapat Hadir'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Check-in Status */}
              {guest.attendance && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 justify-center">
                    <Badge className="bg-green-600">Sudah Check-in</Badge>
                  </div>
                  <p className="text-sm text-center text-neutral-600 dark:text-neutral-400 mt-2">
                    Waktu: {new Date(guest.attendance.checkinTime).toLocaleString('id-ID')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 text-neutral-900 dark:text-neutral-50">Informasi Penting</h3>
              <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                <li>• Simpan QR Code untuk ditunjukkan saat check-in</li>
                <li>• Konfirmasi kehadiran Anda sebelum acara dimulai</li>
                <li>• Pastikan datang tepat waktu sesuai jadwal</li>
                <li>• QR Code hanya dapat digunakan 1 kali</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-neutral-950/50 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            © 2025 E-Invitation System - Terima kasih atas kehadiran Anda
          </p>
        </div>
      </footer>
    </div>
  )
}
