'use client'

import React, { useState, useEffect } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import { useAuth } from '@/hooks/useAuth'
import { Riddle, UserProgress, AppSettings } from '@/types/supabase'

export default function RiddleDisplay() {
  const { supabase } = useSupabase()
  const { user } = useAuth()
  const [riddle, setRiddle] = useState<Riddle | null>(null)
  const [answer, setAnswer] = useState('')
  const [showHint1, setShowHint1] = useState(false)
  const [showHint2, setShowHint2] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [riddlesVisible, setRiddlesVisible] = useState(false)

  useEffect(() => {
    if (user) {
      fetchCurrentRiddle()
    }
  }, [user])

  useEffect(() => {
    if (riddle) {
      const timer1 = setTimeout(() => setShowHint1(true), 60000)
      const timer2 = setTimeout(() => setShowHint2(true), 120000)
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [riddle])

  useEffect(() => {
    fetchRiddlesVisibility()
  }, [])

  const fetchCurrentRiddle = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('user_progress')
      .select('current_riddle_id')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No user progress found, create initial progress
        const { data: firstRiddle, error: firstRiddleError } = await supabase
          .from('riddles')
          .select('id')
          .order('order_number', { ascending: true })
          .limit(1)
          .single()

        if (firstRiddleError) {
          console.error('Error fetching first riddle:', firstRiddleError)
          return
        }

        const { data: newProgress, error: insertError } = await supabase
          .from('user_progress')
          .insert({ user_id: user.id, current_riddle_id: firstRiddle.id })
          .select()
          .single()

        if (insertError) {
          console.error('Error creating initial user progress:', insertError)
          return
        }

        await fetchRiddle(newProgress.current_riddle_id)
      } else {
        console.error('Error fetching user progress:', error)
      }
    } else if (data) {
      await fetchRiddle(data.current_riddle_id)
    }
  }

  const fetchRiddle = async (riddleId: number) => {
    const { data: riddleData, error: riddleError } = await supabase
      .from('riddles')
      .select('*')
      .eq('id', riddleId)
      .single()

    if (riddleError) {
      console.error('Error fetching riddle:', riddleError)
    } else if (riddleData) {
      setRiddle(riddleData)
    } else {
      setError('No riddle found.')
    }
  }

  const fetchRiddlesVisibility = async () => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('riddles_visible')
      .single()

    if (error) {
      console.error('Error fetching riddles visibility:', error)
    } else if (data) {
      setRiddlesVisible(data.riddles_visible)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!riddle || !user) return

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        user_id: user.id,
        riddle_id: riddle.id,
        answer: answer,
        image_url: 'placeholder_url' // You'll need to implement image upload
      })

    if (error) {
      setError('Failed to submit answer. Please try again.')
    } else {
      if (answer.toLowerCase() === riddle.answer.toLowerCase()) {
        setSuccess('Correct answer! Moving to the next riddle.')
        // Update user progress to next riddle
        const { error: progressError } = await supabase
          .from('user_progress')
          .update({ current_riddle_id: riddle.id + 1 })
          .eq('user_id', user.id)

        if (!progressError) {
          fetchCurrentRiddle()
        }
      } else {
        setError('Incorrect answer. Try again!')
      }
      setAnswer('')
    }
  }

  if (!user) {
    return <div className="text-center text-gray-300">Please log in to view riddles.</div>
  }

  if (!riddlesVisible) {
    return <div className="text-center text-gray-300">Riddles are currently not available. Please check back later.</div>
  }

  if (!riddle) {
    return <div className="text-center text-gray-300">
      {error || 'Loading riddle...'}
    </div>
  }

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-400">Current Riddle</h2>
        <p className="text-lg mb-6 text-gray-300">{riddle.question}</p>
        {showHint1 && (
          <div className="mb-4 bg-gray-700 p-3 rounded">
            <h3 className="font-semibold text-yellow-400">Hint 1:</h3>
            <p className="text-gray-300">{riddle.hint1}</p>
          </div>
        )}
        {showHint2 && (
          <div className="mb-4 bg-gray-700 p-3 rounded">
            <h3 className="font-semibold text-yellow-400">Hint 2:</h3>
            <p className="text-gray-300">{riddle.hint2}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-gray-300">
              Your Answer
            </label>
            <input
              type="text"
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-300">
              Upload Image (Coming Soon)
            </label>
            <input
              type="file"
              id="image"
              disabled
              className="mt-1 block w-full text-sm text-gray-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          {success && (
            <div className="text-green-500 text-sm">{success}</div>
          )}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit Answer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

