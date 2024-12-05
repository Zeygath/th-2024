'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/supabase-provider'
import { InsertTables } from '@/types/supabase'

export default function RegistrationForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isTeam, setIsTeam] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const { supabase } = useSupabase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    try {
      // Step 1: Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: isTeam ? teamName : name,
            is_team: isTeam,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/confirm`
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Step 2: Insert the user data into the users table
        const userData: InsertTables<'users'> = {
          id: authData.user.id,
          name: isTeam ? teamName : name,
          is_team: isTeam,
          email,
        }
        const { error: profileError } = await supabase
          .from('users')
          .insert(userData)

        if (profileError) throw profileError

        // Step 3: If it's a team, create an entry in the teams table
        if (isTeam) {
          const teamData: InsertTables<'teams'> = {
            name: teamName,
            user_id: authData.user.id,
          }
          const { error: teamError } = await supabase
            .from('teams')
            .insert(teamData)

          if (teamError) throw teamError
        }

        setMessage('Registrering vellykket! Vennligst sjekk eposten din for å verifisere kontoen din.')
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(`Registrering feilet: ${error.message}`);
      } else {
        setError('An unknown error occurred during registration');
      }
      console.error('Error during registration:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-8 rounded-lg shadow-lg max-w-md mx-auto">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300">
          {isTeam ? 'Team Name' : 'Name'}
        </label>
        <input
          type="text"
          id="name"
          value={isTeam ? teamName : name}
          onChange={(e) => isTeam ? setTeamName(e.target.value) : setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
          Epost
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
          Passord
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={isTeam}
            onChange={(e) => setIsTeam(e.target.checked)}
            className="rounded border-gray-600 text-blue-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 bg-gray-700"
          />
          <span className="ml-2 text-gray-300">Register som et lag</span>
        </label>
      </div>
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      {message && (
        <div className="text-green-500 text-sm">{message}</div>
      )}
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Registrer
        </button>
      </div>
    </form>
  )
}

