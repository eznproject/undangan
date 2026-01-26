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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Removed ScrollArea import to prevent hydration mismatch
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard,
  Users,
  Calendar,
  History,
  LogOut,
  UserPlus,
  Download,
  ArrowLeft,
  RefreshCw,
  QrCode,
  CalendarPlus,
  Upload,
  Menu,
  X,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

// --- Types Interfaces ---
interface EventGuest {
  id: string;
  token: string;
  rsvpStatus: string;
  qrCode?: string;
  createdAt: string;
  guest: {
    id: string;
    name: string;
    whatsapp: string;
    address?: string;
    area?: string;
  };
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
  };
  attendance?: {
    checkinTime: string;
  } | null;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  createdAt: string;
}

interface EventStats {
  event: Event;
  statistics: {
    totalGuests: number;
    checkedInGuests: number;
    pendingGuests: number;
    rsvpConfirmed: number;
    rsvpPending: number;
    rsvpRejected: number;
    attendanceRate: string;
  };
  eventGuests: EventGuest[];
  recentCheckins: any[];
}

interface Guest {
  id: string;
  name: string;
  whatsapp: string;
  address?: string;
  area?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, guests, events, history
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data States
  const [eventGuests, setEventGuests] = useState<EventGuest[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [allGuests, setAllGuests] = useState<Guest[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  // Stats States
  const [stats, setStats] = useState({
    totalGuests: 0,
    checkedInGuests: 0,
    pendingGuests: 0,
    rsvpConfirmed: 0,
    rsvpPending: 0,
    rsvpRejected: 0,
  });

  // Modal States
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showAddExistingGuests, setShowAddExistingGuests] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);

