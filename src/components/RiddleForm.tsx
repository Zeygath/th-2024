'use client'

import { useState, useEffect } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Image from 'next/image'

type Props = {
  supabase: SupabaseClient<Database>
}

type Riddle = Database['public']['Tables']['riddles']['Row']

export default function RiddleForm({ supabase }: Props) {
  const [riddles, setRiddles] = useState<Riddle[]>([])
  const [selectedRiddle, setSelectedRiddle] = useState<Riddle | null>(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [hint1, setHint1] = useState('')
  const [hint2, setHint2] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [message, setMessage] = useState('')
  const [riddleType, setRiddleType] = useState('')
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null)

  useEffect(() => {
    fetchRiddles()
  }, [])

  const fetchRiddles = async () => {
    const { data, error } = await supabase
      .from('riddles')
      .select('*')
      .order('order_number')

    if (error) {
      console.error('Error fetching riddles:', error)
    } else {
      setRiddles(data)
    }
  }

  const handleReferenceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setReferenceImage(file)
      setReferenceImagePreview(URL.createObjectURL(file))
    }
  }

  const uploadReferenceImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `reference-images/${fileName}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('riddle-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('riddle-images').getPublicUrl(filePath)
      return data.publicUrl
    } catch (error) {
      console.error('Error uploading reference image:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      let referenceImageUrl = selectedRiddle?.reference_image_url

      if (referenceImage) {
        const uploadedUrl = await uploadReferenceImage(referenceImage)
        if (uploadedUrl) {
          referenceImageUrl = uploadedUrl
        } else {
          throw new Error('Failed to upload reference image')
        }
      }

      if (selectedRiddle) {
        const { error } = await supabase
          .from('riddles')
          .update({
            question,
            answer,
            hint1,
            hint2,
            order_number: parseInt(orderNumber),
            riddle_type: riddleType,
            reference_image_url: referenceImageUrl,
          })
          .eq('id', selectedRiddle.id)

        if (error) throw error

        setMessage('Riddle updated successfully!')
      } else {
        const { error } = await supabase
          .from('riddles')
          .insert({
            question,
            answer,
            hint1,
            hint2,
            order_number: parseInt(orderNumber),
            riddle_type: riddleType,
            reference_image_url: referenceImageUrl,
            is_active: true, // Add this line
          })

        if (error) throw error

        setMessage('Riddle added successfully!')
      }

      setQuestion('')
      setAnswer('')
      setHint1('')
      setHint2('')
      setOrderNumber('')
      setRiddleType('')
      setSelectedRiddle(null)
      setReferenceImage(null)
      setReferenceImagePreview(null)
      fetchRiddles()
    } catch (error) {
      console.error('Error saving riddle:', error)
      setMessage('Failed to save riddle. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{selectedRiddle ? 'Edit Riddle' : 'Add New Riddle'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4">
              <label htmlFor="riddleType" className="block text-sm font-medium text-gray-700">
                Riddle Type
              </label>
              <input
                type="text"
                id="riddleType"
                value={riddleType}
                onChange={(e) => setRiddleType(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="question" className="block text-sm font-medium text-gray-700">
                Question
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
                Answer
              </label>
              <input
                type="text"
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="hint1" className="block text-sm font-medium text-gray-700">
                Hint 1
              </label>
              <input
                type="text"
                id="hint1"
                value={hint1}
                onChange={(e) => setHint1(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="hint2" className="block text-sm font-medium text-gray-700">
                Hint 2
              </label>
              <input
                type="text"
                id="hint2"
                value={hint2}
                onChange={(e) => setHint2(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700">
                Order Number
              </label>
              <input
                type="number"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="referenceImage" className="block text-sm font-medium text-gray-700">
                Reference Image
              </label>
              <input
                type="file"
                id="referenceImage"
                onChange={handleReferenceImageChange}
                accept="image/*"
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-violet-50 file:text-violet-700
                  hover:file:bg-violet-100"
              />
            </div>
            {referenceImagePreview && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Reference Image Preview:</p>
                <Image src={referenceImagePreview} alt="Reference Image Preview" width={200} height={200} className="rounded-md" />
              </div>
            )}
            <div className="mb-4">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
              >
                {selectedRiddle ? 'Update Riddle' : 'Add Riddle'}
              </button>
            </div>
          </form>
          {message && (
            <div className={`mt-4 text-sm ${message.includes('Failed') ? 'text-destructive' : 'text-green-600'}`}>
              {message}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Riddles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riddles.map((riddle) => (
              <div key={riddle.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                <h3 className="font-semibold mb-2">{riddle.question}</h3>
                <p className="text-sm text-muted-foreground">Answer: {riddle.answer}</p>
                <p className="text-sm text-muted-foreground">Type: {riddle.riddle_type}</p>
                <p className="text-sm text-muted-foreground">Order: {riddle.order_number}</p>
                {riddle.reference_image_url && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Reference Image:</p>
                    <Image src={riddle.reference_image_url} alt="Reference Image" width={100} height={100} className="rounded-md" />
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedRiddle(riddle)
                        setQuestion(riddle.question)
                        setAnswer(riddle.answer)
                        setHint1(riddle.hint1)
                        setHint2(riddle.hint2)
                        setOrderNumber(riddle.order_number.toString())
                        setRiddleType(riddle.riddle_type)
                        setReferenceImagePreview(riddle.reference_image_url || null)
                      }}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const { error } = await supabase
                            .from('riddles')
                            .delete()
                            .eq('id', riddle.id)

                          if (error) throw error

                          setMessage('Riddle deleted successfully!')
                          fetchRiddles()
                        } catch (error) {
                          console.error('Error deleting riddle:', error)
                          setMessage('Failed to delete riddle. Please try again.')
                        }
                      }}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 px-3"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

