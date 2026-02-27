import { useState, useEffect } from 'react'
import { db } from '../../firebase/config'
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
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
  const [sort, setSort] = useState('newest')

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

  // Watch for parent-launched spelling session
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'bonusSessionTrigger', 'global'), async (snap) => {
      if (snap.exists() && snap.data().triggered === true) {
        await updateDoc(doc(db, 'bonusSessionTrigger', 'global'), { triggered: false })
        setShowGame(true)
      }
    })
    return unsub
  }, [])

  const handleParentButton = () => {
    if (!userData?.pin) {
      setShowPINSetup(true)
    } else {
      setShowPINModal(true)
    }
  }

  if (showGame) {
    return <SpellGame onClose={() => setShowGame(false)} />
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
            {loadingPrizes ? (
              <div className="flex justify-center py-16"><LoadingDeco /></div>
            ) : prizes.length === 0 ? (
              <EmptyState
                emoji="🎁"
                title="No prizes yet!"
                subtitle="Ask Mom or Dad to add prizes to your store!"
              />
            ) : (
              <>
                {/* Sort pills */}
                <div className="flex gap-2 mb-3 flex-wrap">
                  {[
                    { key: 'newest',   label: '✨ Newest' },
                    { key: 'oldest',   label: '🕰️ Oldest' },
                    { key: 'priciest', label: '💰 Priciest' },
                    { key: 'cheapest', label: '🪙 Cheapest' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setSort(key)}
                      className={`font-body text-xs font-bold px-3 py-1.5 rounded-full transition-all active:scale-95 ${
                        sort === key
                          ? 'bg-quinn-blue text-white shadow-sm'
                          : 'bg-white text-gray-500 border border-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[...prizes].sort((a, b) => {
                    if (sort === 'newest')   return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
                    if (sort === 'oldest')   return (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0)
                    if (sort === 'priciest') return b.price - a.price
                    if (sort === 'cheapest') return a.price - b.price
                    return 0
                  }).map((prize) => (
                    <PrizeCard
                      key={prize.id}
                      prize={prize}
                      balance={balance}
                      onTap={setSelectedPrize}
                      hasPending={pendingPrizeIds.has(prize.id)}
                    />
                  ))}
                </div>
              </>
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
