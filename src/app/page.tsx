'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QrCode, ShieldCheck } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const sessionToken = document.cookie.includes('session_token')
    setIsAuthenticated(sessionToken)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-neutral-950 dark:to-neutral-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg">
                <QrCode className="h-7 w-7 text-white" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  Majelis Khirriji Al-Haromain
                </h1>
                <p className="text-sm text-green-700 dark:text-green-500 font-semibold">
                  Riyadlul Jannah
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-green-600 via-green-700 to-green-800 flex items-center justify-center shadow-2xl">
              <QrCode className="h-20 w-20 text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-neutral-900 dark:text-neutral-50">
            Sistem Undangan Digital
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Majelis Khirriji Al-Haromain - Riyadlul Jannah
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="border-2 border-green-200 hover:border-green-500 hover:shadow-xl transition-all">
            <CardHeader>
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center mb-4 shadow-md">
                <QrCode className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl">Undangan Digital</CardTitle>
              <CardDescription className="text-base">
                Akses undangan personal dengan QR Code unik
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Masukkan token undangan"
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg text-sm focus:border-green-500 focus:outline-none transition-colors"
                  id="invitationToken"
                />
                <Button
                  onClick={() => {
                    const token = document.getElementById('invitationToken') as HTMLInputElement
                    if (token?.value) {
                      router.push(`/invitation?id=${token.value}`)
                    }
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 text-base font-semibold shadow-md"
                >
                  Buka Undangan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 hover:border-green-500 hover:shadow-xl transition-all">
            <CardHeader>
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center mb-4 shadow-md">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl">Admin Dashboard</CardTitle>
              <CardDescription className="text-base">
                Kelola tamu dan pantau kehadiran acara
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push('/admin/login')}
                className="w-full py-3 text-base font-semibold"
                variant="outline"
              >
                {isAuthenticated ? 'Buka Dashboard' : 'Login Admin'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <Card className="border-2 border-green-200 dark:border-green-900 shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl text-green-800 dark:text-green-500">Cara Menggunakan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-lg">Buka Undangan Digital</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Masukkan token undangan yang diterima untuk melihat detail acara
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-lg">Konfirmasi Kehadiran</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Isi formulir konfirmasi kehadiran pada halaman undangan
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-lg">Simpan QR Code</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Download dan simpan QR Code untuk check-in saat acara berlangsung
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            © 2025 Majelis Khirriji Al-Haromain - Riyadlul Jannah
          </p>
        </div>
      </footer>
    </div>
  )
}
