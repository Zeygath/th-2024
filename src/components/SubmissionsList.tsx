'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/types/supabase'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Submission = Database['public']['Tables']['submissions']['Row']

type FormattedSubmission = Submission & {
  user_name: string
  riddle_question: string
  signed_image_url: string | null
}

export default function SubmissionsList() {
  const supabase = createClientComponentClient<Database>()
  const [submissions, setSubmissions] = useState<FormattedSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const ITEMS_PER_PAGE = 10

  const getSignedUrl = async (filePath: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from('submissions')
        .createSignedUrl(filePath, 24 * 60 * 60) // 24 hours expiry

      if (error) throw error

      return data.signedUrl
    } catch (error) {
      console.error('Error creating signed URL:', error)
      return null
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [page])

  const fetchSubmissions = async () => {
    try {
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select('*')
        .is('is_approved', null)
        .order('submitted_at', { ascending: false })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1)

      if (submissionsError) throw submissionsError

      const formattedData: FormattedSubmission[] = await Promise.all(
        submissionsData.map(async (submission) => {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('name, is_team')
            .eq('id', submission.user_id)
            .single()

          if (userError) throw userError

          let userName = userData.name

          if (userData.is_team) {
            const { data: teamData, error: teamError } = await supabase
              .from('teams')
              .select('name')
              .eq('user_id', submission.user_id)
              .single()

            if (teamError) throw teamError

            userName = teamData.name
          }

          const { data: riddleData, error: riddleError } = await supabase
            .from('riddles')
            .select('question')
            .eq('id', submission.riddle_id)
            .single()

          if (riddleError) throw riddleError

          let signedImageUrl = null
          if (submission.image_url) {
            signedImageUrl = await getSignedUrl(submission.image_url)
          }

          return {
            ...submission,
            user_name: userName,
            riddle_question: riddleData.question,
            signed_image_url: signedImageUrl
          }
        })
      )

      setSubmissions(prevSubmissions => [...prevSubmissions, ...formattedData])
      setHasMore(formattedData.length === ITEMS_PER_PAGE)
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
  if (submissions.length === 0) return <div>No pending submissions found.</div>

  return (
    <div className="space-y-6">
      {submissions.map((submission) => (
        <div key={submission.id} className="bg-gray-800 shadow-lg rounded-lg p-6">
          <h3 className="font-bold text-xl text-blue-400 mb-2">{submission.user_name}</h3>
          <p className="text-gray-300 mb-2">Riddle: {submission.riddle_question}</p>
          <p className="text-gray-300 mb-4">Answer: {submission.answer}</p>
          {submission.signed_image_url ? (
            <div className="mb-4">
              <img 
                src={submission.signed_image_url}
                alt="Submission" 
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          ) : submission.image_url ? (
            <p className="text-yellow-500 mb-4">Image unavailable</p>
          ) : null}
          <div className="flex space-x-4">
            <button
              onClick={() => handleApproval(submission.id, true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => handleApproval(submission.id, false)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
      {hasMore && (
        <button
          onClick={loadMore}
          className="w-full mt-6 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Load More
        </button>
      )}
    </div>
  )
}

