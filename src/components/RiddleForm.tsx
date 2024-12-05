'use client'

import { useState, useEffect } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      if (selectedRiddle) {
        const { error } = await supabase
          .from('riddles')
          .update({
            question,
            answer,
            hint1,
            hint2,
            order_number: parseInt(orderNumber),
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
          })

        if (error) throw error

        setMessage('Riddle added successfully!')
      }

      setQuestion('')
      setAnswer('')
      setHint1('')
      setHint2('')
      setOrderNumber('')
      setSelectedRiddle(null)
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
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Spørsmål
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Legg til spørsmålet"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Svar
                </label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Legg til svar"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Rekkefølge nummer
                </label>
                <input
                  type="number"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Legg inn rekkefølge"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Hint 1
              </label>
              <input
                type="text"
                value={hint1}
                onChange={(e) => setHint1(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Legg til første hint"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Hint 2
              </label>
              <input
                type="text"
                value={hint2}
                onChange={(e) => setHint2(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Legg til andre hint"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            >
              {selectedRiddle ? 'Update Riddle' : 'Add Riddle'}
            </button>
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
          <CardTitle>Existerende Spørsmål</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riddles.map((riddle) => (
              <div key={riddle.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                <h3 className="font-semibold mb-2">{riddle.question}</h3>
                <p className="text-sm text-muted-foreground">Svar: {riddle.answer}</p>
                <p className="text-sm text-muted-foreground">Rekkefølge: {riddle.order_number}</p>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedRiddle(riddle)
                      setQuestion(riddle.question)
                      setAnswer(riddle.answer)
                      setHint1(riddle.hint1)
                      setHint2(riddle.hint2)
                      setOrderNumber(riddle.order_number.toString())
                    }}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
                  >
                    Rediger
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
                    Slett
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

