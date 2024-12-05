'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import { Tables } from '@/types/supabase'

type LeaderboardEntry = {
  name: string
  score: number
  is_team: boolean
}

export default function Leaderboard() {
  const { supabase } = useSupabase()
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeaderboardData()
  }, [])

  const fetchLeaderboardData = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('user_id, score')
        .order('score', { ascending: false })
        .limit(10)

      if (error) throw error

      const userIds = data.map(entry => entry.user_id)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, is_team')
        .in('id', userIds)

      if (userError) throw userError

      const leaderboard = data.map(entry => {
        const user = userData.find(u => u.id === entry.user_id) as Tables<'users'> | undefined
        return {
          name: user?.name || 'Unknown',
          score: entry.score,
          is_team: user?.is_team || false
        }
      })

      setLeaderboardData(leaderboard)
    } catch (error) {
      console.error('Error fetching leaderboard data:', error)
      setError('Failed to load leaderboard. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center text-gray-300">Henter Leaderboard...</div>
  if (error) return <div className="text-center text-red-500">{error}</div>

  return (
    <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Navn</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {leaderboardData.map((entry, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{index + 1}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{entry.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{entry.is_team ? 'Team' : 'Individual'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

