"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Scan,
  ArrowLeft,
  Camera,
  CameraOff,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface ScanResult {
  success: boolean;
  alreadyCheckedIn: boolean;
  guest: {
    name: string;
    checkinTime: string;
    eventName: string;
  };
  message: string;
  error?: string;
}

export default function ScannerPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scannerReady, setScannerReady] = useState(false);
  const [error, setError] = useState<string>("");
  const html5QrcodeRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/html5-qrcode";
      script.async = true;
      script.onload = () => {
        setScannerReady(true);
        console.log("Scanner library ready");
      };
      script.onerror = () => {
        setError("Gagal memuat library scanner. Periksa koneksi internet.");
      };
      document.head.appendChild(script);
    }

    return () => {
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop();
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      setError("");
      setScanResult(null);

      const Html5Qrcode = (window as any).Html5Qrcode;
      if (!Html5Qrcode) {
        toast.error("Library belum siap");
        return;
      }

      const html5QrCode = new Html5Qrcode("reader");
      html5QrcodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      setScanning(true);

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        async (decodedText: string) => {
          console.log("Scanned text:", decodedText);
          await processScanResult(decodedText);
        },
        () => {}
      );
    } catch (err: any) {
      console.error("Inisialisasi Gagal:", err);
      setError(
        "Kamera tidak dapat diakses. Pastikan izin diberikan dan gunakan HTTPS."
      );
      setScanning(false);
      toast.error("Gagal membuka kamera");
    }
  };

  const stopScanner = async () => {
    if (html5QrcodeRef.current) {
      try {
        if (html5QrcodeRef.current.isScanning) {
          await html5QrcodeRef.current.stop();
        }
      } catch (err) {
        console.error("Gagal stop scanner:", err);
      } finally {
        setScanning(false);
        html5QrcodeRef.current = null;
      }
    }
  };

  const processScanResult = async (token: string) => {
    await stopScanner();

    try {
      let extractedToken = token;
      if (token.includes("id=")) {
        const urlParams = new URLSearchParams(token.split("?")[1]);
        extractedToken = urlParams.get("id") || token;
      }

      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: extractedToken }),
      });

      const data: ScanResult = await response.json();

      if (response.ok) {
        setScanResult(data);
        if (data.alreadyCheckedIn) {
          toast.warning("Tamu sudah pernah check-in");
        } else {
          toast.success(`Berhasil: ${data.guest.name}`);
        }
      } else {
        setError(data.error || "Token tidak valid");
        toast.error(data.error || "Check-in gagal");
      }
    } catch (err) {
      console.error("API Error:", err);
      toast.error("Gagal menghubungi server");
      setError("Terjadi kesalahan koneksi ke server.");
    }
  };

  const resetScan = () => {
    setScanResult(null);
    setError("");
    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-emerald-100 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            size="sm"
            className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Scan className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-bold text-lg text-emerald-900">QR Check-in</h1>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          <Card className="overflow-hidden border-emerald-100 shadow-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <CardTitle className="text-2xl">Scanner Kehadiran</CardTitle>
              <CardDescription className="text-emerald-50">
                Scan QR Code pada undangan fisik/digital
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {!scanResult ? (
                <>
                  {/* Container Scanner */}
                  <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden aspect-square border-4 border-emerald-200 shadow-xl">
                    <div id="reader" className="w-full h-full"></div>

                    {!scanning && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gradient-to-br from-emerald-900/50 to-teal-900/50 backdrop-blur-sm">
                        <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                          <Camera className="h-10 w-10 text-white/60" />
                        </div>
                        <p className="text-sm font-medium">
                          Kamera belum aktif
                        </p>
                        <p className="text-xs text-white/70 mt-1">
                          Tekan tombol untuk memulai
                        </p>
                      </div>
                    )}

                    {scanning && (
                      <div className="absolute top-4 left-4 right-4">
                        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/90 backdrop-blur-sm rounded-lg">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <span className="text-white text-sm font-medium">
                            Scanning...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    {!scanning ? (
                      <Button
                        onClick={startScanner}
                        className="w-full h-14 text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg"
                        disabled={!scannerReady}
                      >
                        {scannerReady ? (
                          <>
                            <Camera className="mr-2 h-5 w-5" /> Aktifkan Kamera
                          </>
                        ) : (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                            Loading Library...
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={stopScanner}
                        variant="destructive"
                        className="w-full h-14 text-lg shadow-lg"
                      >
                        <CameraOff className="mr-2 h-5 w-5" /> Matikan Kamera
                      </Button>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 text-red-700 text-sm rounded-xl text-center flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-emerald-200"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-emerald-600 font-medium">
                        Atau Manual
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      id="manualToken"
                      placeholder="Input kode token..."
                      className="flex-1 px-4 py-3 border-2 border-emerald-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 rounded-lg text-sm bg-white outline-none"
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        processScanResult((e.target as HTMLInputElement).value)
                      }
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const val = (
                          document.getElementById(
                            "manualToken"
                          ) as HTMLInputElement
                        ).value;
                        if (val) processScanResult(val);
                      }}
                      className="border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 px-6"
                    >
                      Input
                    </Button>
                  </div>
                </>
              ) : (
                /* Tampilan Hasil */
                <div className="text-center py-6 space-y-6">
                  <div
                    className={`mx-auto w-24 h-24 rounded-2xl flex items-center justify-center shadow-xl ${
                      scanResult.alreadyCheckedIn
                        ? "bg-gradient-to-br from-amber-400 to-orange-500"
                        : "bg-gradient-to-br from-emerald-500 to-teal-600"
                    }`}
                  >
                    {scanResult.alreadyCheckedIn ? (
                      <AlertCircle className="h-12 w-12 text-white" />
                    ) : (
                      <CheckCircle2 className="h-12 w-12 text-white" />
                    )}
                  </div>

                  <div>
                    <Badge
                      className={`text-base px-6 py-2 ${
                        scanResult.alreadyCheckedIn
                          ? "bg-gradient-to-r from-amber-500 to-orange-600"
                          : "bg-gradient-to-r from-emerald-500 to-teal-600"
                      }`}
                    >
                      {scanResult.alreadyCheckedIn
                        ? "Sudah Hadir"
                        : "Check-in Berhasil"}
                    </Badge>
                    <h2 className="text-3xl font-bold mt-4 text-emerald-900">
                      {scanResult.guest.name}
                    </h2>
                    <p className="text-emerald-600 text-sm mt-2 font-medium">
                      {scanResult.guest.eventName}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 p-5 rounded-xl">
                    <p className="text-emerald-700 text-sm font-semibold mb-2">
                      Waktu Check-in:
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <p className="font-mono font-bold text-lg text-emerald-900">
                        {new Date(scanResult.guest.checkinTime).toLocaleString(
                          "id-ID",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={resetScan}
                    className="w-full h-14 text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg"
                  >
                    <RefreshCw className="mr-2 h-5 w-5" /> Scan Berikutnya
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-emerald-100 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <h3 className="font-semibold text-emerald-900">Tips Scanner</h3>
              </div>
              <ul className="space-y-2 text-sm text-emerald-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Pastikan QR Code dalam posisi jelas dan terang</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Izinkan akses kamera saat diminta browser</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Gunakan koneksi HTTPS untuk keamanan</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
