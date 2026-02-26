import { createContext, useContext, useEffect, useState } from 'react'
import { db } from '../firebase/config'
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from './AuthContext'

const AppContext = createContext()

export function useApp() {
  return useContext(AppContext)
}

export function AppProvider({ children }) {
  const { user } = useAuth()
  const [mode, setMode] = useState('kid')
  const [userData, setUserData] = useState(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!user) {
      setUserData(null)
      setLoadingData(false)
      setMode('kid')
      return
    }

    const userRef = doc(db, 'users', user.uid)
    const unsubscribe = onSnapshot(userRef, async (snap) => {
      if (snap.exists()) {
        setUserData(snap.data())
      } else {
        const newUser = {
          balance: 0,
          pin: null,
          createdAt: serverTimestamp(),
        }
        await setDoc(userRef, newUser)
        setUserData(newUser)
      }
      setLoadingData(false)
    })

    return unsubscribe
  }, [user])

  // Returns true if PIN matches, false otherwise
  const switchToParent = (enteredPin) => {
    if (userData?.pin === enteredPin) {
      setMode('parent')
      return true
    }
    return false
  }

  // Used after PIN setup — we already know the PIN is correct
  const switchToParentDirect = () => setMode('parent')

  const switchToKid = () => setMode('kid')

  const setupPin = async (pin) => {
    const userRef = doc(db, 'users', user.uid)
    await updateDoc(userRef, { pin })
  }

  return (
    <AppContext.Provider
      value={{
        mode,
        userData,
        loadingData,
        balance: userData?.balance ?? 0,
        switchToParent,
        switchToParentDirect,
        switchToKid,
        setupPin,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
