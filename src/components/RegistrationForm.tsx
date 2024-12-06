'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/supabase-provider'
import { InsertTables } from '@/types/supabase'

export default function RegistrationForm() {
  const [registrationType, setRegistrationType] = useState<'individual' | 'team'>('individual')
  const [name, setName] = useState('')
  const [teamName, setTeamName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
            name: registrationType === 'team' ? teamName : name,
            is_team: registrationType === 'team',
          },
          emailRedirectTo: `${window.location.origin}/api/auth/confirm`
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Step 2: Insert the user data into the users table
        const userData: InsertTables<'users'> = {
          id: authData.user.id,
          name: registrationType === 'team' ? teamName : name,
          is_team: registrationType === 'team',
          email,
        }
        const { error: profileError } = await supabase
          .from('users')
          .insert(userData)

        if (profileError) throw profileError

        // Step 3: If it's a team, create an entry in the teams table
        if (registrationType === 'team') {
          const teamData: InsertTables<'teams'> = {
            name: teamName,
            user_id: authData.user.id,
          }
          const { error: teamError } = await supabase
            .from('teams')
            .insert(teamData)

          if (teamError) throw teamError
        }

        setMessage('Registrering vellykket! Sjekk eposten din for å bekrefte kontoen')
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(`Registration failed: ${error.message}`);
      } else {
        setError('An unknown error occurred during registration');
      }
      console.error('Error during registration:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-8 rounded-lg shadow-lg max-w-md mx-auto">
      <div>
        <label htmlFor="registrationType" className="block text-sm font-medium text-gray-300">
          Vil du registrere lag eller enkeltperson?
        </label>
        <select
          id="registrationType"
          value={registrationType}
          onChange={(e) => setRegistrationType(e.target.value as 'individual' | 'team')}
          className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="individual">Enkeltperson</option>
          <option value="team">Lag</option>
        </select>
      </div>

      {registrationType === 'individual' ? (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            Navn
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      ) : (
        <div>
          <label htmlFor="teamName" className="block text-sm font-medium text-gray-300">
            Lagnavn
          </label>
          <input
            type="text"
            id="teamName"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      )}

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

