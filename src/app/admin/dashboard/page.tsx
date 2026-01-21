'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { LogOut, UserPlus, Download, ArrowLeft, RefreshCw, QrCode, CalendarPlus, Upload, Users, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface EventGuest {
  id: string
  token: string
  rsvpStatus: string
  qrCode?: string
  createdAt: string
  guest: {
    id: string
    name: string
    whatsapp: string
    address?: string
    area?: string
  }
  event: {
    id: string
    title: string
    date: string
    time: string
    location: string
  }
  attendance?: {
    checkinTime: string
  } | null
}

interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  description?: string
  createdAt: string
}

interface EventStats {
  event: Event
  statistics: {
    totalGuests: number
    checkedInGuests: number
    pendingGuests: number
    rsvpConfirmed: number
    rsvpPending: number
    rsvpRejected: number
    attendanceRate: string
  }
  eventGuests: EventGuest[]
  recentCheckins: any[]
}

interface Guest {
  id: string
  name: string
  whatsapp: string
  address?: string
  area?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [eventGuests, setEventGuests] = useState<EventGuest[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [allGuests, setAllGuests] = useState<Guest[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [stats, setStats] = useState({
    totalGuests: 0,
    checkedInGuests: 0,
    pendingGuests: 0,
    rsvpConfirmed: 0,
    rsvpPending: 0,
    rsvpRejected: 0,
  })
  const [showAddGuest, setShowAddGuest] = useState(false)
  const [newGuest, setNewGuest] = useState({
    name: '',
    whatsapp: '',
    address: '',
    area: '',
  })
  const [showQrDialog, setShowQrDialog] = useState(false)
  const [selectedEventGuest, setSelectedEventGuest] = useState<EventGuest | null>(null)
  const [generatingQr, setGeneratingQr] = useState(false)

  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
  })

