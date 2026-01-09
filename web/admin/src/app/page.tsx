'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminHome() {
  const router = useRouter()

  useEffect(() => {
    // Check if admin is authenticated
    const adminSession = localStorage.getItem('admin_session')
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession)
        if (session.authenticated) {
          router.push('/dashboard')
          return
        }
      } catch {
        // Invalid session
      }
    }

    // Not authenticated, redirect to login
    router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading NileLink Admin...</p>
      </div>
    </div>
  )
}