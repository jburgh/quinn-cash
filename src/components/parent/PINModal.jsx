import { useEffect } from 'react'
import { useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { playPINTap, playError } from '../../utils/sounds'

export default function PINModal({ onClose, onNoPIN }) {
  const { switchToParent, userData } = useApp()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const handleDigit = (digit) => {
    if (!userData?.pin) {
      onNoPIN?.()
      return
    }
    if (pin.length >= 4) return
    playPINTap()
    const newPin = pin + digit
    setPin(newPin)
    setError(false)

    if (newPin.length === 4) {
      const success = switchToParent(newPin)
      if (!success) {
        playError()
        setShake(true)
        setTimeout(() => {
          setPin('')
          setError(true)
          setShake(false)
        }, 500)
      }
    }
  }

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1))
    setError(false)
  }

  // Keyboard support — re-registers each render so handlers are always fresh
  useEffect(() => {
    const handler = (e) => {
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key)
      else if (e.key === 'Backspace') handleDelete()
      else if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-pop">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔐</div>
          <h2 className="font-display text-2xl text-quinn-blue">Parent Mode</h2>
          <p className="font-body text-gray-400 text-sm mt-1">Enter your 4-digit PIN</p>
        </div>

        {/* PIN dots */}
        <div className={`flex justify-center gap-4 mb-4 ${shake ? 'animate-wiggle' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full border-2 transition-all duration-150 ${
                i < pin.length
                  ? 'bg-quinn-blue border-quinn-blue scale-110'
                  : error
                  ? 'border-red-400 bg-red-100'
                  : 'border-gray-300'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-red-500 font-body text-sm mb-4">
            Wrong PIN, try again!
          </p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handleDigit(String(n))}
              className="bg-gray-100 hover:bg-quinn-blue hover:text-white active:scale-90 text-gray-800 font-display text-2xl h-16 rounded-2xl transition-all"
            >
              {n}
            </button>
          ))}
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-red-50 text-gray-400 font-body text-sm h-16 rounded-2xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="bg-gray-100 hover:bg-quinn-blue hover:text-white active:scale-90 text-gray-800 font-display text-2xl h-16 rounded-2xl transition-all"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="bg-gray-100 hover:bg-red-50 text-gray-600 text-xl h-16 rounded-2xl transition-all"
          >
            ⌫
          </button>
        </div>

        <p className="text-center text-gray-300 font-body text-xs">
          You can also type on your keyboard
        </p>
      </div>
    </div>
  )
}
