'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSupabase } from '@/app/supabase-provider'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"

export function Navbar() {
  const pathname = usePathname()
  const { supabase } = useSupabase()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: adminData } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
        setIsAdmin(!!adminData)
      }
    }
    checkAdminStatus()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    // Redirect to home page after logout
    window.location.href = '/'
  }

  return (
    <nav className="bg-primary text-primary-foreground shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <img className="h-8 w-8" src="/NL_logo_scaled-36x36.png" alt="WoW Logo" />
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/' ? 'bg-primary-foreground text-primary' : 'text-primary-foreground hover:bg-primary-foreground/10'}`}>
                  Hjem
                </Link>
                <Link href="/leaderboard" className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/leaderboard' ? 'bg-primary-foreground text-primary' : 'text-primary-foreground hover:bg-primary-foreground/10'}`}>
                  Leaderboard
                </Link>
                {isAdmin && (
                  <Link href="/admin" className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/admin' ? 'bg-primary-foreground text-primary' : 'text-primary-foreground hover:bg-primary-foreground/10'}`}>
                    Admin
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div>
            <Button onClick={handleLogout} variant="secondary">
              Logg ut
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

