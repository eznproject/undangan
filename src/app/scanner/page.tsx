'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Scan, ArrowLeft, Camera, CameraOff, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface ScanResult {
  success: boolean
  alreadyCheckedIn: boolean
  guest: {
    name: string
    checkinTime: string
    eventName: string
  }
  message: string
}

export default function ScannerPage() {
  const router = useRouter()
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scannerReady, setScannerReady] = useState(false)
  const [error, setError] = useState<string>('')
  const [shouldStartScanning, setShouldStartScanning] = useState(false)
  const html5QrcodeRef = useRef<any>(null)
  const readerRef = useRef<HTMLDivElement>(null)

  // Initialize scanner when element is ready and scanning is requested
  useEffect(() => {
    if (shouldStartScanning && readerRef.current && !scanning && !scanResult) {
      initializeScanner()
      setShouldStartScanning(false)
    }
  }, [shouldStartScanning, readerRef.current])

  useEffect(() => {
    // Load html5-qrcode dynamically
    if (typeof window !== 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/html5-qrcode'
      script.async = true
      script.onload = () => {
        console.log('html5-qrcode loaded')
        setScannerReady(true)
      }
      script.onerror = () => {
        console.error('Failed to load html5-qrcode')
        setError('Gagal memuat library scanner')
      }
      document.head.appendChild(script)
    }

    return () => {
      stopScanner()
    }
  }, [])

  const initializeScanner = async () => {
    try {
      setError('')
      setScanResult(null)

      // Check if element exists
      if (!readerRef.current) {
        console.error('Scanner element not found')
        setError('Element scanner tidak ditemukan. Silakan refresh halaman.')
        return
      }

      // @ts-ignore - html5-qrcode is loaded via script
      const Html5Qrcode = window.Html5Qrcode

      if (!Html5Qrcode) {
        console.error('Scanner library not loaded')
        setError('Library scanner belum dimuat. Tunggu sebentar...')
        return
      }

      console.log('Initializing scanner with element:', readerRef.current)

      const html5QrCode = new Html5Qrcode(readerRef.current, {
        formatsToSupport: ['qr_code'],
      })
      html5QrcodeRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText: string) => {
          // QR Code detected
          console.log('QR Code detected:', decodedText)
          await processScanResult(decodedText)
          stopScanner()
        },
        () => {
          // Scanning...
        }
      )

      setScanning(true)
      console.log('Scanner started successfully')
    } catch (err) {
      console.error('Scanner error:', err)
      setError('Gagal mengakses kamera. Pastikan izin kamera diberikan.')
      setScanning(false)
      toast.error('Gagal mengakses kamera')
    }
  }

  const startScanner = () => {
    console.log('Requesting to start scanner')
    setShouldStartScanning(true)
  }

  const stopScanner = async () => {
    try {
      if (html5QrcodeRef.current && scanning) {
        await html5QrcodeRef.current.stop()
        html5QrcodeRef.current = null
      }
    } catch (err) {
      console.error('Error stopping scanner:', err)
    } finally {
      setScanning(false)
    }
  }

  const processScanResult = async (token: string) => {
    try {
      // Extract token from URL if scanned QR contains full URL
      let extractedToken = token
      if (token.includes('id=')) {
        const urlParams = new URLSearchParams(token.split('?')[1])
        extractedToken = urlParams.get('id') || token
      }

      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: extractedToken }),
      })

      const data: ScanResult = await response.json()

      if (response.ok) {
        setScanResult(data)

        if (data.alreadyCheckedIn) {
          toast.warning('QR Code sudah digunakan sebelumnya')
        } else {
          toast.success(`Check-in berhasil: ${data.guest.name}`)
        }
      } else {
        toast.error(data.error || 'QR Code tidak valid')
      }
    } catch (err) {
      console.error('Scan processing error:', err)
      toast.error('Gagal memproses QR Code')
    }
  }

  const resetScan = () => {
    setScanResult(null)
    setError('')
    setShouldStartScanning(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-neutral-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Kembali
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                QR Scanner
              </h1>
              <Scan className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Scanner Card */}
          <Card>
            <CardHeader>
              <CardTitle>Scan QR Code Tamu</CardTitle>
              <CardDescription>
                Arahkan kamera ke QR Code tamu untuk check-in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!scanResult ? (
                <>
                  {/* Scanner View */}
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
                    {scanning ? (
                      <div ref={readerRef} className="w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-neutral-400">
                          <Camera className="h-16 w-16 mx-auto mb-2" />
                          <p>Scanner tidak aktif</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex gap-3">
                    {!scanning ? (
                      <Button
                        onClick={startScanner}
                        className="flex-1"
                        disabled={!scannerReady}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Mulai Scan
                      </Button>
                    ) : (
                      <Button
                        onClick={stopScanner}
                        variant="destructive"
                        className="flex-1"
                      >
                        <CameraOff className="h-4 w-4 mr-2" />
                        Stop Scan
                      </Button>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Manual Input */}
                  <div className="pt-4 border-t">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      Atau masukkan token secara manual:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Masukkan token QR Code"
                        className="flex-1 px-3 py-2 border rounded-md bg-background"
                        id="manualToken"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement
                            if (input.value) {
                              processScanResult(input.value)
                            }
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          const input = document.getElementById('manualToken') as HTMLInputElement
                          if (input?.value) {
                            processScanResult(input.value)
                          }
                        }}
                      >
                        Scan
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                /* Scan Result */
                <div className="space-y-4">
                  {scanResult.alreadyCheckedIn ? (
                    <div className="text-center py-8">
                      <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Badge variant="secondary" className="text-base px-4 py-2">
                          Sudah Check-in
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-neutral-900 dark:text-neutral-50">
                        {scanResult.guest.name}
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                        QR Code ini sudah digunakan sebelumnya pada:
                      </p>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                        {new Date(scanResult.guest.checkinTime).toLocaleString('id-ID')}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Badge className="bg-green-600 text-base px-4 py-2">
                          Check-in Berhasil
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-neutral-900 dark:text-neutral-50">
                        {scanResult.guest.name}
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        Berhasil check-in pada:
                      </p>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mt-1">
                        {new Date(scanResult.guest.checkinTime).toLocaleString('id-ID')}
                      </p>
                    </div>
                  )}

                  <Button onClick={resetScan} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Scan Tamu Berikutnya
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Panduan Penggunaan</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                <li>• Pastikan izin kamera sudah diberikan</li>
                <li>• Arahkan kamera ke QR Code pada undangan tamu</li>
                <li>• Scanner akan otomatis mendeteksi QR Code</li>
                <li>• QR Code hanya dapat digunakan 1 kali</li>
                <li>• Jika scanner tidak berfungsi, gunakan input manual</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-neutral-950/50 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            © 2025 E-Invitation System - QR Scanner
          </p>
        </div>
      </footer>
    </div>
  )
}
