'use client'

import React, { useState, useEffect } from 'react'
import { useSupabase } from '@/app/supabase-provider'
import { useAuth } from '@/hooks/useAuth'
import { Riddle, UserProgress, AppSettings } from '@/types/supabase'
import CountdownTimer from './CountdownTimer'
import CongratulationsMessage from './CongratulationsMessage'
import Image from 'next/image'

const targetDate = new Date('2024-12-06T20:00:00') // December 6th, 2024, 20:00

const HINT1_DELAY = 10 * 60 * 1000 // 10 minutes in milliseconds
const HINT2_DELAY = 15 * 60 * 1000 // 15 minutes in milliseconds

export default function RiddleDisplay() {
 const { supabase } = useSupabase()
 const { user } = useAuth()
 const [riddle, setRiddle] = useState<Riddle | null>(null)
 const [riddleNumber, setRiddleNumber] = useState<number | null>(null)
 const [answer, setAnswer] = useState('')
 const [image, setImage] = useState<File | null>(null)
 const [imagePreview, setImagePreview] = useState<string | null>(null)
 const [showHint1, setShowHint1] = useState(false)
 const [showHint2, setShowHint2] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const [success, setSuccess] = useState<string | null>(null)
 const [riddlesVisible, setRiddlesVisible] = useState(false)
 const [uploading, setUploading] = useState(false)
 const [showConfetti, setShowConfetti] = useState(false)
 const [startTime, setStartTime] = useState<Date | null>(null)
 const [showReferenceImage, setShowReferenceImage] = useState(false)

 useEffect(() => {
   if (user && riddlesVisible) {
     fetchCurrentRiddle()
   }
 }, [user, riddlesVisible])

 useEffect(() => {
   fetchRiddlesVisibility()
 }, [])

 useEffect(() => {
   if (startTime) {
     const checkHints = () => {
       const now = new Date()
       const elapsedTime = now.getTime() - startTime.getTime()

       if (elapsedTime >= HINT1_DELAY && !showHint1) {
         setShowHint1(true)
         updateHintVisibility(1)
       }

       if (elapsedTime >= HINT2_DELAY && !showHint2) {
         setShowHint2(true)
         updateHintVisibility(2)
       }
     }

     const timer = setInterval(checkHints, 1000) // Check every second

     return () => clearInterval(timer)
   }
 }, [startTime, showHint1, showHint2])

 const fetchCurrentRiddle = async () => {
  if (!user?.id || !riddlesVisible) return;

  try {
    // Fetch user progress
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('current_riddle_id, hint1_visible, hint2_visible, start_time')
      .eq('user_id', user.id)
      .single();

    if (progressError) {
      if (progressError.code === 'PGRST116') {
        // No progress found, create initial progress
        const { data: firstRiddle, error: firstRiddleError } = await supabase
          .from('riddles')
          .select('*')
          .order('order_number', { ascending: true })
          .limit(1)
          .single();

        if (firstRiddleError) throw firstRiddleError;

        const now = new Date().toISOString()
        const { error: insertError } = await supabase
          .from('user_progress')
          .insert({ 
            user_id: user.id, 
            current_riddle_id: firstRiddle.id,
            hint1_visible: false,
            hint2_visible: false,
            start_time: now
          });

        if (insertError) throw insertError;

        setRiddle(firstRiddle);
        setRiddleNumber(1);
        setShowHint1(false);
        setShowHint2(false);
        setStartTime(new Date(now));
      } else {
        throw progressError;
      }
    } else {
      // Fetch the current riddle based on user progress
      const { data: riddleData, error: riddleError } = await supabase
        .from('riddles')
        .select('*')
        .eq('id', progressData.current_riddle_id)
        .single();

      if (riddleError) throw riddleError;

      if (!riddleData) {
        setRiddle(null);
        setRiddleNumber(null);
        setSuccess('Congratulations! You have completed all available riddles.');
      } else {
        setRiddle(riddleData);
        // Fetch the riddle number
        const { count, error: countError } = await supabase
          .from('riddles')
          .select('id', { count: 'exact', head: true })
          .lte('order_number', riddleData.order_number);

        if (countError) throw countError;

        setRiddleNumber(count);
        setShowHint1(progressData.hint1_visible);
        setShowHint2(progressData.hint2_visible);
        setStartTime(progressData.start_time ? new Date(progressData.start_time) : null);
      }
    }
  } catch (error) {
    console.error('Error fetching current riddle:', error);
    setError('Failed to load the current riddle. Please try again later.');
  }
};

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

 const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   if (e.target.files && e.target.files[0]) {
     const file = e.target.files[0]
     setImage(file)
     setImagePreview(URL.createObjectURL(file))
   }
 }

 const uploadImage = async (file: File): Promise<string | null> => {
  if (!user) throw new Error('User not authenticated')

  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `${user.id}/${fileName}`

  try {
    const { error: uploadError } = await supabase.storage
      .from('submissions')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    return filePath
  } catch (error) {
    console.error('Error uploading file:', error)
    return null
  }
}

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setSuccess(null);

  if (!image) {
    setError('Please upload an image before submitting.');
    return;
  }

  setUploading(true);

  if (!riddle || !user) {
    setError('You must be logged in to submit an answer.');
    setUploading(false);
    return;
  }

  try {
    // Check if the user has already submitted an answer for this riddle
    const { data: existingSubmission, error: checkError } = await supabase
      .from('submissions')
      .select('id')
      .eq('user_id', user.id)
      .eq('riddle_id', riddle.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingSubmission) {
      setError('You have already submitted an answer for this riddle.');
      setUploading(false);
      return;
    }

    if (answer.toLowerCase() === riddle.answer.toLowerCase()) {
      let imageUrl = '';
      if (image) {
        const uploadedPath = await uploadImage(image);
        if (!uploadedPath) {
          setError('Failed to upload image. Please try again.');
          setUploading(false);
          return;
        }
        imageUrl = uploadedPath;
      }

      const { error } = await supabase
        .from('submissions')
        .insert({
          user_id: user.id,
          riddle_id: riddle.id,
          answer: answer,
          image_url: imageUrl
        });

      if (error) throw error;

      setSuccess('Rett svar! Her er referansebilde:');
      setShowReferenceImage(true);
      
      // Fetch the next riddle
      const { data: nextRiddle, error: nextRiddleError } = await supabase
        .from('riddles')
        .select('id')
        .gt('order_number', riddle.order_number)
        .order('order_number', { ascending: true })
        .limit(1)
        .single();

      if (nextRiddleError && nextRiddleError.code !== 'PGRST116') throw nextRiddleError;

      const nextRiddleId = nextRiddle ? nextRiddle.id : riddle.id;

      // Update user progress to next riddle
      const now = new Date().toISOString()
      const { error: progressError } = await supabase
        .from('user_progress')
        .update({ 
          current_riddle_id: nextRiddleId,
          hint1_visible: false,
          hint2_visible: false,
          start_time: now
        })
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      if (!nextRiddle) {
        setSuccess('Congratulations! You have completed all available riddles.');
        setRiddle(null);
        setRiddleNumber(null);
        setShowConfetti(true);
      } else {
        // We'll fetch the next riddle after a delay to allow the user to see the reference image
        setTimeout(() => {
          fetchCurrentRiddle();
          setShowReferenceImage(false);
        }, 5000); // 5 seconds delay
      }
    } else {
      setError('Feil svar. Prøv igjen!');
    }
    setAnswer('');
    setImage(null);
    setImagePreview(null);
  } catch (error) {
    setError('Failed to submit answer. Please try again.');
    console.error('Error submitting answer:', error);
  } finally {
    setUploading(false);
  }
};

 const updateHintVisibility = async (hintNumber: 1 | 2) => {
   if (!user || !riddle) return;

   const updateField = hintNumber === 1 ? 'hint1_visible' : 'hint2_visible';
   const { error } = await supabase
     .from('user_progress')
     .update({ [updateField]: true })
     .eq('user_id', user.id)
     .eq('current_riddle_id', riddle.id);

   if (error) {
     console.error(`Error updating hint ${hintNumber} visibility:`, error);
   }
 };

 const getImageUrl = (path: string) => {
   const { data } = supabase.storage.from('submissions').getPublicUrl(path)
   return data.publicUrl
 }

 if (!user) {
   return <div className="text-center text-gray-300">Please log in to view riddles.</div>
 }

 if (!riddlesVisible) {
  return (
    <div className="max-w-2xl mx-auto bg-gray-800 shadow-lg rounded-lg overflow-hidden p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-400 text-center">Riddles are currently hidden</h2>
      {new Date() < targetDate ? (
        <>
          <p className="text-lg mb-6 text-gray-300 text-center">Riddles will be available in:</p>
          <CountdownTimer targetDate={targetDate} />
        </>
      ) : (
        <p className="text-lg mb-6 text-gray-300 text-center">
          The admins have chosen to hide the riddles for now. Please check back later.
        </p>
      )}
    </div>
  )
}

 if (!riddle) {
   return <div className="text-center text-gray-300">
     {error || success || 'Laster inn...'}
   </div>
 }

 if (showConfetti) {
  return (
    <CongratulationsMessage
      onClose={() => setShowConfetti(false)}
    />
  );
}

 return (
   <div className="max-w-2xl mx-auto bg-gray-800 shadow-lg rounded-lg overflow-hidden">
     <div className="p-6">
      {riddle.riddle_type && (
          <p className="text-md font-semibold mb-2 text-yellow-400">
            Type: {riddle.riddle_type}
          </p>
        )}
       <h2 className="text-2xl font-bold mb-4 text-blue-400">
         {riddleNumber ? `Oppgave ${riddleNumber}` : 'Nåværende oppgave'}
       </h2>
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
       {showReferenceImage && riddle.reference_image_url && (
          <div className="mb-4">
            <h3 className="font-semibold text-green-400 mb-2">referansebilde:</h3>
            <div className="relative w-full h-64">
              <Image 
                src={riddle.reference_image_url} 
                alt="Riddle Reference" 
                layout="fill"
                objectFit="contain"
                className="rounded-lg"
              />
            </div>
          </div>
        )}
       <form onSubmit={handleSubmit} className="space-y-4">
         <div>
           <label htmlFor="answer" className="block text-sm font-medium text-gray-300">
             Ditt svar
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
             last opp <span className="text-red-500">*</span>
           </label>
           <input
             type="file"
             id="image"
             onChange={handleImageChange}
             accept="image/*"
             required
             className="mt-1 block w-full text-sm text-gray-300
               file:mr-4 file:py-2 file:px-4
               file:rounded-full file:border-0
               file:text-sm file:font-semibold
               file:bg-blue-600 file:text-white
               hover:file:bg-blue-700"
           />
         </div>
         {imagePreview && (
           <div className="mt-4">
             <p className="text-sm font-medium text-gray-300 mb-2">forhåndsvisning bilde:</p>
             <Image src={imagePreview} alt="Preview" width={200} height={200} className="rounded-md" />
           </div>
         )}
         {!image && error && (
           <div className="text-red-500 text-sm mt-2">
             {error}
           </div>
         )}
         {image && error && (
           <div className="text-red-500 text-sm mt-2">
             {error}
           </div>
         )}
         {success && (
           <div className="text-green-500 text-sm">{success}</div>
         )}
         <div>
           <button
             type="submit"
             disabled={uploading || !image}
             className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {uploading ? 'Sender inn...' : 'Send inn'}
           </button>
         </div>
       </form>
     </div>
   </div>
 )
}

