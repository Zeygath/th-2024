'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import AdminAuth from '@/components/AdminAuth'
import AdminDashboard from '@/components/AdminDashboard'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPage() {
 const [isAdmin, setIsAdmin] = useState(false)
 const [loading, setLoading] = useState(true)
 const { supabase } = useSupabase()

 const checkAdminStatus = useCallback(async () => {
   const { data: { session } } = await supabase.auth.getSession()
   if (session) {
     const { data: adminData, error } = await supabase
       .from('admins')
       .select('*')
       .eq('user_id', session.user.id)
       .single()

     if (error) {
       console.error('Error checking admin status:', error)
     }

     setIsAdmin(!!adminData)
   }
   setLoading(false)
 }, [supabase])

 useEffect(() => {
   checkAdminStatus()
 }, [checkAdminStatus])

 if (loading) {
   return <div className="flex justify-center items-center h-screen">
     <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
   </div>
 }

 return (
   <div className="container mx-auto p-4">
     <Card className="mt-6">
       <CardHeader>
         <CardTitle className="text-2xl font-bold">Admin Dashboard</CardTitle>
       </CardHeader>
       <CardContent>
         {isAdmin ? (
           <>
             <p className="text-green-600 mb-4">Du er logget inn som admin.</p>
             <AdminDashboard />
           </>
         ) : (
           <>
             <p className="text-red-600 mb-4">Du har ikke admin rettigheter.</p>
             <AdminAuth />
           </>
         )}
       </CardContent>
     </Card>
   </div>
 )
}

