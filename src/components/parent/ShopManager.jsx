import { useState, useEffect, useRef } from 'react'
import { db } from '../../firebase/config'
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  serverTimestamp,
  orderBy,
  query,
} from 'firebase/firestore'
import { resizeImage } from '../../utils/imageUtils'
import toast from 'react-hot-toast'
import EmptyState from '../common/EmptyState'
import CoinIcon from '../common/CoinIcon'

function PrizeForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [price, setPrice] = useState(initial?.price || '')
  const [type, setType] = useState(initial?.type || 'item')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(initial?.photoURL || '')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !price) return
    setSaving(true)
    try {
      await onSave({ name, price: Number(price), type, photoFile, existingPhotoURL: initial?.photoURL })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 shadow-sm space-y-4 border-2 border-quinn-blue/20">
      {/* Photo picker */}
      <div className="flex items-center gap-4">
        <div
          onClick={() => fileRef.current.click()}
          className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-transform flex-shrink-0"
        >
          {photoPreview ? (
            <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-gray-400">
              <div className="text-3xl mb-0.5">📷</div>
              <p className="text-xs font-body">Photo</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
        <p className="font-body text-xs text-gray-400">
          {photoPreview ? 'Tap photo to change' : 'Tap to add a photo'}
        </p>
      </div>

      <div>
        <label className="font-body text-sm font-bold text-gray-600 block mb-1">Prize Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 font-body focus:outline-none focus:border-quinn-blue"
          placeholder="e.g. Treat Jar Pick"
          required
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="font-body text-sm font-bold text-gray-600 block mb-1 flex items-center gap-1">Price <CoinIcon size="xs" /></label>
          <input
            type="number"
            min="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 font-body focus:outline-none focus:border-quinn-blue"
            placeholder="5"
            required
          />
        </div>
        <div className="flex-1">
          <label className="font-body text-sm font-bold text-gray-600 block mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 font-body focus:outline-none focus:border-quinn-blue bg-white"
          >
            <option value="item">Item (one-time)</option>
            <option value="experience">Experience (reusable)</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-600 font-body font-bold py-3 rounded-xl active:scale-95"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-quinn-blue text-white font-display text-lg py-3 rounded-xl disabled:opacity-50 active:scale-95"
        >
          {saving ? 'Saving...' : initial ? 'Save Changes' : 'Add Prize'}
        </button>
      </div>
    </form>
  )
}

export default function ShopManager() {
  const [prizes, setPrizes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'prizes'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setPrizes(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  const handleAdd = async ({ name, price, type, photoFile }) => {
    try {
      const docRef = doc(collection(db, 'prizes'))

      // Resize & compress image in the browser — stored as a data URL in Firestore
      let photoURL = ''
      if (photoFile) {
        photoURL = await resizeImage(photoFile)
      }

      await setDoc(docRef, {
        name,
        price,
        type,
        photoURL,
        available: true,
        createdAt: serverTimestamp(),
      })

      toast.success('Prize added!')
      setShowForm(false)
    } catch (err) {
      console.error('Failed to add prize:', err)
      toast.error('Failed to add prize: ' + err.message)
    }
  }

  const handleEdit = async ({ name, price, type, photoFile }) => {
    try {
      const updates = { name, price, type }
      if (photoFile) {
        updates.photoURL = await resizeImage(photoFile)
      }
      await updateDoc(doc(db, 'prizes', editing.id), updates)
      toast.success('Prize updated!')
      setEditing(null)
    } catch (err) {
      console.error('Failed to update prize:', err)
      toast.error('Failed to update prize: ' + err.message)
    }
  }

  const handleDelete = async (prize) => {
    try {
      await deleteDoc(doc(db, 'prizes', prize.id))
      toast.success(`"${prize.name}" deleted`)
      setConfirmDelete(null)
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20 text-4xl animate-bounce-slow">🛒</div>
  }

  return (
    <div className="p-4 pb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl text-gray-800">Shop Manager</h2>
        {!showForm && !editing && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-quinn-blue text-white font-body font-bold text-sm px-4 py-2 rounded-xl active:scale-95 transition-transform"
          >
            + Add Prize
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-4">
          <PrizeForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {prizes.length === 0 && !showForm ? (
        <EmptyState
          emoji="🛍️"
          title="No prizes yet!"
          subtitle="Tap 'Add Prize' to stock Quinn's store."
        />
      ) : (
        <div className="space-y-3">
          {prizes.map((prize) => (
            <div key={prize.id}>
              {editing?.id === prize.id ? (
                <PrizeForm initial={prize} onSave={handleEdit} onCancel={() => setEditing(null)} />
              ) : (
                <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {prize.photoURL ? (
                      <img
                        src={prize.photoURL}
                        alt={prize.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🎁</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-gray-800 truncate">{prize.name}</p>
                    <p className="font-body text-gray-400 text-sm flex items-center gap-1">
                      <CoinIcon size="xs" /> {prize.price} &middot; {prize.type}
                    </p>
                    {!prize.available && (
                      <span className="text-xs text-red-400 font-body font-bold">Sold out</span>
                    )}
                  </div>

                  {confirmDelete === prize.id ? (
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-gray-400 font-body text-xs bg-gray-100 px-2 py-1 rounded-lg"
                      >
                        Keep
                      </button>
                      <button
                        onClick={() => handleDelete(prize)}
                        className="text-white font-body text-xs bg-red-400 px-2 py-1 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => { setEditing(prize); setShowForm(false) }}
                        className="text-quinn-blue font-body text-sm bg-blue-50 px-3 py-1.5 rounded-lg active:scale-95"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(prize.id)}
                        className="text-red-400 font-body text-sm bg-red-50 px-3 py-1.5 rounded-lg active:scale-95"
                      >
                        Del
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
