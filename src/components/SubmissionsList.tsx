'use client'

import { useState, useEffect } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

type Props = {
  supabase: SupabaseClient<Database>
}

type Submission = Database['public']['Tables']['submissions']['Row'] & {
  users: { name: string }[] | null
  riddles: { question: string }[] | null
}

type FormattedSubmission = Submission & {
  user_name: string
  riddle_question: string
}

export default function SubmissionsList({ supabase }: Props) {
  const [submissions, setSubmissions] = useState<FormattedSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    fetchSubmissions()
  }, [page])

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          users:users(name),
          riddles:riddles(question)
        `)
        .is('is_approved', null)
        .order('submitted_at', { ascending: false })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1)

      if (error) throw error

      const formattedData: FormattedSubmission[] = data.map(submission => ({
        ...submission,
        user_name: submission.users?.[0]?.name || 'Unknown',
        riddle_question: submission.riddles?.[0]?.question || 'Unknown'
      }))

      setSubmissions(prevSubmissions => [...prevSubmissions, ...formattedData])
      setHasMore(data.length === ITEMS_PER_PAGE)
    } catch (error) {
      console.error('Error fetching submissions:', error)
      setError('Failed to load submissions. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (submissionId: string, isApproved: boolean) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ is_approved: isApproved })
        .eq('id', submissionId)

      if (error) throw error

      setSubmissions(prevSubmissions => 
        prevSubmissions.filter(submission => submission.id !== submissionId)
      )
    } catch (error) {
      console.error('Error updating submission:', error)
      setError('Failed to update submission. Please try again.')
    }
  }

  const loadMore = () => {
    setPage(prevPage => prevPage + 1)
  }

  if (loading && page === 1) return <div>Loading submissions...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <div key={submission.id} className="bg-white shadow-md rounded-lg p-4">
          <h3 className="font-bold">{submission.user_name}</h3>
          <p className="text-sm text-gray-500">Spørsmål: {submission.riddle_question}</p>
          <p className="mt-2">Svar: {submission.answer}</p>
          <img src={submission.image_url} alt="Submission" className="mt-2 max-w-full h-auto" />
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => handleApproval(submission.id, true)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Godkjenn
            </button>
            <button
              onClick={() => handleApproval(submission.id, false)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Avslå
            </button>
          </div>
        </div>
      ))}
      {hasMore && (
        <button
          onClick={loadMore}
          className="w-full mt-4 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Last inn flere
        </button>
      )}
    </div>
  )
}