  // Form States
  const [newGuest, setNewGuest] = useState({
    name: "",
    whatsapp: "",
    address: "",
    area: "",
  });
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
  });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());

  // Loading States
  const [generatingQr, setGeneratingQr] = useState(false);
  const [importing, setImporting] = useState(false);
  const [addingGuests, setAddingGuests] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Detail States
  const [selectedEventGuest, setSelectedEventGuest] =
    useState<EventGuest | null>(null);
  const [eventHistory, setEventHistory] = useState<EventStats[]>([]);
  const [selectedEventDetail, setSelectedEventDetail] =
    useState<EventStats | null>(null);
  const [importResults, setImportResults] = useState<any>(null);

  // --- Effects ---
  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (activeTab === "history") fetchEventHistory();
    else if (activeTab === "overview" || activeTab === "guests") {
      if (selectedEventId) {
        fetchEventGuests();
        fetchStats();
        fetchAllGuests();
      }
    }
  }, [activeTab, selectedEventId]);

  // --- Fetch Functions ---
  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      const data = await response.json();
      if (response.ok) {
        setEvents(data.events);
        if (data.events.length > 0 && !selectedEventId) {
          setSelectedEventId(data.events[0].id);
        }
      }
    } catch (error) {
      toast.error("Gagal mengambil data acara");
    }
  };

  const fetchEventGuests = async () => {
    if (!selectedEventId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/guests?eventId=${selectedEventId}`);
      const data = await response.json();
      if (response.ok) setEventGuests(data.eventGuests);
    } catch (error) {
      toast.error("Gagal mengambil data tamu");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!selectedEventId) return;
    try {
      const response = await fetch(`/api/dashboard?eventId=${selectedEventId}`);
      const data = await response.json();
      if (response.ok) setStats(data);
    } catch (error) {
      toast.error("Gagal mengambil statistik");
    }
  };

  const fetchAllGuests = async () => {
    if (!selectedEventId) return;
    try {
      const response = await fetch(
        `/api/guests/all-guests?eventId=${selectedEventId}`
      );
      const data = await response.json();
      if (response.ok) setAllGuests(data.guests);
    } catch (error) {
      toast.error("Gagal mengambil data database");
    }
  };

  const fetchEventHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch("/api/events");
      const data = await response.json();
      if (response.ok && data.events) {
        const historyData: EventStats[] = [];
        for (const event of data.events) {
          const eventResponse = await fetch(`/api/events/${event.id}`);
          const eventData = await eventResponse.json();
          if (eventResponse.ok) historyData.push(eventData);
        }
        setEventHistory(historyData);
      }
    } catch (error) {
      toast.error("Gagal mengambil riwayat acara");
    } finally {
      setLoadingHistory(false);
    }
  };

  // --- Action Handlers ---
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logout berhasil");
      router.push("/");
    } catch (error) {
      toast.error("Gagal logout");
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });
      if (response.ok) {
        toast.success("Acara berhasil dibuat");
        setShowCreateEvent(false);
        setNewEvent({
          title: "",
          date: "",
          time: "",
          location: "",
          description: "",
        });
        fetchEvents();
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal membuat acara");
      }
    } catch (error) {
      toast.error("Gagal membuat acara");
    }
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: selectedEventId, ...newGuest }),
      });
      if (response.ok) {
        toast.success("Tamu berhasil ditambahkan");
        setShowAddGuest(false);
        setNewGuest({ name: "", whatsapp: "", address: "", area: "" });
        fetchEventGuests();
        fetchStats();
        fetchAllGuests();
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal menambahkan tamu");
      }
    } catch (error) {
      toast.error("Gagal menambahkan tamu");
    }
  };

  const handleDeleteEventGuest = async (eventGuestId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tamu ini dari acara?"))
      return;
    try {
      const response = await fetch(`/api/guests/${eventGuestId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Tamu berhasil dihapus");
        fetchEventGuests();
        fetchStats();
        fetchAllGuests();
      } else toast.error("Gagal menghapus tamu");
    } catch (error) {
      toast.error("Gagal menghapus tamu");
    }
  };

  const handleBulkImport = async () => {
    if (!importFile) return toast.error("Pilih file terlebih dahulu");
    setImporting(true);
    setImportResults(null);
    const Papa = require("papaparse");
    Papa.parse(importFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const guests = results.data
            .map((row: any) => ({
              name: row.nama || row.name || "",
              whatsapp: row.whatsapp || row.no_hp || "",
              address: row.alamat || row.address || "",
              area: row.area || "",
            }))
            .filter((guest: any) => guest.name && guest.whatsapp);
          const response = await fetch("/api/guests/bulk-import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventId: selectedEventId, guests }),
          });
          if (response.ok) {
            const data = await response.json();
            setImportResults(data.results);
            toast.success(`Import berhasil: ${data.results.success} tamu`);
            fetchEventGuests();
            fetchStats();
            fetchAllGuests();
          } else {
            const data = await response.json();
            toast.error(data.error || "Gagal import");
          }
        } catch (error) {
          toast.error("Gagal memproses file");
        } finally {
          setImporting(false);
        }
      },
      error: () => {
        toast.error("Gagal membaca CSV");
        setImporting(false);
      },
    });
  };

  const handleAddExistingGuests = async () => {
    if (selectedGuests.size === 0) return toast.error("Pilih minimal 1 tamu");
    setAddingGuests(true);
    try {
      const response = await fetch("/api/guests/invite-to-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId,
          guestIds: Array.from(selectedGuests),
        }),
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.results.success} tamu berhasil diundang`);
        setShowAddExistingGuests(false);
        setSelectedGuests(new Set());
        setSearchQuery("");
        fetchEventGuests();
        fetchStats();
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal mengundang");
      }
    } catch (error) {
      toast.error("Gagal mengundang tamu");
    } finally {
      setAddingGuests(false);
    }
  };

  const generateQrCode = async (eventGuest: EventGuest) => {
    setSelectedEventGuest(eventGuest);
    setGeneratingQr(true);
    setShowQrDialog(true);
    try {
      const response = await fetch("/api/qrcode/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventGuestId: eventGuest.id }),
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedEventGuest(data.eventGuest);
        toast.success("QR Code berhasil digenerate");
      } else toast.error("Gagal generate QR");
    } catch (error) {
      toast.error("Gagal generate QR");
    } finally {
      setGeneratingQr(false);
    }
  };

  const copyInvitationLink = (eventGuest: EventGuest) => {
    const link = `${window.location.origin}/invitation?id=${eventGuest.token}`;
    navigator.clipboard.writeText(link);
    toast.success("Link undangan disalin");
  };

  const exportToExcel = () => {
    const csvContent = [
      [
        "Nama",
        "WhatsApp",
        "Alamat",
        "Area",
        "Status RSVP",
        "Status Kehadiran",
        "Waktu Check-in",
      ],
      ...eventGuests.map((eg) => [
        eg.guest.name,
        eg.guest.whatsapp,
        eg.guest.address || "",
        eg.guest.area || "",
        eg.rsvpStatus,
        eg.attendance ? "Hadir" : "Belum",
        eg.attendance
          ? new Date(eg.attendance.checkinTime).toLocaleString("id-ID")
          : "-",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `guests_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Data berhasil diexport");
  };

  const filteredGuests = allGuests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.whatsapp.includes(searchQuery) ||
      (guest.area &&
        guest.area.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleExportEventData = (eventStats: EventStats) => {
    const csvContent = [
      [
        "Nama",
        "WhatsApp",
        "Alamat",
        "Area",
        "Status RSVP",
        "Status Kehadiran",
        "Waktu Check-in",
      ],
      ...eventStats.eventGuests.map((eg) => [
        eg.guest.name,
        eg.guest.whatsapp,
        eg.guest.address || "",
        eg.guest.area || "",
        eg.rsvpStatus,
        eg.attendance ? "Hadir" : "Belum",
        eg.attendance
          ? new Date(eg.attendance.checkinTime).toLocaleString("id-ID")
          : "-",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `event_${eventStats.event.title.replace(/\s+/g, "_")}_${
      eventStats.event.date
    }.csv`;
    link.click();
    toast.success("Data acara berhasil diexport");
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Hapus acara ini? Data tidak bisa dikembalikan.")) return;
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Acara dihapus");
        fetchEventHistory();
        if (selectedEventId === eventId) setSelectedEventId("");
      } else toast.error("Gagal menghapus acara");
    } catch (error) {
      toast.error("Gagal menghapus acara");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* --- MOBILE HEADER & DRAWER --- */}
      <header className="md:hidden fixed top-0 w-full z-50 bg-white border-b px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded text-white">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg text-slate-800">Admin Panel</span>
        </div>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <div className="p-6 pb-2">
              <h2 className="font-bold text-xl text-slate-800 mb-4">
                Menu Navigasi
              </h2>
            </div>
            <nav className="flex flex-col gap-1 px-4 pb-6">
              <NavButton
                icon={<LayoutDashboard className="h-4 w-4" />}
                label="Ringkasan"
                active={activeTab === "overview"}
                onClick={() => {
                  setActiveTab("overview");
                  setMobileMenuOpen(false);
                }}
              />
              <NavButton
                icon={<Users className="h-4 w-4" />}
                label="Daftar Tamu"
                active={activeTab === "guests"}
                onClick={() => {
                  setActiveTab("guests");
                  setMobileMenuOpen(false);
                }}
              />
              <NavButton
                icon={<Calendar className="h-4 w-4" />}
                label="Kelola Acara"
                active={activeTab === "events"}
                onClick={() => {
                  setActiveTab("events");
                  setMobileMenuOpen(false);
                }}
              />
              <NavButton
                icon={<History className="h-4 w-4" />}
                label="Riwayat"
                active={activeTab === "history"}
                onClick={() => {
                  setActiveTab("history");
                  setMobileMenuOpen(false);
                }}
              />
              <div className="my-2 border-t" />
              <NavButton
                icon={<LogOut className="h-4 w-4" />}
                label="Logout"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                variant="destructive"
              />
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      {/* --- SIDEBAR (Desktop) --- */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3 border-b">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg text-white shadow-lg">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800 leading-tight">
              Undangan Digital
            </h1>
            <p className="text-xs text-slate-500">Admin Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-4">
          <NavButton
            icon={<LayoutDashboard className="h-4 w-4" />}
            label="Ringkasan"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <NavButton
            icon={<Users className="h-4 w-4" />}
            label="Daftar Tamu"
            active={activeTab === "guests"}
            onClick={() => setActiveTab("guests")}
          />
          <NavButton
            icon={<Calendar className="h-4 w-4" />}
            label="Kelola Acara"
            active={activeTab === "events"}
            onClick={() => setActiveTab("events")}
          />
          <NavButton
            icon={<History className="h-4 w-4" />}
            label="Riwayat Acara"
            active={activeTab === "history"}
            onClick={() => setActiveTab("history")}
          />
        </nav>

        <div className="p-4 border-t">
          <NavButton
            icon={<LogOut className="h-4 w-4" />}
            label="Logout"
            onClick={handleLogout}
            variant="destructive"
          />
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden pt-16 md:pt-0">
        {/* Top Bar for Desktop Actions */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {activeTab === "overview" && "Ringkasan Acara"}
              {activeTab === "guests" && "Manajemen Tamu"}
              {activeTab === "events" && "Pengaturan Acara"}
              {activeTab === "history" && "Riwayat & Laporan"}
            </h2>
            <p className="text-sm text-slate-500">
              {activeTab === "overview" || activeTab === "guests"
                ? events.find((e) => e.id === selectedEventId)?.title ||
                  "Pilih Acara"
                : "Kelola data sistem undangan"}
            </p>
          </div>
          <div className="flex gap-2">
            {(activeTab === "overview" || activeTab === "guests") && (
              <Select
                value={selectedEventId}
                onValueChange={setSelectedEventId}
              >
                <SelectTrigger className="w-[200px] md:w-[300px]">
                  <SelectValue placeholder="Pilih Acara..." />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title} ({event.date})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                fetchEventGuests();
                fetchStats();
                fetchAllGuests();
                fetchEvents();
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Replaced ScrollArea with div and overflow-auto to fix hydration */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* --- VIEW: OVERVIEW --- */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Undangan"
                  value={stats.totalGuests}
                  icon={<Users className="h-5 w-5 text-blue-600" />}
                  color="blue"
                />
                <StatCard
                  title="Sudah Check-in"
                  value={stats.checkedInGuests}
                  icon={<QrCode className="h-5 w-5 text-green-600" />}
                  color="green"
                />
                <StatCard
                  title="Belum Hadir"
                  value={stats.pendingGuests}
                  icon={<X className="h-5 w-5 text-orange-600" />}
                  color="orange"
                />
                <StatCard
                  title="RSVP Confirm"
                  value={stats.rsvpConfirmed}
                  icon={<FileText className="h-5 w-5 text-purple-600" />}
                  color="purple"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Aksi Cepat</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => setShowAddGuest(true)}
                    className="h-20 flex-col gap-1"
                  >
                    <UserPlus className="h-6 w-6" />
                    Tambah Tamu Baru
                  </Button>
                  <Button
                    onClick={() => setShowBulkImport(true)}
                    variant="outline"
                    className="h-20 flex-col gap-1"
                  >
                    <Upload className="h-6 w-6" />
                    Import CSV
                  </Button>
                  <Button
                    onClick={() => router.push("/scanner")}
                    variant="secondary"
                    className="h-20 flex-col gap-1"
                  >
                    <QrCode className="h-6 w-6" />
                    Buka Scanner
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Daftar Tamu</CardTitle>
                      <CardDescription>
                        {eventGuests.length} tamu terdaftar
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setShowAddGuest(true)} size="sm">
                        <UserPlus className="h-4 w-4 mr-2" /> Tambah
                      </Button>
                      <Button
                        onClick={() => setShowBulkImport(true)}
                        variant="outline"
                        size="sm"
                      >
                        <Upload className="h-4 w-4 mr-2" /> Import
                      </Button>
                      <Button
                        onClick={() => setShowAddExistingGuests(true)}
                        variant="outline"
                        size="sm"
                      >
                        <Users className="h-4 w-4 mr-2" /> DB
                      </Button>
                      <Button
                        onClick={exportToExcel}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" /> Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama</TableHead>
                          <TableHead className="hidden md:table-cell">
                            WhatsApp
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Area
                          </TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              Memuat data...
                            </TableCell>
                          </TableRow>
                        ) : eventGuests.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              Belum ada tamu.
                            </TableCell>
                          </TableRow>
                        ) : (
                          eventGuests.map((eg) => (
                            <TableRow key={eg.id}>
                              <TableCell className="font-medium">
                                <div className="flex flex-col">
                                  <span>{eg.guest.name}</span>
                                  <span className="text-xs text-slate-500 md:hidden">
                                    {eg.guest.whatsapp}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {eg.guest.whatsapp}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {eg.guest.area || "-"}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Badge
                                    variant={
                                      eg.rsvpStatus === "confirmed"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {eg.rsvpStatus}
                                  </Badge>
                                  {eg.attendance && (
                                    <Badge className="bg-green-600 w-fit">
                                      Hadir{" "}
                                      {/* Added suppressHydrationWarning to fix Date mismatch */}
                                      <span suppressHydrationWarning>
                                        {new Date(
                                          eg.attendance.checkinTime
                                        ).toLocaleTimeString("id-ID", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => generateQrCode(eg)}
                                  >
                                    <QrCode className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => copyInvitationLink(eg)}
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() =>
                                      handleDeleteEventGuest(eg.id)
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* --- VIEW: GUESTS --- */}
          {activeTab === "guests" && (
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Daftar Tamu</CardTitle>
                    <CardDescription>
                      {eventGuests.length} tamu terdaftar
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowAddGuest(true)} size="sm">
                      <UserPlus className="h-4 w-4 mr-2" /> Tambah
                    </Button>
                    <Button
                      onClick={() => setShowBulkImport(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-2" /> Import
                    </Button>
                    <Button
                      onClick={() => setShowAddExistingGuests(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Users className="h-4 w-4 mr-2" /> DB
                    </Button>
                    <Button onClick={exportToExcel} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden md:table-cell">
                          WhatsApp
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Area
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            Memuat data...
                          </TableCell>
                        </TableRow>
                      ) : eventGuests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            Belum ada tamu.
                          </TableCell>
                        </TableRow>
                      ) : (
                        eventGuests.map((eg) => (
                          <TableRow key={eg.id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{eg.guest.name}</span>
                                <span className="text-xs text-slate-500 md:hidden">
                                  {eg.guest.whatsapp}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {eg.guest.whatsapp}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {eg.guest.area || "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Badge
                                  variant={
                                    eg.rsvpStatus === "confirmed"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {eg.rsvpStatus}
                                </Badge>
                                {eg.attendance && (
                                  <Badge className="bg-green-600 w-fit">
                                    Hadir{" "}
                                    {/* Added suppressHydrationWarning to fix Date mismatch */}
                                    <span suppressHydrationWarning>
                                      {new Date(
                                        eg.attendance.checkinTime
                                      ).toLocaleTimeString("id-ID", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => generateQrCode(eg)}
                                >
                                  <QrCode className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => copyInvitationLink(eg)}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteEventGuest(eg.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* --- VIEW: EVENTS --- */}
          {activeTab === "events" && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Dialog
                  open={showCreateEvent}
                  onOpenChange={setShowCreateEvent}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <CalendarPlus className="h-4 w-4 mr-2" /> Buat Acara Baru
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Buat Acara Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateEvent} className="space-y-4">
                      <div className="grid gap-2">
                        <Label>Judul</Label>
                        <Input
                          required
                          value={newEvent.title}
                          onChange={(e) =>
                            setNewEvent({ ...newEvent, title: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Tanggal</Label>
                          <Input
                            type="date"
                            required
                            value={newEvent.date}
                            onChange={(e) =>
                              setNewEvent({ ...newEvent, date: e.target.value })
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Waktu</Label>
                          <Input
                            type="time"
                            required
                            value={newEvent.time}
                            onChange={(e) =>
                              setNewEvent({ ...newEvent, time: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Lokasi</Label>
                        <Input
                          required
                          value={newEvent.location}
                          onChange={(e) =>
                            setNewEvent({
                              ...newEvent,
                              location: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Deskripsi</Label>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={newEvent.description}
                          onChange={(e) =>
                            setNewEvent({
                              ...newEvent,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Simpan
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {events.map((event) => (
                  <Card
                    key={event.id}
                    className={
                      selectedEventId === event.id
                        ? "border-emerald-500 ring-1 ring-emerald-500"
                        : ""
                    }
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{event.title}</CardTitle>
                          <CardDescription>
                            {event.date} • {event.time} • {event.location}
                          </CardDescription>
                        </div>
                        <Button
                          onClick={() => setSelectedEventId(event.id)}
                          variant={
                            selectedEventId === event.id ? "default" : "outline"
                          }
                          size="sm"
                        >
                          {selectedEventId === event.id ? "Aktif" : "Pilih"}
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
                {events.length === 0 && (
                  <p className="text-center text-slate-500">
                    Belum ada acara dibuat.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* --- VIEW: HISTORY --- */}
          {activeTab === "history" && (
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Acara</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <p className="text-center py-4">Memuat...</p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Acara</TableHead>
                          <TableHead className="hidden md:table-cell">
                            Tanggal
                          </TableHead>
                          <TableHead className="text-center">Total</TableHead>
                          <TableHead className="text-center">Hadir</TableHead>
                          <TableHead className="text-center">%</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {eventHistory.map((eh) => (
                          <TableRow key={eh.event.id}>
                            <TableCell className="font-medium">
                              {eh.event.title}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {eh.event.date}
                            </TableCell>
                            <TableCell className="text-center">
                              {eh.statistics.totalGuests}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-green-600">
                                {eh.statistics.checkedInGuests}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {eh.statistics.attendanceRate}%
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedEventDetail(eh);
                                    setShowEventDetail(true);
                                  }}
                                >
                                  Detail
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleExportEventData(eh)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteEvent(eh.event.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* --- MODALS / DIALOGS (Reused Components) --- */}

      {/* Add Guest Dialog */}
      <Dialog open={showAddGuest} onOpenChange={setShowAddGuest}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Tamu Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddGuest} className="space-y-4">
            <div className="grid gap-2">
              <Label>Nama *</Label>
              <Input
                required
                value={newGuest.name}
                onChange={(e) =>
                  setNewGuest({ ...newGuest, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>WhatsApp *</Label>
              <Input
                required
                value={newGuest.whatsapp}
                onChange={(e) =>
                  setNewGuest({ ...newGuest, whatsapp: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Alamat</Label>
              <Input
                value={newGuest.address}
                onChange={(e) =>
                  setNewGuest({ ...newGuest, address: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Area</Label>
              <Input
                value={newGuest.area}
                onChange={(e) =>
                  setNewGuest({ ...newGuest, area: e.target.value })
                }
              />
            </div>
            <Button type="submit" className="w-full">
              Simpan
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code Undangan</DialogTitle>
          </DialogHeader>
          {generatingQr ? (
            <div className="h-40 flex items-center justify-center">
              Generating...
            </div>
          ) : selectedEventGuest?.qrCode ? (
            <div className="space-y-4 flex flex-col items-center">
              <img
                src={selectedEventGuest.qrCode}
                alt="QR"
                className="border rounded"
              />
              <Button
                onClick={() => copyInvitationLink(selectedEventGuest!)}
                variant="outline"
                className="w-full"
              >
                Copy Link
              </Button>
            </div>
          ) : (
            <p>Tidak ada QR Code.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              accept=".csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
            <div className="text-sm bg-slate-100 p-2 rounded">
              Format: <code>nama, whatsapp, alamat, area</code>
            </div>
            <Button
              onClick={handleBulkImport}
              disabled={!importFile || importing}
              className="w-full"
            >
              {importing ? "Proses..." : "Import"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Existing Guest Dialog */}
      <Dialog
        open={showAddExistingGuests}
        onOpenChange={setShowAddExistingGuests}
      >
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Tambah dari Database</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <Input
              placeholder="Cari nama/wa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* Replaced ScrollArea with div and overflow-auto */}
            <div className="flex-1 border rounded-md overflow-y-auto p-2 space-y-2">
              {filteredGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded"
                >
                  <Checkbox
                    checked={selectedGuests.has(guest.id)}
                    onCheckedChange={(c) => {
                      const s = new Set(selectedGuests);
                      c ? s.add(guest.id) : s.delete(guest.id);
                      setSelectedGuests(s);
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{guest.name}</p>
                    <p className="text-xs text-slate-500">
                      {guest.whatsapp} • {guest.area}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={handleAddExistingGuests}
              disabled={selectedGuests.size === 0 || addingGuests}
              className="w-full"
            >
              {addingGuests
                ? "Proses..."
                : `Undang ${selectedGuests.size} Tamu`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Detail Dialog */}
      <Dialog open={showEventDetail} onOpenChange={setShowEventDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedEventDetail && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEventDetail.event.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded">
                    <p className="text-2xl font-bold">
                      {selectedEventDetail.statistics.totalGuests}
                    </p>
                    <p className="text-xs">Total</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-2xl font-bold">
                      {selectedEventDetail.statistics.checkedInGuests}
                    </p>
                    <p className="text-xs">Hadir</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded">
                    <p className="text-2xl font-bold">
                      {selectedEventDetail.statistics.pendingGuests}
                    </p>
                    <p className="text-xs">Tidak Hadir</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded">
                    <p className="text-2xl font-bold">
                      {selectedEventDetail.statistics.attendanceRate}%
                    </p>
                    <p className="text-xs">Rate</p>
                  </div>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Daftar Hadir</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Replaced ScrollArea with div and overflow-auto */}
                    <div className="h-[300px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Waktu</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedEventDetail.eventGuests
                            .filter((eg) => eg.attendance)
                            .map((eg) => (
                              <TableRow key={eg.id}>
                                <TableCell>{eg.guest.name}</TableCell>
                                <TableCell>
                                  {/* Added suppressHydrationWarning to fix Date mismatch */}
                                  <span suppressHydrationWarning>
                                    {new Date(
                                      eg.attendance!.checkinTime
                                    ).toLocaleString("id-ID")}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Sub Components for cleaner code ---

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card
      className={`${
        color === "blue"
          ? "border-blue-100"
          : color === "green"
          ? "border-green-100"
          : color === "orange"
          ? "border-orange-100"
          : "border-purple-100"
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function NavButton({
  label,
  icon,
  active,
  onClick,
  variant,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  variant?: "default" | "destructive";
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active && variant !== "destructive"
          ? "bg-emerald-50 text-emerald-700"
          : active && variant === "destructive"
          ? "bg-red-50 text-red-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
