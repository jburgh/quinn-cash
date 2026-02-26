import { useState, useEffect } from 'react'
import { db } from '../../firebase/config'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
  increment,
} from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import CoinIcon from '../common/CoinIcon'
import confetti from 'canvas-confetti'
import { playCoinRevoke } from '../../utils/sounds'
import toast from 'react-hot-toast'

const TOTAL_COINS = 3

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

export default function TonightSession() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const SessionDeco = theme.SessionDecoration
  const CurrencyIcon = theme.CurrencyIcon
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [banking, setBanking] = useState(false)

  const todayKey = getTodayKey()
  const sessionId = `${user.uid}_${todayKey}`

  useEffect(() => {
    loadSession()
  }, [])

  const loadSession = async () => {
    setLoading(true)
    const ref = doc(db, 'sessions', sessionId)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      setSession(snap.data())
    } else {
      const newSession = {
        userId: user.uid,
        date: todayKey,
        coinsStarted: TOTAL_COINS,
        revokedCoins: [],
        banked: false,
        coinsBanked: 0,
        createdAt: serverTimestamp(),
      }
      await setDoc(ref, newSession)
      setSession(newSession)
    }
    setLoading(false)
  }

  const toggleCoin = async (coinIndex) => {
    if (session?.banked) return
    const revokedCoins = session?.revokedCoins || []
    const isRevoked = revokedCoins.includes(coinIndex)
    const newRevoked = isRevoked
      ? revokedCoins.filter((i) => i !== coinIndex)
      : [...revokedCoins, coinIndex]

    if (!isRevoked) playCoinRevoke()

    const ref = doc(db, 'sessions', sessionId)
    await updateDoc(ref, { revokedCoins: newRevoked })
    setSession((prev) => ({ ...prev, revokedCoins: newRevoked }))
  }

  const handleBankIt = async () => {
    if (session?.banked || banking) return
    const revokedCoins = session?.revokedCoins || []
    const remaining = TOTAL_COINS - revokedCoins.length

    if (remaining === 0) {
      toast("All coins were revoked — nothing to bank!", { icon: '😅' })
      return
    }

    setBanking(true)
    try {
      const ref = doc(db, 'sessions', sessionId)
      const userRef = doc(db, 'users', user.uid)

      await updateDoc(ref, {
        banked: true,
        coinsBanked: remaining,
        bankedAt: serverTimestamp(),
      })
      await updateDoc(userRef, { balance: increment(remaining) })
      await addDoc(collection(db, 'users', user.uid, 'transactions'), {
        amount: remaining,
        type: 'session',
        note: `Tonight's session — ${remaining} coin${remaining !== 1 ? 's' : ''} banked`,
        createdAt: serverTimestamp(),
      })

      setSession((prev) => ({ ...prev, banked: true, coinsBanked: remaining }))

      // Confetti burst
      confetti({
        particleCount: 160,
        spread: 80,
        origin: { y: 0.6 },
        colors: theme.confettiColors,
      })
      setTimeout(
        () =>
          confetti({
            particleCount: 80,
            spread: 110,
            origin: { y: 0.45 },
            colors: theme.confettiColors,
          }),
        350
      )

      theme.bankSound()
      toast.success(`Quinn earned ${remaining} Quinn Cash tonight! 🎉`, {
        duration: 5000,
        style: { fontSize: '16px' },
      })
    } catch {
      toast.error('Something went wrong!')
    } finally {
      setBanking(false)
    }
  }

  const handleNewSession = async () => {
    const newSession = {
      userId: user.uid,
      date: todayKey,
      coinsStarted: TOTAL_COINS,
      revokedCoins: [],
      banked: false,
      coinsBanked: 0,
      createdAt: serverTimestamp(),
    }
    const ref = doc(db, 'sessions', sessionId)
    await setDoc(ref, newSession)
    setSession(newSession)
  }

  if (loading) {
    return <div className="flex justify-center py-20 text-4xl animate-bounce-slow">🌙</div>
  }

  const revokedCoins = session?.revokedCoins || []
  const remaining = TOTAL_COINS - revokedCoins.length
  const isBanked = session?.banked

  return (
    <div className="p-6">
      <h2 className="font-display text-2xl text-gray-800 mb-1">Tonight's Session</h2>
      <p className="font-body text-gray-400 text-sm mb-8">
        Tap a coin to revoke it. Bank the rest when done!
      </p>

      {isBanked ? (
        <div className="text-center py-8">
          <div className="text-7xl mb-5 animate-bounce-slow">{theme.celebrationEmoji}</div>
          <h3 className="font-display text-3xl text-quinn-teal mb-3">{theme.celebrationTitle}</h3>
          <p className="font-body text-gray-500 text-lg mb-2">
            Quinn earned{' '}
            <span className="font-bold text-quinn-orange inline-flex items-center gap-1"><CurrencyIcon size="sm" /> {session.coinsBanked}</span> Quinn Cash
            tonight!
          </p>
          <p className="font-body text-gray-400 text-sm mb-8">
            Come back tomorrow for a new session.
          </p>
          <button
            onClick={handleNewSession}
            className="bg-quinn-blue text-white font-display text-lg px-8 py-4 rounded-2xl active:scale-95 transition-all shadow-lg"
          >
            Start a New Session
          </button>
        </div>
      ) : (
        <>
          {/* Session decoration (e.g. goal post in soccer theme) */}
          {SessionDeco && <SessionDeco />}

          {/* Coins */}
          <div className="flex justify-center gap-5 mb-6">
            {Array.from({ length: TOTAL_COINS }).map((_, i) => {
              const isRevoked = revokedCoins.includes(i)
              return (
                <button
                  key={i}
                  onClick={() => toggleCoin(i)}
                  className={`transition-all active:scale-90 select-none rounded-full ${
                    isRevoked ? 'opacity-40 grayscale' : theme.coinActiveClass
                  }`}
                >
                  {isRevoked ? (
                    <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl text-gray-500 shadow-sm">✕</div>
                  ) : (
                    <CurrencyIcon size="2xl" />
                  )}
                </button>
              )
            })}
          </div>

          <div className="text-center mb-8">
            <p className="font-display text-3xl">
              <span className={remaining === 0 ? 'text-red-400' : 'text-quinn-teal'}>
                {remaining}
              </span>
              <span className="text-gray-400 text-xl"> / {TOTAL_COINS} coins remaining</span>
            </p>
            <p className="font-body text-gray-400 text-sm mt-1">
              Tap a coin to revoke it
            </p>
          </div>

          <button
            onClick={handleBankIt}
            disabled={banking}
            className="w-full bg-quinn-orange hover:bg-quinn-orange-dark text-white font-display text-3xl py-6 rounded-3xl active:scale-95 transition-all shadow-xl shadow-orange-200 disabled:opacity-50"
          >
            {banking ? 'Banking...' : theme.bankLabel}
          </button>
        </>
      )}
    </div>
  )
}
