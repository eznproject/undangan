"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Scan, ShieldCheck, Sparkles } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const sessionToken = document.cookie.includes("session_token");
    setIsAuthenticated(sessionToken);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-emerald-100 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-emerald-900">
                Majelis Khirriji Al-Haromain
              </h1>
              <p className="text-sm text-emerald-700">Riyadlul Jannah</p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/admin/login")}
            variant="outline"
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Login Admin
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium mb-6 shadow-sm">
          <Sparkles className="w-4 h-4" />
          Sistem Undangan Digital
        </div>
        <div className="flex justify-center mb-8">
          <div className="w-36 h-36 rounded-full bg-gradient-to-br from-green-600 via-green-700 to-green-800 flex items-center justify-center shadow-2xl">
            <QrCode className="h-20 w-20 text-white" />
          </div>
        </div>

        <h2 className="text-5xl md:text-6xl font-bold text-emerald-950 mb-4 leading-tight">
          Majelis Khirriji Al-Haromain
        </h2>
        <p className="text-2xl md:text-3xl text-teal-700 font-semibold mb-3">
          Riyadlul Jannah
        </p>
        <p className="text-lg text-emerald-700 max-w-2xl mx-auto">
          Sistem check-in digital untuk memudahkan pengelolaan tamu dan
          kehadiran acara
        </p>
      </section>

      {/* Feature Cards */}
      <section className="relative container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="border-emerald-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Scan className="w-9 h-9 text-white" />
              </div>
              <CardTitle className="text-2xl text-emerald-900">
                QR Scanner
              </CardTitle>
              <CardDescription className="text-base text-emerald-600">
                Scan QR Code untuk check-in tamu dengan kamera HP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/scanner")}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-6 text-lg font-semibold"
              >
                <QrCode className="w-5 h-5 mr-2" />
                Buka Scanner
              </Button>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ShieldCheck className="w-9 h-9 text-white" />
              </div>
              <CardTitle className="text-2xl text-emerald-900">
                Admin Dashboard
              </CardTitle>
              <CardDescription className="text-base text-emerald-600">
                Kelola tamu dan pantau kehadiran acara
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/admin/login")}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-6 text-lg font-semibold"
              >
                <ShieldCheck className="w-5 h-5 mr-2" />
                {isAuthenticated ? "Buka Dashboard" : "Login Admin"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-emerald-100 bg-white/80 backdrop-blur-sm py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-emerald-700">
          <p className="text-sm">
            © 2026 Majelis Khirriji Al-Haromain - Riyadlul Jannah
          </p>
        </div>
      </footer>
    </div>
  );
}
