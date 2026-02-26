import { useEffect, useState } from 'react'
import { db } from '../../firebase/config'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import EmptyState from '../common/EmptyState'
import CoinIcon from '../common/CoinIcon'

export default function TrophyCase() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'purchaseHistory'), orderBy('purchasedAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-16 animate-bounce-slow"><CoinIcon size="xl" /></div>
    )
  }

  if (!history.length) {
    return (
      <EmptyState
        emoji="🏆"
        title="Trophy Case is empty!"
        subtitle="Get approved for a prize and it'll show up here!"
      />
    )
  }

  return (
    <div className="p-4 space-y-3 pb-8">
      {history.map((item) => {
        const date = item.purchasedAt?.toDate?.()
        return (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm"
          >
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              {item.prizePhotoURL ? (
                <img
                  src={item.prizePhotoURL}
                  alt={item.prizeName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🎁</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-gray-800 truncate">{item.prizeName}</p>
              <p className="font-body text-gray-400 text-sm">
                {date
                  ? date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Recently'}
              </p>
            </div>
            <p className="font-display text-quinn-orange text-lg flex-shrink-0 flex items-center gap-1">
              <CoinIcon size="sm" /> {item.price}
            </p>
          </div>
        )
      })}
    </div>
  )
}
