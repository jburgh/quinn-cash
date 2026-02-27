import { useEffect, useRef } from 'react'
import { db } from '../../firebase/config'
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  increment,
  serverTimestamp,
} from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import confetti from 'canvas-confetti'
import toast from 'react-hot-toast'

export default function SpellSummary({ results, onClose }) {
  const { user } = useAuth()
  const { theme } = useTheme()
  const savedRef = useRef(false)

  const correctCount = results.filter((r) => r.correct).length
  const earned = correctCount

  useEffect(() => {
    if (savedRef.current) return
    savedRef.current = true
    saveResults()
  }, [])

  const saveResults = async () => {
    if (earned === 0) return

    try {
      await updateDoc(doc(db, 'users', user.uid), { balance: increment(earned) })

      await addDoc(collection(db, 'users', user.uid, 'transactions'), {
        amount: earned,
        type: 'spellit',
        note: `Spell it! — ${correctCount}/${results.length} words correct`,
        createdAt: serverTimestamp(),
      })

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: theme.confettiColors,
      })
      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 100,
          origin: { y: 0.45 },
          colors: theme.confettiColors,
        })
      }, 300)

      theme.bankSound()
    } catch (err) {
      console.error('SpellSummary save error:', err)
      toast.error('Could not save results')
    }
  }

  return (
    <div className="flex flex-col items-center px-6 py-10 min-h-screen bg-white">
      <div className="text-6xl mb-3">{earned > 0 ? '🌟' : '💪'}</div>
      <h2 className="font-display text-3xl text-gray-800 mb-1">
        {earned > 0 ? 'Amazing!' : 'Good try!'}
      </h2>

      {earned > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="font-display text-2xl text-quinn-orange">+{earned}</span>
          <span className="font-body text-gray-500 text-lg">Quinn Cash earned!</span>
        </div>
      )}

      {/* Results list */}
      <div className="w-full max-w-xs space-y-2 mb-8 mt-2">
        {results.map((r, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${
              r.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}
          >
            <span className="text-xl">{r.correct ? '✅' : '❌'}</span>
            <span className="font-display text-lg text-gray-800">{r.word}</span>
            <span className="ml-auto text-2xl">{r.emoji}</span>
          </div>
        ))}
      </div>

      <div className="w-full max-w-xs">
        <button
          onClick={onClose}
          className="w-full bg-quinn-teal text-white font-display text-xl py-4 rounded-2xl active:scale-95 transition-all shadow-lg"
        >
          Back to Store
        </button>
      </div>
    </div>
  )
}
