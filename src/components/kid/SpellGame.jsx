import { useState, useEffect } from 'react'
import { db } from '../../firebase/config'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import SpellCard from './SpellCard'
import SpellSummary from './SpellSummary'

const WORDS_PER_ROUND = 5

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function SpellGame({ bonusMode, onClose }) {
  const [words, setWords] = useState(null) // null = loading
  const [settings, setSettings] = useState({ incorrectThreshold: 1, dailyCap: 5 })
  const [currentIdx, setCurrentIdx] = useState(0)
  const [results, setResults] = useState([])
  const [done, setDone] = useState(false)

  useEffect(() => {
    loadGame()
  }, [])

  const loadGame = async () => {
    try {
      // Load settings
      const settingsSnap = await getDoc(doc(db, 'gameSettings', 'default'))
      const s = settingsSnap.exists()
        ? settingsSnap.data()
        : { incorrectThreshold: 1, dailyCap: 5 }
      setSettings(s)

      // Load active words
      const q = query(collection(db, 'wordList'), where('active', '==', true))
      const snap = await getDocs(q)
      const active = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

      if (active.length === 0) {
        onClose()
        return
      }

      const picked = shuffle(active).slice(0, WORDS_PER_ROUND)
      setWords(picked)
      setCurrentIdx(0)
      setResults([])
      setDone(false)
    } catch (err) {
      console.error('SpellGame load error:', err)
      onClose()
    }
  }

  const handleResult = (correct) => {
    const word = words[currentIdx]
    const newResults = [...results, { word: word.word, emoji: word.emoji, correct }]
    setResults(newResults)

    if (currentIdx + 1 < words.length) {
      setCurrentIdx((i) => i + 1)
    } else {
      setDone(true)
    }
  }

  const handlePlayAgain = () => {
    setWords(null)
    loadGame()
  }

  if (words === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-5xl animate-bounce-slow">📚</div>
      </div>
    )
  }

  if (done) {
    return (
      <SpellSummary
        results={results}
        bonusMode={bonusMode}
        onPlayAgain={handlePlayAgain}
        onClose={onClose}
      />
    )
  }

  const wordObj = words[currentIdx]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-quinn-teal text-white px-4 pt-safe-top pb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-white/80 font-body text-sm active:scale-95 transition-transform"
          >
            ✕ Quit
          </button>
          <p className="font-body text-sm font-bold">
            Word {currentIdx + 1} of {words.length}
          </p>
          <div className="w-12" />
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${((currentIdx) / words.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card — key forces remount on each word */}
      <div className="flex-1 overflow-y-auto">
        <SpellCard
          key={wordObj.id + '-' + currentIdx}
          wordObj={wordObj}
          threshold={settings.incorrectThreshold}
          onResult={handleResult}
        />
      </div>
    </div>
  )
}
