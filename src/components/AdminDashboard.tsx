'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import RiddleForm from './RiddleForm'
import SubmissionsList from './SubmissionsList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AppSettings } from '@/types/supabase'

export default function AdminDashboard() {
 const { supabase } = useSupabase()
 const [riddlesVisible, setRiddlesVisible] = useState(false)

 useEffect(() => {
  fetchRiddlesVisibility()
 }, [])

 const fetchRiddlesVisibility = async () => {
  const { data, error } = await supabase
    .from('app_settings')
    .select('riddles_visible')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found, create initial settings
      const { data: newData, error: insertError } = await supabase
        .from('app_settings')
        .insert({ riddles_visible: false })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating initial app settings:', insertError)
      } else if (newData) {
        setRiddlesVisible(newData.riddles_visible)
      }
    } else {
      console.error('Error fetching riddles visibility:', error)
    }
  } else if (data) {
    setRiddlesVisible(data.riddles_visible)
  }
 }

 const toggleRiddlesVisibility = async (newValue: boolean) => {
  const { error } = await supabase
    .from('app_settings')
    .update({ riddles_visible: newValue })
    .eq('id', 1)

  if (error) {
    console.error('Error updating riddles visibility:', error)
  } else {
    setRiddlesVisible(newValue)
  }
 }

 return (
   <Tabs defaultValue="riddles" className="w-full">
     <div className="mb-4 p-4 bg-secondary rounded-lg">
       <div className="flex items-center space-x-2">
         <Switch
           id="riddles-visible"
           checked={riddlesVisible}
           onCheckedChange={toggleRiddlesVisibility}
         />
         <Label htmlFor="riddles-visible">
           {riddlesVisible ? 'Riddles are visible to users' : 'Riddles are hidden from users'}
         </Label>
       </div>
     </div>
     <TabsList className="grid w-full grid-cols-2">
       <TabsTrigger value="riddles">Administrer oppgaver</TabsTrigger>
       <TabsTrigger value="submissions">Gå igjennom svar</TabsTrigger>
     </TabsList>
     <TabsContent value="riddles">
       <RiddleForm supabase={supabase} />
     </TabsContent>
     <TabsContent value="submissions">
       <SubmissionsList />
     </TabsContent>
   </Tabs>
 )
}

