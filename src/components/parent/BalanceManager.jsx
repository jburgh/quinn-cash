import { useState, useEffect } from 'react'
import { db } from '../../firebase/config'
import {
  doc,
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  addDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import CoinIcon from '../common/CoinIcon'
import toast from 'react-hot-toast'

export default function BalanceManager() {
  const { user } = useAuth()
  const { balance } = useApp()
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [type, setType] = useState('grant')
  const [transactions, setTransactions] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const num = Number(amount)
    if (!num || num <= 0) return
    setSaving(true)
    try {
      const delta = type === 'grant' ? num : -num
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, { balance: increment(delta) })
      await addDoc(collection(db, 'users', user.uid, 'transactions'), {
        amount: delta,
        type: 'manual',
        note: note.trim() || (type === 'grant' ? 'Manual grant' : 'Manual deduction'),
        createdAt: serverTimestamp(),
      })
      toast.success(
        type === 'grant' ? `+${num} Quinn Cash added!` : `-${num} Quinn Cash deducted`
      )
      setAmount('')
      setNote('')
    } catch {
      toast.error('Failed to update balance')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 pb-8">
      <h2 className="font-display text-2xl text-gray-800 mb-4">Balance Manager</h2>

      {/* Balance display */}
      <div className="bg-gradient-to-r from-quinn-blue to-quinn-blue-dark rounded-2xl p-5 text-white mb-6 text-center shadow-lg">
        <p className="font-body text-blue-200 text-sm">Quinn's Current Balance</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <CoinIcon size="lg" />
          <span className="font-display text-6xl">{balance}</span>
        </div>
      </div>

      {/* Grant / Deduct form */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setType('grant')}
            className={`flex-1 py-2.5 rounded-xl font-body font-bold text-sm transition-all ${
              type === 'grant' ? 'bg-green-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500'
            }`}
          >
            + Grant
          </button>
          <button
            type="button"
            onClick={() => setType('deduct')}
            className={`flex-1 py-2.5 rounded-xl font-body font-bold text-sm transition-all ${
              type === 'deduct' ? 'bg-red-400 text-white shadow-sm' : 'bg-gray-100 text-gray-500'
            }`}
          >
            − Deduct
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="font-body text-sm font-bold text-gray-600 flex items-center gap-1 mb-1">
              Amount <CoinIcon size="xs" />
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 font-display text-3xl focus:outline-none focus:border-quinn-blue text-center"
              placeholder="0"
              required
            />
          </div>
          <div>
            <label className="font-body text-sm font-bold text-gray-600 block mb-1">
              Note (optional)
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 font-body focus:outline-none focus:border-quinn-blue"
              placeholder="e.g. Helped with dinner"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className={`w-full text-white font-display text-xl py-4 rounded-xl transition-all disabled:opacity-50 active:scale-95 ${
              type === 'grant'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-400 hover:bg-red-500'
            }`}
          >
            {saving
              ? 'Saving...'
              : type === 'grant'
              ? '+ Grant Quinn Cash'
              : '− Deduct Quinn Cash'}
          </button>
        </form>
      </div>

      {/* Transaction log */}
      <h3 className="font-display text-lg text-gray-700 mb-3">Transaction History</h3>
      {transactions.length === 0 ? (
        <p className="text-center text-gray-400 font-body text-sm py-8">No transactions yet</p>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => {
            const date = tx.createdAt?.toDate?.()
            return (
              <div
                key={tx.id}
                className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-display text-lg flex-shrink-0 ${
                    tx.amount > 0
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-400'
                  }`}
                >
                  {tx.amount > 0 ? '+' : '−'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm text-gray-700 truncate">{tx.note}</p>
                  <p className="font-body text-xs text-gray-400">
                    {date
                      ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : ''}
                  </p>
                </div>
                <span
                  className={`font-display text-lg flex-shrink-0 ${
                    tx.amount > 0 ? 'text-green-500' : 'text-red-400'
                  }`}
                >
                  {tx.amount > 0 ? '+' : ''}
                  <span className="inline-flex items-center gap-1">{tx.amount} <CoinIcon size="xs" /></span>
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
