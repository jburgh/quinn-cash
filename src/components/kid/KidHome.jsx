import { useState, useEffect } from 'react'
import { db } from '../../firebase/config'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { useApp } from '../../contexts/AppContext'
import { useTheme } from '../../contexts/ThemeContext'
import PrizeCard from './PrizeCard'
import PrizeDetail from './PrizeDetail'
import TrophyCase from './TrophyCase'
import PINModal from '../parent/PINModal'
import PINSetup from '../parent/PINSetup'
import EmptyState from '../common/EmptyState'

export default function KidHome() {
  const { balance, userData } = useApp()
  const { theme } = useTheme()
  const HeaderDeco = theme.HeaderDecoration
  const LoadingDeco = theme.LoadingDecoration
  const CurrencyIcon = theme.CurrencyIcon
  const [tab, setTab] = useState(0)
  const [prizes, setPrizes] = useState([])
  const [loadingPrizes, setLoadingPrizes] = useState(true)
  const [selectedPrize, setSelectedPrize] = useState(null)
  const [showPINModal, setShowPINModal] = useState(false)
  const [showPINSetup, setShowPINSetup] = useState(false)

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

  const handleParentButton = () => {
    if (!userData?.pin) {
      setShowPINSetup(true)
    } else {
      setShowPINModal(true)
    }
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
              <div className="grid grid-cols-2 gap-3">
                {prizes.map((prize) => (
                  <PrizeCard
                    key={prize.id}
                    prize={prize}
                    balance={balance}
                    onTap={setSelectedPrize}
                  />
                ))}
              </div>
            )}

            {/* Phase 2 Placeholder */}
            <div className="mt-6 relative">
              <button
                disabled
                className="w-full bg-gray-100 text-gray-300 font-display text-xl py-5 rounded-2xl cursor-not-allowed"
              >
                Earn More 🎮
              </button>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-gray-200 text-gray-500 font-body text-xs font-bold px-3 py-1 rounded-full">
                  Coming soon!
                </span>
              </div>
            </div>
          </div>
        ) : (
          <TrophyCase />
        )}
      </div>

      {/* Modals */}
      {selectedPrize && (
        <PrizeDetail prize={selectedPrize} onClose={() => setSelectedPrize(null)} />
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
