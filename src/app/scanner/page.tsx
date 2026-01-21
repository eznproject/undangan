'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Scan, ArrowLeft, Camera, CameraOff, RefreshCw, Loader2 } from 'lucide-react'
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
  error?: string
}

export default function ScannerPage() {
  const router = useRouter()
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scannerReady, setScannerReady] = useState(false)
  const [error, setError] = useState<string>('')
  const html5QrcodeRef = useRef<any>(null)

  // 1. Load Script Library
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/html5-qrcode'
      script.async = true
      script.onload = () => {
        setScannerReady(true)
        console.log('Scanner library ready')
      }
      script.onerror = () => {
        setError('Gagal memuat library scanner. Periksa koneksi internet.')
      }
      document.head.appendChild(script)
    }

    return () => {
      // Cleanup saat pindah halaman
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop()
      }
    }
  }, [])

  // 2. Fungsi Memulai Scanner
  const startScanner = async () => {
    try {
      setError('')
      setScanResult(null)

      const Html5Qrcode = (window as any).Html5Qrcode
      if (!Html5Qrcode) {
        toast.error('Library belum siap')
        return
      }

      // Selalu buat instance baru di elemen dengan ID "reader"
      const html5QrCode = new Html5Qrcode("reader")
      html5QrcodeRef.current = html5QrCode

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      }

      setScanning(true)

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        async (decodedText: string) => {
          // Berhasil scan
          console.log('Scanned text:', decodedText)
          await processScanResult(decodedText)
        },
        () => {
          // Frame scanner (opsional: bisa untuk log debug)
        }
      )
    } catch (err: any) {
      console.error('Inisialisasi Gagal:', err)
      setError('Kamera tidak dapat diakses. Pastikan izin diberikan dan gunakan HTTPS.')
      setScanning(false)
      toast.error('Gagal membuka kamera')
    }
  }

  // 3. Fungsi Berhenti Scanner
  const stopScanner = async () => {
    if (html5QrcodeRef.current) {
      try {
        if (html5QrcodeRef.current.isScanning) {
          await html5QrcodeRef.current.stop()
        }
      } catch (err) {
        console.error('Gagal stop scanner:', err)
      } finally {
        setScanning(false)
        html5QrcodeRef.current = null
      }
    }
  }

  // 4. Proses Hasil Scan ke API
  const processScanResult = async (token: string) => {
    // Stop scanner segera setelah dapat data agar tidak double scan
    await stopScanner()

    try {
      let extractedToken = token
      // Logika jika QR berisi URL lengkap: https://domain.com/scan?id=TOKEN123
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
          toast.warning('Tamu sudah pernah check-in')
        } else {
          toast.success(`Berhasil: ${data.guest.name}`)
        }
      } else {
        setError(data.error || 'Token tidak valid')
        toast.error(data.error || 'Check-in gagal')
      }
    } catch (err) {
      console.error('API Error:', err)
      toast.error('Gagal menghubungi server')
      setError('Terjadi kesalahan koneksi ke server.')
    }
  }

  const resetScan = () => {
    setScanResult(null)
    setError('')
    setScanning(false)
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b bg-white dark:bg-neutral-900 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/')} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
          </Button>
          <h1 className="font-bold text-lg">QR Check-in</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="text-center">
              <CardTitle>Scanner Kehadiran</CardTitle>
              <CardDescription>Scan QR Code pada undangan fisik/digital</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {!scanResult ? (
                <>
                  {/* Container Scanner */}
                  <div className="relative bg-black rounded-xl overflow-hidden aspect-square border-4 border-neutral-200 dark:border-neutral-800">
                    <div id="reader" className="w-full h-full"></div>
                    
                    {!scanning && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 bg-neutral-100 dark:bg-neutral-900">
                        <Camera className="h-12 w-12 mb-3 opacity-20" />
                        <p className="text-sm">Kamera belum aktif</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    {!scanning ? (
                      <Button 
                        onClick={startScanner} 
                        className="w-full h-12 text-lg" 
                        disabled={!scannerReady}
                      >
                        {scannerReady ? (
                          <><Camera className="mr-2 h-5 w-5" /> Aktifkan Kamera</>
                        ) : (
                          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading Library...</>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        onClick={stopScanner} 
                        variant="destructive" 
                        className="w-full h-12 text-lg"
                      >
                        <CameraOff className="mr-2 h-5 w-5" /> Matikan Kamera
                      </Button>
                    )}
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md text-center">
                      {error}
                    </div>
                  )}

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground dark:bg-neutral-900">Atau Manual</span></div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      id="manualToken"
                      placeholder="Input kode token..."
                      className="flex-1 px-3 py-2 border rounded-md text-sm bg-transparent"
                      onKeyDown={(e) => e.key === 'Enter' && processScanResult((e.target as HTMLInputElement).value)}
                    />
                    <Button variant="outline" onClick={() => {
                      const val = (document.getElementById('manualToken') as HTMLInputElement).value
                      if(val) processScanResult(val)
                    }}>Input</Button>
                  </div>
                </>
              ) : (
                /* Tampilan Hasil */
                <div className="text-center py-6 space-y-6">
                  <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${scanResult.alreadyCheckedIn ? 'bg-amber-100' : 'bg-green-100'}`}>
                    <Scan className={`h-10 w-10 ${scanResult.alreadyCheckedIn ? 'text-amber-600' : 'text-green-600'}`} />
                  </div>
                  
                  <div>
                    <Badge variant={scanResult.alreadyCheckedIn ? "outline" : "default"} className={scanResult.alreadyCheckedIn ? "text-amber-600 border-amber-600" : "bg-green-600"}>
                      {scanResult.alreadyCheckedIn ? "Sudah Hadir" : "Check-in Berhasil"}
                    </Badge>
                    <h2 className="text-2xl font-bold mt-4">{scanResult.guest.name}</h2>
                    <p className="text-neutral-500 text-sm">{scanResult.guest.eventName}</p>
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg text-sm">
                    <p className="text-neutral-500">Waktu Check-in:</p>
                    <p className="font-mono font-bold">
                      {new Date(scanResult.guest.checkinTime).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>

                  <Button onClick={resetScan} className="w-full py-6 text-lg">
                    <RefreshCw className="mr-2 h-5 w-5" /> Scan Berikutnya
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}