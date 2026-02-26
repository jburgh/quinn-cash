import { useState, useEffect } from 'react'
import { db } from '../../firebase/config'
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import PrizeCard from './PrizeCard'
import PrizeDetail from './PrizeDetail'
import TrophyCase from './TrophyCase'
import PINModal from '../parent/PINModal'
import PINSetup from '../parent/PINSetup'
import EmptyState from '../common/EmptyState'
import SpellGame from './SpellGame'

export default function KidHome() {
  const { balance, userData } = useApp()
  const { user } = useAuth()
  const { theme } = useTheme()
  const HeaderDeco = theme.HeaderDecoration
  const LoadingDeco = theme.LoadingDecoration
  const CurrencyIcon = theme.CurrencyIcon
  const [tab, setTab] = useState(0)
  const [prizes, setPrizes] = useState([])
  const [loadingPrizes, setLoadingPrizes] = useState(true)
  const [pendingPrizeIds, setPendingPrizeIds] = useState(new Set())
  const [selectedPrize, setSelectedPrize] = useState(null)
  const [showPINModal, setShowPINModal] = useState(false)
  const [showPINSetup, setShowPINSetup] = useState(false)
  const [showGame, setShowGame] = useState(false)
  const [bonusMode, setBonusMode] = useState(false)
  const [capReached, setCapReached] = useState(false)
  const [hasActiveWords, setHasActiveWords] = useState(false)

  useEffect(() => {
    const q = query(
      collection(db, 'prizes'),
      where('available', '==', true),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setPrizes(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoadingPrizes(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'purchaseRequests'),
      where('status', '==', 'pending'),
      where('userId', '==', user.uid)
    )
    const unsub = onSnapshot(q, (snap) => {
      setPendingPrizeIds(new Set(snap.docs.map((d) => d.data().prizeId)))
    })
    return unsub
  }, [user])

  // Watch for active words
  useEffect(() => {
    const q = query(collection(db, 'wordList'), where('active', '==', true))
    const unsub = onSnapshot(q, (snap) => setHasActiveWords(snap.size > 0))
    return unsub
  }, [])

  // Watch daily cap
  useEffect(() => {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    const earningsId = `${user.uid}_${today}`

    const earningsUnsub = onSnapshot(doc(db, 'gameEarnings', earningsId), async (earningsSnap) => {
      const totalEarned = earningsSnap.exists() ? (earningsSnap.data().totalEarned || 0) : 0
      try {
        const settingsSnap = await getDoc(doc(db, 'gameSettings', 'default'))
        const dailyCap = settingsSnap.exists() ? (settingsSnap.data().dailyCap || 5) : 5
        setCapReached(totalEarned >= dailyCap)
      } catch {
        setCapReached(false)
      }
    })
    return earningsUnsub
  }, [user])

  // Watch bonus session trigger
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'bonusSessionTrigger', 'global'), async (snap) => {
      if (snap.exists() && snap.data().triggered === true) {
        await updateDoc(doc(db, 'bonusSessionTrigger', 'global'), { triggered: false })
        setBonusMode(true)
        setShowGame(true)
      }
    })
    return unsub
  }, [])

  const handleGameClose = () => {
    setShowGame(false)
    setBonusMode(false)
  }

  const handleParentButton = () => {
    if (!userData?.pin) {
      setShowPINSetup(true)
    } else {
      setShowPINModal(true)
    }
  }

  if (showGame) {
    return <SpellGame bonusMode={bonusMode} onClose={handleGameClose} />
  }

  return (
    <div className={`min-h-screen ${theme.pageBg} flex flex-col`}>
      {/* Header */}
      <div className={`${theme.headerBg} text-white pt-safe-top relative`}>
        {HeaderDeco && <HeaderDeco />}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div>
            <p className={theme.balanceLabelClass}>{theme.balanceLabel}</p>
            <div className="flex items-center gap-3 mt-1">
              <CurrencyIcon size="xl" />
              <span className="font-display text-6xl leading-none">{balance}</span>
            </div>
          </div>
          <button
            onClick={handleParentButton}
            className="bg-white/20 hover:bg-white/30 active:scale-95 text-white font-body font-bold text-xs px-4 py-2 rounded-xl transition-all"
          >
            🔐 Parent
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 mt-3 gap-1">
          {[theme.storeTab, theme.trophyTab].map((t, i) => (
            <button
              key={i}
              onClick={() => setTab(i)}
              className={`flex-1 py-3 font-body font-bold text-sm rounded-t-2xl transition-all ${
                tab === i ? theme.tabActive : theme.tabInactive
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 0 ? (
          <div className="p-4 pb-8">
            {/* Spell It! game button — top of store */}
            <div className="mb-4">
              {!hasActiveWords ? (
                <button
                  disabled
                  className="w-full bg-gray-100 text-gray-400 font-display text-xl py-5 rounded-2xl cursor-not-allowed"
                >
                  Ask Mom or Dad to add words! 📚
                </button>
              ) : capReached ? (
                <button
                  disabled
                  className="w-full bg-gray-100 text-gray-400 font-display text-xl py-5 rounded-2xl cursor-not-allowed"
                >
                  Come back tomorrow! ⭐
                </button>
              ) : (
                <button
                  onClick={() => setShowGame(true)}
                  className="w-full bg-quinn-teal text-white font-display text-xl py-5 rounded-2xl active:scale-95 transition-all shadow-lg shadow-teal-200"
                >
                  Earn More 🎮
                </button>
              )}
            </div>

            {loadingPrizes ? (
              <div className="flex justify-center py-16"><LoadingDeco /></div>
            ) : prizes.length === 0 ? (
              <EmptyState
                emoji="🎁"
                title="No prizes yet!"
                subtitle="Ask Mom or Dad to add prizes to your store!"
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {prizes.map((prize) => (
                  <PrizeCard
                    key={prize.id}
                    prize={prize}
                    balance={balance}
                    onTap={setSelectedPrize}
                    hasPending={pendingPrizeIds.has(prize.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <TrophyCase />
        )}
      </div>

      {/* Modals */}
      {selectedPrize && (
        <PrizeDetail
          prize={selectedPrize}
          onClose={() => setSelectedPrize(null)}
          hasPending={pendingPrizeIds.has(selectedPrize.id)}
        />
      )}
      {showPINModal && (
        <PINModal
          onClose={() => setShowPINModal(false)}
          onNoPIN={() => {
            setShowPINModal(false)
            setShowPINSetup(true)
          }}
        />
      )}
      {showPINSetup && (
        <PINSetup onCancel={() => setShowPINSetup(false)} />
      )}
    </div>
  )
}