  const [showBulkImport, setShowBulkImport] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importResults, setImportResults] = useState<any>(null)
  const [importing, setImporting] = useState(false)

  const [showAddExistingGuests, setShowAddExistingGuests] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set())
  const [addingGuests, setAddingGuests] = useState(false)

  const [activeTab, setActiveTab] = useState('guests')
  const [eventHistory, setEventHistory] = useState<EventStats[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [selectedEventDetail, setSelectedEventDetail] = useState<EventStats | null>(null)
  const [showEventDetail, setShowEventDetail] = useState(false)

  useEffect(() => {
    fetchEvents()
    if (activeTab === 'history') {
      fetchEventHistory()
    }
  }, [activeTab])

  useEffect(() => {
    if (selectedEventId) {
      fetchEventGuests()
      fetchStats()
      fetchAllGuests()
    }
  }, [selectedEventId])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      if (response.ok) {
        setEvents(data.events)
        if (data.events.length > 0 && !selectedEventId) {
          setSelectedEventId(data.events[0].id)
        }
      }
    } catch (error) {
      toast.error('Gagal mengambil data acara')
    }
  }

  const fetchEventGuests = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/guests?eventId=${selectedEventId}`)
      const data = await response.json()
      if (response.ok) {
        setEventGuests(data.eventGuests)
      }
    } catch (error) {
      toast.error('Gagal mengambil data tamu')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/dashboard?eventId=${selectedEventId}`)
      const data = await response.json()
      if (response.ok) {
        setStats(data)
      }
    } catch (error) {
      toast.error('Gagal mengambil statistik')
    }
  }

  const fetchAllGuests = async () => {
    try {
      const response = await fetch(`/api/guests/all-guests?eventId=${selectedEventId}`)
      const data = await response.json()
      if (response.ok) {
        setAllGuests(data.guests)
      }
    } catch (error) {
      toast.error('Gagal mengambil data tamu database')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Logout berhasil')
      router.push('/')
    } catch (error) {
      toast.error('Gagal logout')
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      })

      if (response.ok) {
        toast.success('Acara berhasil dibuat')
        setShowCreateEvent(false)
        setNewEvent({ title: '', date: '', time: '', location: '', description: '' })
        fetchEvents()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Gagal membuat acara')
      }
    } catch (error) {
      toast.error('Gagal membuat acara')
    }
  }

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEventId,
          ...newGuest,
        }),
      })

      if (response.ok) {
        toast.success('Tamu berhasil ditambahkan')
        setShowAddGuest(false)
        setNewGuest({ name: '', whatsapp: '', address: '', area: '' })
        fetchEventGuests()
        fetchStats()
        fetchAllGuests()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Gagal menambahkan tamu')
      }
    } catch (error) {
      toast.error('Gagal menambahkan tamu')
    }
  }

  const handleDeleteEventGuest = async (eventGuestId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tamu ini dari acara?')) return

    try {
      const response = await fetch(`/api/guests/${eventGuestId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Tamu berhasil dihapus dari acara')
        fetchEventGuests()
        fetchStats()
        fetchAllGuests()
      } else {
        toast.error('Gagal menghapus tamu')
      }
    } catch (error) {
      toast.error('Gagal menghapus tamu')
    }
  }

  const handleBulkImport = async () => {
    if (!importFile) {
      toast.error('Pilih file terlebih dahulu')
      return
    }

    setImporting(true)
    setImportResults(null)

    const Papa = require('papaparse')

    Papa.parse(importFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const guests = results.data.map((row: any) => ({
            name: row.nama || row.name || '',
            whatsapp: row.whatsapp || row.no_hp || '',
            address: row.alamat || row.address || '',
            area: row.area || '',
          })).filter((guest: any) => guest.name && guest.whatsapp)

          const response = await fetch('/api/guests/bulk-import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventId: selectedEventId,
              guests,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            setImportResults(data.results)
            toast.success(`Import berhasil: ${data.results.success} tamu ditambahkan`)
            fetchEventGuests()
            fetchStats()
            fetchAllGuests()
          } else {
            const data = await response.json()
            toast.error(data.error || 'Gagal import data')
          }
        } catch (error) {
          toast.error('Gagal memproses file')
        } finally {
          setImporting(false)
        }
      },
      error: (error) => {
        toast.error('Gagal membaca file CSV')
        setImporting(false)
      },
    })
  }

  const handleAddExistingGuests = async () => {
    if (selectedGuests.size === 0) {
      toast.error('Pilih minimal 1 tamu')
      return
    }

    setAddingGuests(true)
    try {
      const response = await fetch('/api/guests/invite-to-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEventId,
          guestIds: Array.from(selectedGuests),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`${data.results.success} tamu berhasil diundang`)
        setShowAddExistingGuests(false)
        setSelectedGuests(new Set())
        setSearchQuery('')
        fetchEventGuests()
        fetchStats()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Gagal mengundang tamu')
      }
    } catch (error) {
      toast.error('Gagal mengundang tamu')
    } finally {
      setAddingGuests(false)
    }
  }

  const generateQrCode = async (eventGuest: EventGuest) => {
    setSelectedEventGuest(eventGuest)
    setGeneratingQr(true)
    setShowQrDialog(true)

    try {
      const response = await fetch('/api/qrcode/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventGuestId: eventGuest.id }),
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedEventGuest(data.eventGuest)
        toast.success('QR Code berhasil digenerate')
      } else {
        toast.error('Gagal generate QR Code')
      }
    } catch (error) {
      toast.error('Gagal generate QR Code')
    } finally {
      setGeneratingQr(false)
    }
  }

  const copyInvitationLink = (eventGuest: EventGuest) => {
    const link = `${window.location.origin}/invitation?id=${eventGuest.token}`
    navigator.clipboard.writeText(link)
    toast.success('Link undangan berhasil disalin')
  }

  const exportToExcel = () => {
    const csvContent = [
      ['Nama', 'WhatsApp', 'Alamat', 'Area', 'Status RSVP', 'Status Kehadiran', 'Waktu Check-in'],
      ...eventGuests.map(eg => [
        eg.guest.name,
        eg.guest.whatsapp,
        eg.guest.address || '',
        eg.guest.area || '',
        eg.rsvpStatus,
        eg.attendance ? 'Hadir' : 'Belum',
        eg.attendance ? new Date(eg.attendance.checkinTime).toLocaleString('id-ID') : '-',
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `guests_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('Data berhasil diexport')
  }

  const filteredGuests = allGuests.filter(guest =>
    guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.whatsapp.includes(searchQuery) ||
    (guest.area && guest.area.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <header className="border-b bg-white/50 dark:bg-neutral-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  Dashboard Admin
                </h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Manajemen Acara & Tamu
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/scanner')}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Scanner
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {events.length > 0 && activeTab === 'guests' && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    {events.map(event => (
                      <option key={event.id} value={event.id}>
                        {event.title} - {event.date}
                      </option>
                    ))}
                  </select>
                </div>
                <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
                  <DialogTrigger asChild>
                    <Button>
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Buat Acara Baru
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Buat Acara Baru</DialogTitle>
                      <DialogDescription>
                        Isi detail acara yang ingin dibuat
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateEvent} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Judul Acara *</Label>
                        <Input
                          id="title"
                          value={newEvent.title}
                          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Tanggal *</Label>
                          <Input
                            id="date"
                            type="date"
                            value={newEvent.date}
                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time">Waktu *</Label>
                          <Input
                            id="time"
                            type="time"
                            value={newEvent.time}
                            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Lokasi *</Label>
                        <Input
                          id="location"
                          value={newEvent.location}
                          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Deskripsi</Label>
                        <textarea
                          id="description"
                          value={newEvent.description}
                          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md bg-background min-h-[100px]"
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Buat Acara
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="guests">
              <UserPlus className="h-4 w-4 mr-2" />
              Tamu
            </TabsTrigger>
            <TabsTrigger value="history">
              <FileText className="h-4 w-4 mr-2" />
              Riwayat Acara
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guests">
            {activeTab === 'guests' && selectedEventId ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Tamu</CardDescription>
                      <CardTitle className="text-3xl">{stats.totalGuests}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Sudah Check-in</CardDescription>
                      <CardTitle className="text-3xl text-green-600">{stats.checkedInGuests}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Belum Hadir</CardDescription>
                      <CardTitle className="text-3xl text-orange-600">{stats.pendingGuests}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>RSVP Confirmed</CardDescription>
                      <CardTitle className="text-3xl text-blue-600">{stats.rsvpConfirmed}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <CardTitle>Daftar Tamu</CardTitle>
                        <CardDescription>
                          {eventGuests.length} tamu diundang ke acara ini
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Dialog open={showAddGuest} onOpenChange={setShowAddGuest}>
                        <DialogTrigger asChild>
                          <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Tambah Tamu Baru
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Tambah Tamu Baru</DialogTitle>
                            <DialogDescription>
                              Tambah tamu baru dan undang ke acara ini
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleAddGuest} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Nama *</Label>
                              <Input
                                id="name"
                                value={newGuest.name}
                                onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="whatsapp">WhatsApp *</Label>
                              <Input
                                id="whatsapp"
                                value={newGuest.whatsapp}
                                onChange={(e) => setNewGuest({ ...newGuest, whatsapp: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="address">Alamat</Label>
                              <Input
                                id="address"
                                value={newGuest.address}
                                onChange={(e) => setNewGuest({ ...newGuest, address: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="area">Area (Korda)</Label>
                              <Input
                                id="area"
                                value={newGuest.area}
                                onChange={(e) => setNewGuest({ ...newGuest, area: e.target.value })}
                              />
                            </div>
                            <Button type="submit" className="w-full">
                              Simpan
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Import CSV/Excel
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Import Tamu dari File CSV/Excel</DialogTitle>
                            <DialogDescription>
                              Upload file CSV dengan kolom: nama, whatsapp, alamat, area
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="csvFile">File CSV/Excel *</Label>
                              <Input
                                id="csvFile"
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                              />
                            </div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                              <p className="font-semibold mb-2">Format file CSV:</p>
                              <pre className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded text-xs overflow-x-auto">
{`nama,whatsapp,alamat,area
John Doe,081234567890,Jl. Sudirman No. 1,Jakarta
Jane Smith,081234567891,Jl. Thamrin No. 2,Jakarta`}
                              </pre>
                            </div>
                            {importResults && (
                              <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                  <div>
                                    <p className="text-2xl font-bold text-green-600">{importResults.success}</p>
                                    <p className="text-sm">Berhasil</p>
                                  </div>
                                  <div>
                                    <p className="text-2xl font-bold text-orange-600">{importResults.skipped}</p>
                                    <p className="text-sm">Dilewati</p>
                                  </div>
                                  <div>
                                    <p className="text-2xl font-bold text-red-600">{importResults.errors}</p>
                                    <p className="text-sm">Error</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            )}
                            <Button
                              onClick={handleBulkImport}
                              disabled={!importFile || importing}
                              className="w-full"
                            >
                              {importing ? 'Memproses...' : 'Import Data'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={showAddExistingGuests} onOpenChange={setShowAddExistingGuests}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Users className="h-4 w-4 mr-2" />
                            Tambah Tamu Database
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Tambah Tamu dari Database</DialogTitle>
                            <DialogDescription>
                              Pilih tamu yang sudah ada di database untuk diundang ke acara ini
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Cari tamu berdasarkan nama, WhatsApp, atau area..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <ScrollArea className="h-[300px] border rounded-md">
                              {filteredGuests.length === 0 ? (
                                <div className="p-4 text-center text-neutral-500">
                                  {allGuests.length === 0 ? 'Belum ada tamu di database' : 'Tidak ada tamu yang cocok'}
                                </div>
                              ) : (
                                <div className="p-2 space-y-2">
                                  {filteredGuests.map((guest) => (
                                    <div
                                      key={guest.id}
                                      className="flex items-center gap-3 p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                                    >
                                      <Checkbox
                                        checked={selectedGuests.has(guest.id)}
                                        onCheckedChange={(checked) => {
                                          const newSelected = new Set(selectedGuests)
                                          if (checked) {
                                            newSelected.add(guest.id)
                                          } else {
                                            newSelected.delete(guest.id)
                                          }
                                          setSelectedGuests(newSelected)
                                        }}
                                      />
                                      <div className="flex-1">
                                        <p className="font-semibold">{guest.name}</p>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                          {guest.whatsapp} {guest.area && ` • ${guest.area}`}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </ScrollArea>
                            <div className="flex gap-2">
                              <Button
                                onClick={handleAddExistingGuests}
                                disabled={selectedGuests.size === 0 || addingGuests}
                                className="flex-1"
                              >
                                {addingGuests ? 'Memproses...' : `Undang ${selectedGuests.size} Tamu`}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedGuests(new Set())
                                  setSearchQuery('')
                                }}
                              >
                                Reset
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline" onClick={exportToExcel}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="outline" onClick={() => { fetchEventGuests(); fetchStats(); fetchAllGuests(); }}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  {loading ? (
                    <div className="text-center py-8">
                      <p>Memuat data...</p>
                    </div>
                  ) : eventGuests.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-neutral-400" />
                      <p className="text-neutral-600 dark:text-neutral-400">
                        Belum ada tamu yang diundang ke acara ini
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
                        Tambahkan tamu baru atau import dari file CSV/Excel
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[600px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>WhatsApp</TableHead>
                            <TableHead>Area</TableHead>
                            <TableHead>RSVP</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {eventGuests.map((eventGuest) => (
                            <TableRow key={eventGuest.id}>
                              <TableCell className="font-medium">{eventGuest.guest.name}</TableCell>
                              <TableCell>{eventGuest.guest.whatsapp}</TableCell>
                              <TableCell>{eventGuest.guest.area || '-'}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    eventGuest.rsvpStatus === 'confirmed' ? 'default' :
                                    eventGuest.rsvpStatus === 'rejected' ? 'destructive' : 'secondary'
                                  }
                                >
                                  {eventGuest.rsvpStatus}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {eventGuest.attendance ? (
                                  <Badge variant="default" className="bg-green-600">
                                    Hadir {new Date(eventGuest.attendance.checkinTime).toLocaleTimeString('id-ID')}
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">Belum</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => generateQrCode(eventGuest)}
                                  >
                                    QR
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyInvitationLink(eventGuest)}
                                  >
                                    Link
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteEventGuest(eventGuest.id)}
                                  >
                                    Hapus
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Acara</CardTitle>
                <CardDescription>
                  Daftar semua acara yang pernah dibuat dengan statistik lengkap
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="text-center py-8">
                    <p>Memuat riwayat acara...</p>
                  </div>
                ) : eventHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-neutral-400" />
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Belum ada riwayat acara
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Acara</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Jam</TableHead>
                          <TableHead>Lokasi</TableHead>
                          <TableHead className="text-center">Total Tamu</TableHead>
                          <TableHead className="text-center">Hadir</TableHead>
                          <TableHead className="text-center">Tidak Hadir</TableHead>
                          <TableHead className="text-center">Kehadiran</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {eventHistory.map((eventStats) => (
                          <TableRow key={eventStats.event.id}>
                            <TableCell className="font-medium">{eventStats.event.title}</TableCell>
                            <TableCell>{eventStats.event.date}</TableCell>
                            <TableCell>{eventStats.event.time}</TableCell>
                            <TableCell>{eventStats.event.location}</TableCell>
                            <TableCell className="text-center">{eventStats.statistics.totalGuests}</TableCell>
                            <TableCell className="text-center">
                              <Badge className="bg-green-600">
                                {eventStats.statistics.checkedInGuests}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary">
                                {eventStats.statistics.pendingGuests}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  parseFloat(eventStats.statistics.attendanceRate) >= 70 ? 'default' :
                                  parseFloat(eventStats.statistics.attendanceRate) >= 50 ? 'secondary' : 'destructive'
                                }
                              >
                                {eventStats.statistics.attendanceRate}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedEventDetail(eventStats)
                                    setShowEventDetail(true)
                                  }}
                                >
                                  Detail
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleExportEventData(eventStats)}
                                >
                                  Export
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteEvent(eventStats.event.id)}
                                >
                                  Hapus
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code Undangan</DialogTitle>
            <DialogDescription>
              QR Code untuk {selectedEventGuest?.guest.name}
            </DialogDescription>
          </DialogHeader>
          {generatingQr ? (
            <div className="text-center py-8">
              <p>Generating QR Code...</p>
            </div>
          ) : selectedEventGuest?.qrCode ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={selectedEventGuest.qrCode}
                  alt="QR Code"
                  className="border-2 border-neutral-200 dark:border-neutral-700 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                  Token: <code className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                    {selectedEventGuest.token}
                  </code>
                </p>
                <Button
                  onClick={() => copyInvitationLink(selectedEventGuest!)}
                  className="w-full"
                  variant="outline"
                >
                  Copy Link Undangan
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-600 dark:text-neutral-400">
                QR Code belum digenerate
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showEventDetail} onOpenChange={setShowEventDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedEventDetail && (
            <>
              <DialogHeader>
                <DialogTitle>Detail Acara: {selectedEventDetail.event.title}</DialogTitle>
                <DialogDescription>
                  Statistik lengkap dan data tamu acara
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Informasi Acara</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Judul</p>
                      <p className="font-semibold">{selectedEventDetail.event.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Tanggal & Waktu</p>
                      <p className="font-semibold">
                        {selectedEventDetail.event.date} - {selectedEventDetail.event.time}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Lokasi</p>
                      <p className="font-semibold">{selectedEventDetail.event.location}</p>
                    </div>
                    {selectedEventDetail.event.description && (
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Deskripsi</p>
                        <p className="font-semibold">{selectedEventDetail.event.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Statistik Kehadiran</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-3xl font-bold text-blue-600">
                          {selectedEventDetail.statistics.totalGuests}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Tamu</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-3xl font-bold text-green-600">
                          {selectedEventDetail.statistics.checkedInGuests}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Hadir</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <p className="text-3xl font-bold text-orange-600">
                          {selectedEventDetail.statistics.pendingGuests}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Tidak Hadir</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-3xl font-bold text-purple-600">
                          {selectedEventDetail.statistics.attendanceRate}%
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Tingkat Kehadiran</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Status RSVP</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                          <p className="font-bold text-green-600">{selectedEventDetail.statistics.rsvpConfirmed}</p>
                          <p className="text-xs">Confirmed</p>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                          <p className="font-bold text-yellow-600">{selectedEventDetail.statistics.rsvpPending}</p>
                          <p className="text-xs">Pending</p>
                        </div>
                        <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                          <p className="font-bold text-red-600">{selectedEventDetail.statistics.rsvpRejected}</p>
                          <p className="text-xs">Rejected</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Daftar Tamu</CardTitle>
                  <CardDescription>
                    {selectedEventDetail.eventGuests.length} tamu di acara ini
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama</TableHead>
                          <TableHead>WhatsApp</TableHead>
                          <TableHead>Area</TableHead>
                          <TableHead>RSVP</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Waktu Check-in</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedEventDetail.eventGuests.map((eg) => (
                          <TableRow key={eg.id}>
                            <TableCell className="font-medium">{eg.guest.name}</TableCell>
                            <TableCell>{eg.guest.whatsapp}</TableCell>
                            <TableCell>{eg.guest.area || '-'}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  eg.rsvpStatus === 'confirmed' ? 'default' :
                                  eg.rsvpStatus === 'rejected' ? 'destructive' : 'secondary'
                                }
                              >
                                {eg.rsvpStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {eg.attendance ? (
                                <Badge className="bg-green-600">Hadir</Badge>
                              ) : (
                                <Badge variant="secondary">Belum</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {eg.attendance ? new Date(eg.attendance.checkinTime).toLocaleString('id-ID') : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>

              {selectedEventDetail.recentCheckins.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Check-in Terbaru</CardTitle>
                    <CardDescription>
                      {selectedEventDetail.recentCheckins.length} check-in terakhir
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {selectedEventDetail.recentCheckins.map((attendance) => (
                          <div
                            key={attendance.id}
                            className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                          >
                            <div>
                              <p className="font-semibold">{attendance.eventGuest.guest.name}</p>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {attendance.eventGuest.guest.area && `Area: ${attendance.eventGuest.guest.area}`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {new Date(attendance.checkinTime).toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <footer className="border-t bg-white/50 dark:bg-neutral-950/50 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            © 2025 E-Invitation System - Dashboard Admin
          </p>
        </div>
      </footer>
    </div>
  )
}
