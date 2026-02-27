import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { auth } from '../firebase/config'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  // undefined = initial state (not yet received first auth event)
  const prevUserRef = useRef(undefined)
  // Prevents the "session expired" toast from firing on intentional sign-outs
  const intentionalLogoutRef = useRef(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      const wasLoggedIn = prevUserRef.current !== undefined && prevUserRef.current !== null
      if (wasLoggedIn && !u && !intentionalLogoutRef.current) {
        toast.error('Session expired — please sign in again.', {
          id: 'session-expired',
          duration: Infinity,
        })
      }
      intentionalLogoutRef.current = false
      prevUserRef.current = u
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const login = (email, password) => {
    toast.dismiss('session-expired')
    return signInWithEmailAndPassword(auth, email, password)
  }

  const logout = () => {
    intentionalLogoutRef.current = true
    return signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
