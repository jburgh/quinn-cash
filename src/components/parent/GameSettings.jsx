import { useState, useEffect } from 'react'
import { db } from '../../firebase/config'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'

const SETTINGS_ID = 'default'
const DEFAULT_SETTINGS = { incorrectThreshold: 1 }

export default function GameSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [launching, setLaunching] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const snap = await getDoc(doc(db, 'gameSettings', SETTINGS_ID))
      if (snap.exists()) {
        setSettings({ ...DEFAULT_SETTINGS, ...snap.data() })
      } else {
        await setDoc(doc(db, 'gameSettings', SETTINGS_ID), DEFAULT_SETTINGS)
      }
    } catch (err) {
      console.error('GameSettings load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const update = async (field, value) => {
    const clamped = Math.max(1, value)
    const newSettings = { ...settings, [field]: clamped }
    setSettings(newSettings)
    try {
      const ref = doc(db, 'gameSettings', SETTINGS_ID)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        await updateDoc(ref, { [field]: clamped })
      } else {
        await setDoc(ref, newSettings)
      }
    } catch {
      toast.error('Failed to save settings')
    }
  }

  const handleLaunchBonus = async () => {
    if (launching) return
    setLaunching(true)
    try {
      await setDoc(doc(db, 'bonusSessionTrigger', 'global'), {
        triggered: true,
        triggeredAt: serverTimestamp(),
      })
      toast.success('Spelling game launched on the kid screen!')
    } catch {
      toast.error('Failed to launch session')
    } finally {
      setLaunching(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-8 text-3xl animate-bounce-slow">🎮</div>
  }

  return (
    <div className="p-4 pb-8 border-t border-gray-100 mt-4">
      <h2 className="font-display text-2xl text-gray-800 mb-1">Spell it! Settings</h2>
      <p className="font-body text-gray-400 text-sm mb-6">
        Earn 1 Quinn Cash per correct word. 5 words per session.
      </p>

      {/* Incorrect threshold */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <p className="font-body text-sm font-bold text-gray-700 mb-1">Wrong guesses allowed</p>
        <p className="font-body text-xs text-gray-400 mb-3">
          How many incorrect taps before the answer is revealed
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => update('incorrectThreshold', settings.incorrectThreshold - 1)}
            className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 font-display text-xl flex items-center justify-center active:scale-90 transition-transform"
          >
            −
          </button>
          <span className="font-display text-3xl text-gray-800 w-8 text-center">
            {settings.incorrectThreshold}
          </span>
          <button
            onClick={() => update('incorrectThreshold', settings.incorrectThreshold + 1)}
            className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 font-display text-xl flex items-center justify-center active:scale-90 transition-transform"
          >
            +
          </button>
        </div>
      </div>

      {/* Launch session */}
      <button
        onClick={handleLaunchBonus}
        disabled={launching}
        className="w-full bg-quinn-orange text-white font-display text-xl py-4 rounded-2xl active:scale-95 transition-all shadow-lg shadow-orange-200 disabled:opacity-50"
      >
        {launching ? 'Launching...' : '🚀 Launch Spelling Session'}
      </button>
      <p className="font-body text-xs text-gray-400 text-center mt-2">
        Opens the spelling game on the kid screen immediately
      </p>
    </div>
  )
}
