'use client'

import { useAuth } from '@/hooks/useAuth'
import RiddleDisplay from '@/components/RiddleDisplay'
import LoginForm from '@/components/LoginForm'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-400">Velkommen til NL WoW Treasure Hunt</h1>
      <p className="text-lg mb-8 text-center text-gray-300">
        Gjør dere klare til å være detektiver i Azeroth løs gåter effektivt!
      </p>
      {user ? <RiddleDisplay /> : <LoginForm />}
    </div>
  )
}