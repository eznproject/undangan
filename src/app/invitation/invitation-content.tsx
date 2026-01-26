"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  MapPin,
  Clock,
  Calendar,
  Share2,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  MapPinned,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface Guest {
  id: string;
  token: string;
  rsvpStatus: string;
  qrCode?: string;
  attendance?: {
    checkinTime: string;
  } | null;
  guest: {
    name: string;
    whatsapp: string;
    address?: string;
    area?: string;
  };
  event: {
    title: string;
    date: string;
    time: string;
    location: string;
    description?: string;
  };
}

export default function InvitationPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("id");
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingRsvp, setUpdatingRsvp] = useState(false);

  useEffect(() => {
    if (token) {
      fetchGuest();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchGuest = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/guests/token/${token}`);
      const data = await response.json();

      if (response.ok) {
        setGuest(data.eventGuest);
      } else {
        toast.error("Undangan tidak valid atau tidak ditemukan");
      }
    } catch (error) {
      toast.error("Gagal memuat undangan");
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (status: "confirmed" | "rejected") => {
    if (!guest) return;

    setUpdatingRsvp(true);
    try {
      const response = await fetch(`/api/guests/${guest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rsvpStatus: status }),
      });

      if (response.ok) {
        const data = await response.json();
        setGuest(data.eventGuest);
        toast.success(
          status === "confirmed"
            ? "Konfirmasi kehadiran berhasil"
            : "Mohon maaf Anda tidak dapat hadir"
        );
      } else {
        toast.error("Gagal mengupdate RSVP");
      }
    } catch (error) {
      toast.error("Gagal mengupdate RSVP");
    } finally {
      setUpdatingRsvp(false);
    }
  };

  const shareInvitation = async () => {
    const shareData = {
      title: guest?.event.title || "Undangan",
      text: `Anda diundang ke ${guest?.event.title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link undangan berhasil disalin");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700 font-medium">Memuat undangan...</p>
        </div>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
        </div>

        <Card className="max-w-md w-full mx-4 border-emerald-100 shadow-2xl bg-white/90 backdrop-blur-sm relative z-10">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <QrCode className="h-10 w-10 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-900 mb-2">
                  Undangan Tidak Ditemukan
                </h2>
                <p className="text-emerald-600">
                  Pastikan link undangan yang Anda akses benar
                </p>
              </div>
              <Button
                onClick={() => (window.location.href = "/")}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Beranda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-emerald-100 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/")}
              className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <Button
              variant="ghost"
              onClick={shareInvitation}
              className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Bagikan
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Invitation Card */}
          <Card className="overflow-hidden border-emerald-100 shadow-2xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-0">
              {/* Header with Gradient */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-center text-white">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4" />
                  Undangan Resmi
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {guest.event.title}
                </h1>
                <p className="text-emerald-50 text-lg">
                  Majelis Khirriji Al-Haromain - Riyadlul Jannah
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Guest Name */}
                <div className="text-center">
                  <p className="text-emerald-600 mb-3 font-medium">
                    Kepada Yth. Bapak/Ibu/Saudara/i
                  </p>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6 shadow-inner">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-emerald-900">
                        {guest.guest.name}
                      </h2>
                    </div>
                    {guest.guest.area && (
                      <div className="flex items-center justify-center gap-2 text-emerald-700 mb-2">
                        <MapPinned className="w-4 h-4" />
                        <p className="font-medium">Area: {guest.guest.area}</p>
                      </div>
                    )}
                    {guest.guest.address && (
                      <p className="text-sm text-emerald-600">
                        {guest.guest.address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-emerald-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    Detail Acara
                  </h3>
                  <div className="grid gap-4">
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-emerald-900 mb-1">
                          Tanggal
                        </p>
                        <p className="text-emerald-700">{guest.event.date}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-emerald-900 mb-1">
                          Waktu
                        </p>
                        <p className="text-emerald-700">{guest.event.time}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-emerald-900 mb-1">
                          Lokasi
                        </p>
                        <p className="text-emerald-700">
                          {guest.event.location}
                        </p>
                      </div>
                    </div>
                  </div>
                  {guest.event.description && (
                    <div className="bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-200 rounded-xl p-5">
                      <p className="text-sm text-emerald-700 whitespace-pre-line leading-relaxed">
                        {guest.event.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* QR Code */}
                {guest.qrCode ? (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-1 rounded-2xl shadow-xl">
                      <div className="bg-white p-6 rounded-xl shadow-inner">
                        <img
                          src={guest.qrCode}
                          alt="QR Code Undangan"
                          className="w-48 h-48"
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-emerald-700 font-medium mb-1">
                        QR Code Check-in
                      </p>
                      <p className="text-xs text-emerald-600">
                        Tunjukkan kode ini saat check-in di acara
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-emerald-50 rounded-xl border border-emerald-100">
                    <QrCode className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                    <p className="text-emerald-600 font-medium">
                      QR Code akan segera tersedia
                    </p>
                  </div>
                )}

                {/* RSVP Status */}
                <div className="border-t-2 border-emerald-100 pt-6">
                  <div className="text-center mb-4">
                    <p className="text-sm text-emerald-700 mb-3 font-medium">
                      Status Konfirmasi Kehadiran
                    </p>
                    <Badge
                      className={`text-base px-6 py-2 ${
                        guest.rsvpStatus === "confirmed"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                          : guest.rsvpStatus === "rejected"
                          ? "bg-red-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {guest.rsvpStatus === "confirmed" && (
                        <CheckCircle2 className="w-4 h-4 mr-2 inline" />
                      )}
                      {guest.rsvpStatus === "confirmed"
                        ? "Akan Hadir"
                        : guest.rsvpStatus === "rejected"
                        ? "Tidak Dapat Hadir"
                        : "Belum Dikonfirmasi"}
                    </Badge>
                  </div>

                  {guest.rsvpStatus === "pending" && (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleRsvp("confirmed")}
                        disabled={updatingRsvp}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg h-12"
                      >
                        {updatingRsvp ? "Memproses..." : "Saya Akan Hadir"}
                      </Button>
                      <Button
                        onClick={() => handleRsvp("rejected")}
                        disabled={updatingRsvp}
                        variant="outline"
                        className="flex-1 border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-12"
                      >
                        {updatingRsvp ? "Memproses..." : "Tidak Dapat Hadir"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Check-in Status */}
                {guest.attendance && (
                  <div className="p-5 bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-emerald-300 rounded-xl shadow-inner">
                    <div className="flex items-center gap-3 justify-center mb-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <Badge className="bg-gradient-to-r from-emerald-600 to-teal-700 text-base px-4 py-1">
                        Sudah Check-in
                      </Badge>
                    </div>
                    <p className="text-sm text-center text-emerald-700 font-medium">
                      Waktu:{" "}
                      {new Date(guest.attendance.checkinTime).toLocaleString(
                        "id-ID"
                      )}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-emerald-100 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 text-emerald-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                Informasi Penting
              </h3>
              <ul className="space-y-3 text-sm text-emerald-700">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Simpan QR Code untuk ditunjukkan saat check-in</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Konfirmasi kehadiran Anda sebelum acara dimulai</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Pastikan datang tepat waktu sesuai jadwal</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>QR Code hanya dapat digunakan 1 kali</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-emerald-100 bg-white/80 backdrop-blur-sm mt-8">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-emerald-700">
            © 2025 Majelis Khirriji Al-Haromain - Riyadlul Jannah
          </p>
          <p className="text-center text-xs text-emerald-600 mt-1">
            Terima kasih atas kehadiran Anda
          </p>
        </div>
      </footer>
    </div>
  );
}
