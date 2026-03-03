import { useState, useEffect } from 'react'
import { db } from '../../firebase/config'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { playApprove, playDecline } from '../../utils/sounds'
import CoinIcon from '../common/CoinIcon'
import toast from 'react-hot-toast'
import EmptyState from '../common/EmptyState'

export default function PurchaseApprovals() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    const q = query(
      collection(db, 'purchaseRequests'),
      where('status', '==', 'pending'),
      orderBy('requestedAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  const handleApprove = async (req) => {
    setProcessing(req.id)
    try {
      await updateDoc(doc(db, 'purchaseRequests', req.id), {
        status: 'approved',
        approvedAt: serverTimestamp(),
      })
      await addDoc(collection(db, 'purchaseHistory'), {
        prizeId: req.prizeId,
        prizeName: req.prizeName,
        prizePhotoURL: req.prizePhotoURL || '',
        price: req.prizePrice,
        purchasedAt: serverTimestamp(),
        userId: user.uid,
      })
      // Item-type prizes go unavailable after purchase
      if (req.prizeType === 'item') {
        try {
          await updateDoc(doc(db, 'prizes', req.prizeId), { available: false })
        } catch {
          // Prize may have been deleted — that's fine
        }
      }
      playApprove()
      toast.success(`"${req.prizeName}" approved! 🎉`)
    } catch {
      toast.error('Failed to approve request')
    } finally {
      setProcessing(null)
    }
  }

  const handleDecline = async (req) => {
    setProcessing(req.id)
    try {
      await updateDoc(doc(db, 'purchaseRequests', req.id), {
        status: 'declined',
        declinedAt: serverTimestamp(),
      })
      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(req.prizePrice),
      })
      await addDoc(collection(db, 'users', user.uid, 'transactions'), {
        amount: req.prizePrice,
        type: 'refund',
        note: `Declined: ${req.prizeName}`,
        createdAt: serverTimestamp(),
      })
      playDecline()
      toast('Request declined — coins refunded', { icon: '👎' })
    } catch {
      toast.error('Failed to decline')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20 text-4xl animate-bounce-slow">📬</div>
  }

  return (
    <div className="p-4 pb-8">
      <h2 className="font-display text-2xl text-gray-800 mb-4">Purchase Approvals</h2>

      {requests.length === 0 ? (
        <EmptyState
          emoji="📭"
          title="No pending requests"
          subtitle="Quinn hasn't asked for anything yet!"
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isProcessing = processing === req.id
            return (
              <div key={req.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {req.prizePhotoURL ? (
                      <img
                        src={req.prizePhotoURL}
                        alt={req.prizeName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🎁
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-gray-800 text-lg leading-tight">
                      {req.prizeName}
                    </p>
                    <p className="font-body text-quinn-orange font-bold flex items-center gap-1"><CoinIcon size="xs" /> {req.prizePrice}</p>
                    <p className="font-body text-xs mt-0.5 text-green-500">
                      Balance reserved ✓
                    </p>
                  </div>
                </div>
                <div className="flex border-t border-gray-100">
                  <button
                    onClick={() => handleDecline(req)}
                    disabled={isProcessing}
                    className="flex-1 py-4 font-body font-bold text-red-400 hover:bg-red-50 active:bg-red-100 transition-colors disabled:opacity-40"
                  >
                    Decline
                  </button>
                  <div className="w-px bg-gray-100" />
                  <button
                    onClick={() => handleApprove(req)}
                    disabled={isProcessing}
                    className="flex-1 py-4 font-body font-bold text-green-500 hover:bg-green-50 active:bg-green-100 transition-colors disabled:opacity-40"
                  >
                    {isProcessing ? '...' : 'Approve ✓'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
