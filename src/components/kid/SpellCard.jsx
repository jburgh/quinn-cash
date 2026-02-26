import { useState, useEffect, useRef } from 'react'
import { speak, spellAloud } from '../../utils/tts'
import { playLetterCorrect, playLetterIncorrect } from '../../utils/sounds'

// phase: 'spelling' | 'success' | 'failReveal'

export default function SpellCard({ wordObj, threshold, onResult }) {
  const word = wordObj.word.toLowerCase()
  const letters = word.split('')

  // Each button: { id: index, letter, used }
  const [buttons, setButtons] = useState(() =>
    letters.map((letter, i) => ({ id: i, letter, used: false }))
  )
  const [placed, setPlaced] = useState([]) // array of letter chars placed in order
  const [phase, setPhase] = useState('spelling')
  const [incorrectCount, setIncorrectCount] = useState(0)
  const [shakeLetter, setShakeLetter] = useState(null)
  const [revealed, setRevealed] = useState([]) // indices revealed during failReveal
  const advancedRef = useRef(false)

  // Speak the word on mount
  useEffect(() => {
    const t = setTimeout(() => speak(word), 300)
    return () => clearTimeout(t)
  }, [word])

  // Fisher-Yates shuffle, run once on mount
  const shuffledRef = useRef(null)
  if (!shuffledRef.current) {
    const arr = letters.map((letter, i) => ({ id: i, letter, used: false }))
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    shuffledRef.current = arr
  }
  const [shuffledButtons, setShuffledButtons] = useState(shuffledRef.current)

  const handleLetterTap = (btn) => {
    if (phase !== 'spelling' || btn.used) return

    const target = placed.length
    if (btn.letter === letters[target]) {
      // Correct
      playLetterCorrect()
      const newPlaced = [...placed, btn.letter]
      setPlaced(newPlaced)
      setShuffledButtons((prev) =>
        prev.map((b) => (b.id === btn.id ? { ...b, used: true } : b))
      )

      if (newPlaced.length === letters.length) {
        setPhase('success')
        if (!advancedRef.current) {
          advancedRef.current = true
          setTimeout(() => onResult(true), 1400)
        }
      }
    } else {
      // Wrong
      playLetterIncorrect()
      setShakeLetter(btn.id)
      setTimeout(() => setShakeLetter(null), 500)

      const newCount = incorrectCount + 1
      setIncorrectCount(newCount)
      if (newCount >= threshold) {
        setPhase('failReveal')
        doFailReveal()
      }
    }
  }

  const doFailReveal = () => {
    // Find unplaced indices
    const unplacedCount = letters.length - placed.length
    const revealDelay = 550

    for (let i = 0; i < unplacedCount; i++) {
      setTimeout(() => {
        setRevealed((prev) => [...prev, placed.length + i])
      }, i * revealDelay)
    }

    // Spell aloud after a short pause
    setTimeout(() => spellAloud(word), 200)

    const totalDelay = unplacedCount * revealDelay + 2000
    if (!advancedRef.current) {
      advancedRef.current = true
      setTimeout(() => onResult(false), totalDelay)
    }
  }

  const allRevealed = [...placed, ...letters.slice(placed.length).map((l, i) => (revealed.includes(placed.length + i) ? l : null))]

  return (
    <div className="flex flex-col items-center justify-between h-full px-4 py-6 select-none">
      {/* Word image / emoji */}
      <div className="flex flex-col items-center gap-3 mb-4">
        {wordObj.photoURL ? (
          <img
            src={wordObj.photoURL}
            alt={word}
            className="w-32 h-32 rounded-3xl object-cover shadow-md"
          />
        ) : (
          <div className="text-8xl">{wordObj.emoji}</div>
        )}
        <button
          onClick={() => speak(word)}
          className="text-gray-400 font-body text-sm active:scale-95 transition-transform"
        >
          🔊 Hear it again
        </button>
      </div>

      {/* Tile row */}
      <div className="flex gap-2 mb-6 justify-center flex-wrap">
        {letters.map((letter, i) => {
          const isPlaced = i < placed.length
          const isRevealed = !isPlaced && revealed.includes(i)
          const displayLetter = isPlaced ? placed[i] : isRevealed ? letter : ''

          let tileStyle = 'border-gray-200 bg-white text-white'
          if (isPlaced) tileStyle = 'border-quinn-teal bg-quinn-teal text-white'
          else if (isRevealed) tileStyle = 'border-red-400 bg-red-100 text-red-600'

          return (
            <div
              key={i}
              className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-display text-xl transition-all ${tileStyle}`}
            >
              {displayLetter}
            </div>
          )
        })}
      </div>

      {/* Phase message */}
      {phase === 'success' && (
        <div className="text-center mb-4">
          <div className="text-4xl mb-1">⭐</div>
          <p className="font-display text-quinn-teal text-xl">Great job!</p>
        </div>
      )}
      {phase === 'failReveal' && (
        <div className="text-center mb-4">
          <p className="font-body text-gray-400 text-sm">{"Let's try again!"}</p>
        </div>
      )}

      {/* Letter buttons */}
      {phase === 'spelling' && (
        <div className="flex flex-wrap gap-3 justify-center max-w-xs">
          {shuffledButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => handleLetterTap(btn)}
              disabled={btn.used}
              className={`w-14 h-14 rounded-2xl font-display text-2xl transition-all active:scale-90
                ${btn.used
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-quinn-blue text-white shadow-md shadow-blue-200'
                }
                ${shakeLetter === btn.id ? 'animate-shake' : ''}
              `}
            >
              {btn.letter}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
