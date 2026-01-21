'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QrCode, Scan, ShieldCheck, User } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const sessionToken = document.cookie.includes('session_token')
    setIsAuthenticated(sessionToken)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-neutral-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="h-8 w-8 text-neutral-900 dark:text-neutral-50" />
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                E-Invitation
              </h1>
            </div>
            {isAuthenticated ? (
              <Button
                onClick={() => router.push('/admin/dashboard')}
                variant="default"
              >
                <User className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            ) : (
              <Button
                onClick={() => router.push('/admin/login')}
                variant="outline"
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Login Admin
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-neutral-900 dark:text-neutral-50">
            Sistem Undangan Digital dengan QR Code
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Manajemen tamu profesional dengan QR Code unik untuk setiap undangan
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="border-2 hover:border-neutral-400 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-neutral-900 dark:text-neutral-50" />
              </div>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Kelola tamu, acara, dan pantau kehadiran secara real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push('/admin/login')}
                className="w-full"
                variant={isAuthenticated ? "default" : "outline"}
              >
                {isAuthenticated ? 'Buka Dashboard' : 'Login Admin'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-neutral-400 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="h-6 w-6 text-neutral-900 dark:text-neutral-50" />
              </div>
              <CardTitle>Undangan Digital</CardTitle>
              <CardDescription>
                Akses undangan personal dengan QR Code unik
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Masukkan token undangan"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  id="invitationToken"
                />
                <Button
                  onClick={() => {
                    const token = document.getElementById('invitationToken') as HTMLInputElement
                    if (token?.value) {
                      router.push(`/invitation?id=${token.value}`)
                    }
                  }}
                  className="w-full"
                  variant="outline"
                >
                  Buka Undangan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-neutral-400 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center mb-4">
                <Scan className="h-6 w-6 text-neutral-900 dark:text-neutral-50" />
              </div>
              <CardTitle>QR Scanner</CardTitle>
              <CardDescription>
                Scan QR Code untuk check-in tamu dengan kamera HP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push('/scanner')}
                className="w-full"
                variant="outline"
              >
                <Scan className="h-4 w-4 mr-2" />
                Buka Scanner
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Cara Menggunakan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Login sebagai Admin</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Gunakan username dan password untuk mengakses dashboard
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Tambahkan Tamu</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Input data tamu, sistem akan otomatis generate QR Code unik
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Kirim Undangan</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Bagikan link undangan beserta QR Code kepada tamu
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Scan QR Code</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Gunakan QR Scanner untuk check-in tamu saat acara
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-neutral-950/50 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            © 2025 E-Invitation System. Sistem undangan digital dengan QR Code.
          </p>
        </div>
      </footer>
    </div>
  )
}
