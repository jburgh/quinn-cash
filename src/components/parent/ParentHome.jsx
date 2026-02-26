import { useState, useEffect } from 'react'
import { db } from '../../firebase/config'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import TonightSession from './TonightSession'
import ShopManager from './ShopManager'
import BalanceManager from './BalanceManager'
import PurchaseApprovals from './PurchaseApprovals'
import CoinIcon from '../common/CoinIcon'

const TABS = [
  { label: 'Tonight', icon: '🌙' },
  { label: 'Shop', icon: '🛍️' },
  { label: 'Balance', icon: null },
  { label: 'Approvals', icon: '📬' },
]

export default function ParentHome() {
  const { switchToKid, balance } = useApp()
  const { logout } = useAuth()
  const [tab, setTab] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const q = query(collection(db, 'purchaseRequests'), where('status', '==', 'pending'))
    const unsub = onSnapshot(q, (snap) => setPendingCount(snap.size))
    return unsub
  }, [])

  const panels = [
    <TonightSession key="tonight" />,
    <ShopManager key="shop" />,
    <BalanceManager key="balance" />,
    <PurchaseApprovals key="approvals" />,
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between pt-safe-top">
        <div>
          <h1 className="font-display text-xl text-gray-800">Parent Mode 🔐</h1>
          <p className="font-body text-gray-400 text-xs flex items-center gap-1">Balance: <CoinIcon size="xs" /> {balance}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={switchToKid}
            className="bg-quinn-blue text-white font-body font-bold text-sm px-4 py-2 rounded-xl active:scale-95 transition-transform"
          >
            Kid Mode
          </button>
          <button
            onClick={logout}
            className="text-gray-400 font-body text-sm px-3 py-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">{panels[tab]}</div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex pb-safe-bottom">
        {TABS.map((t, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors relative ${
              tab === i ? 'text-quinn-blue' : 'text-gray-400'
            }`}
          >
            {t.icon ? <span className="text-xl">{t.icon}</span> : <CoinIcon size="sm" />}
            <span className="font-body text-xs font-bold">{t.label}</span>
            {/* Badge for pending approvals */}
            {i === 3 && pendingCount > 0 && (
              <span className="absolute top-1.5 right-1/4 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
