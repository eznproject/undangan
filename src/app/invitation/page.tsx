'use client'

import { Suspense } from 'react'
import InvitationContent from './invitation-content' // Kita pindahkan isi kode Anda ke sini

export default function InvitationPage() {
  return (
    // Suspense wajib ada agar Next.js tidak error saat build
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p>Memuat undangan...</p>
      </div>
    }>
      <InvitationContent />
    </Suspense>
  )
}