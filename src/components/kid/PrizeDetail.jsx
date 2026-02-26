import { useState } from 'react'
import { db } from '../../firebase/config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { useTheme } from '../../contexts/ThemeContext'
import { playPrizeRequest } from '../../utils/sounds'
import toast from 'react-hot-toast'

export default function PrizeDetail({ prize, onClose }) {
  const { user } = useAuth()
  const { balance } = useApp()
  const { theme } = useTheme()
  const CurrencyIcon = theme.CurrencyIcon
  const [loading, setLoading] = useState(false)
  const [requested, setRequested] = useState(false)

  const canAfford = balance >= prize.price
  const diff = Math.abs(balance - prize.price)

  const handleRequest = async () => {
    if (!canAfford) return
    setLoading(true)
    try {
      await addDoc(collection(db, 'purchaseRequests'), {
        prizeId: prize.id,
        prizeName: prize.name,
        prizePhotoURL: prize.photoURL || '',
        prizePrice: prize.price,
        prizeType: prize.type,
        userId: user.uid,
        requestedAt: serverTimestamp(),
        status: 'pending',
      })
      playPrizeRequest()
      setRequested(true)
      toast.success('Request sent to Mom & Dad! 🎉')
    } catch {
      toast.error('Oops! Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-12 shadow-2xl animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="w-44 h-44 rounded-3xl overflow-hidden mx-auto mb-5 bg-gray-100 shadow-md">
          {prize.photoURL ? (
            <img src={prize.photoURL} alt={prize.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl">🎁</div>
          )}
        </div>

        <h2 className="font-display text-3xl text-center text-gray-800 mb-2">{prize.name}</h2>

        {/* Price */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <CurrencyIcon size="md" />
          <span className="font-display text-quinn-orange text-2xl">{prize.price}</span>
        </div>

        {prize.type === 'experience' && (
          <p className="text-center text-quinn-teal font-body text-sm mb-2">
            ✨ You can earn this more than once!
          </p>
        )}

        {/* Math equation */}
        {diff === 0 ? (
          <div className="text-center font-display text-green-500 text-2xl mb-6">
            You have exactly enough! 🎯
          </div>
        ) : (
          <div className={`rounded-2xl p-4 mb-6 ${canAfford ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center justify-center gap-2">
              {/* Balance */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <CurrencyIcon size="sm" />
                  <span className="font-display text-3xl text-gray-800">{balance}</span>
                </div>
                <span className="font-body text-xs text-gray-400">you have</span>
              </div>

              <span className="font-display text-3xl text-gray-400 pb-4">−</span>

              {/* Price */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <CurrencyIcon size="sm" />
                  <span className="font-display text-3xl text-gray-800">{prize.price}</span>
                </div>
                <span className="font-body text-xs text-gray-400">this costs</span>
              </div>

              <span className="font-display text-3xl text-gray-400 pb-4">=</span>

              {/* Result */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <CurrencyIcon size="sm" />
                  <span className={`font-display text-3xl ${canAfford ? 'text-green-500' : 'text-red-400'}`}>
                    {diff}
                  </span>
                </div>
                <span className={`font-body text-xs font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                  {canAfford ? 'left over ✓' : 'still need'}
                </span>
              </div>
            </div>
          </div>
        )}

        {requested ? (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center">
            <div className="text-4xl mb-2">📬</div>
            <p className="font-display text-green-600 text-xl">Request sent!</p>
            <p className="font-body text-green-500 text-sm mt-1">
              Waiting for Mom or Dad to approve...
            </p>
          </div>
        ) : canAfford ? (
          <button
            onClick={handleRequest}
            disabled={loading}
            className="w-full bg-quinn-orange hover:bg-quinn-orange-dark text-white font-display text-2xl py-5 rounded-2xl active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-orange-200"
          >
            {loading ? '...' : theme.requestLabel}
          </button>
        ) : (
          <div className="w-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl py-5 text-center">
            <p className="font-display text-gray-400 text-xl">{theme.cantAffordLabel}</p>
            <p className="font-body text-gray-400 text-sm mt-1">
              You need ${diff} more Quinn Cash
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-3 bg-quinn-blue hover:bg-quinn-blue-dark text-white font-display text-2xl py-4 rounded-2xl active:scale-95 transition-all shadow-md"
        >
          {canAfford ? 'Maybe later' : '← Go Back'}
        </button>
      </div>
    </div>
  )
}
