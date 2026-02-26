import { useState, useEffect, useRef } from 'react'
import { db } from '../../firebase/config'
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore'
import { resizeImage } from '../../utils/imageUtils'
import toast from 'react-hot-toast'

const STARTER_WORDS = [
  { word: 'cat', emoji: '🐱' },
  { word: 'dog', emoji: '🐶' },
  { word: 'sun', emoji: '☀️' },
  { word: 'hat', emoji: '🎩' },
  { word: 'bus', emoji: '🚌' },
  { word: 'cup', emoji: '☕' },
  { word: 'bed', emoji: '🛏️' },
  { word: 'red', emoji: '🔴' },
  { word: 'big', emoji: '💪' },
  { word: 'run', emoji: '🏃' },
]

async function seedStarterWords() {
  for (const w of STARTER_WORDS) {
    await addDoc(collection(db, 'wordList'), {
      word: w.word,
      emoji: w.emoji,
      photoURL: '',
      active: true,
      createdAt: serverTimestamp(),
    })
  }
}

function WordForm({ onSave, onCancel }) {
  const [word, setWord] = useState('')
  const [emoji, setEmoji] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
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
    const cleaned = word.trim().toLowerCase()
    if (!cleaned || !emoji.trim()) return
    setSaving(true)
    try {
      let photoURL = ''
      if (photoFile) {
        photoURL = await resizeImage(photoFile, 400, 0.72)
      }
      await onSave({ word: cleaned, emoji: emoji.trim(), photoURL })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl p-4 shadow-sm space-y-3 border-2 border-quinn-teal/20 mb-4"
    >
      <h3 className="font-display text-lg text-gray-700">Add a Word</h3>

      {/* Photo */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => fileRef.current.click()}
          className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-transform flex-shrink-0"
        >
          {photoPreview ? (
            <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-gray-400">
              <div className="text-2xl">📷</div>
              <p className="text-xs font-body">Photo</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
        <p className="font-body text-xs text-gray-400">Optional photo (overrides emoji)</p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="font-body text-sm font-bold text-gray-600 block mb-1">Word</label>
          <input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 font-body focus:outline-none focus:border-quinn-teal lowercase"
            placeholder="cat"
            required
          />
        </div>
        <div className="w-24">
          <label className="font-body text-sm font-bold text-gray-600 block mb-1">Emoji</label>
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 font-body text-center text-xl focus:outline-none focus:border-quinn-teal"
            placeholder="🐱"
            required
          />
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
          className="flex-1 bg-quinn-teal text-white font-display text-lg py-3 rounded-xl disabled:opacity-50 active:scale-95"
        >
          {saving ? 'Saving...' : 'Add Word'}
        </button>
      </div>
    </form>
  )
}

export default function WordListManager() {
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const seededRef = useRef(false)

  useEffect(() => {
    const q = query(collection(db, 'wordList'))
    const unsub = onSnapshot(q, async (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setWords(list)
      setLoading(false)

      // Auto-seed on first open if empty
      if (list.length === 0 && !seededRef.current) {
        seededRef.current = true
        await seedStarterWords()
      }
    })
    return unsub
  }, [])

  const handleAdd = async ({ word, emoji, photoURL }) => {
    try {
      await addDoc(collection(db, 'wordList'), {
        word,
        emoji,
        photoURL,
        active: true,
        createdAt: serverTimestamp(),
      })
      toast.success(`"${word}" added!`)
      setShowForm(false)
    } catch (err) {
      toast.error('Failed to add word: ' + err.message)
    }
  }

  const toggleActive = async (w) => {
    try {
      await updateDoc(doc(db, 'wordList', w.id), { active: !w.active })
    } catch {
      toast.error('Failed to update')
    }
  }

  const handleDelete = async (w) => {
    try {
      await deleteDoc(doc(db, 'wordList', w.id))
      toast.success(`"${w.word}" deleted`)
      setConfirmDelete(null)
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20 text-4xl animate-bounce-slow">📚</div>
  }

  const active = words.filter((w) => w.active)
  const inactive = words.filter((w) => !w.active)

  return (
    <div className="p-4 pb-8">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-2xl text-gray-800">Word List</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-quinn-teal text-white font-body font-bold text-sm px-4 py-2 rounded-xl active:scale-95 transition-transform"
          >
            + Add Word
          </button>
        )}
      </div>
      <p className="font-body text-gray-400 text-sm mb-4">
        {active.length} active word{active.length !== 1 ? 's' : ''} in the game
      </p>

      {showForm && <WordForm onSave={handleAdd} onCancel={() => setShowForm(false)} />}

      <div className="space-y-2">
        {words.map((w) => (
          <div
            key={w.id}
            className={`bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm transition-opacity ${
              w.active ? '' : 'opacity-50'
            }`}
          >
            {/* Image or emoji */}
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
              {w.photoURL ? (
                <img src={w.photoURL} alt={w.word} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">{w.emoji}</span>
              )}
            </div>

            <div className="flex-1">
              <p className="font-display text-gray-800">{w.word}</p>
              <p className="font-body text-xs text-gray-400">{w.word.length} letters</p>
            </div>

            {/* Toggle active */}
            <button
              onClick={() => toggleActive(w)}
              className={`px-3 py-1 rounded-xl font-body text-xs font-bold transition-all active:scale-95 ${
                w.active
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {w.active ? 'On' : 'Off'}
            </button>

            {/* Delete */}
            {confirmDelete === w.id ? (
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="text-gray-400 font-body text-xs bg-gray-100 px-2 py-1 rounded-lg"
                >
                  Keep
                </button>
                <button
                  onClick={() => handleDelete(w)}
                  className="text-white font-body text-xs bg-red-400 px-2 py-1 rounded-lg"
                >
                  Del
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(w.id)}
                className="text-red-300 font-body text-xl leading-none active:scale-95 transition-transform"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
