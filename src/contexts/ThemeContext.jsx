import { createContext, useContext, useEffect, useState } from 'react'
import { db } from '../firebase/config'
import { doc, updateDoc } from 'firebase/firestore'
import { useAuth } from './AuthContext'
import { useApp } from './AppContext'
import { THEMES } from '../themes'

const ThemeContext = createContext()

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }) {
  const { user } = useAuth()
  const { userData } = useApp()
  const [themeId, setThemeId] = useState('classic')

  // Sync theme from Firestore userData
  useEffect(() => {
    if (userData?.theme && THEMES[userData.theme]) {
      setThemeId(userData.theme)
    }
  }, [userData?.theme])

  const setTheme = async (id) => {
    if (!THEMES[id]) return
    setThemeId(id)
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid)
        await updateDoc(userRef, { theme: id })
      } catch {
        // ignore
      }
    }
  }

  const theme = THEMES[themeId] ?? THEMES.classic

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
