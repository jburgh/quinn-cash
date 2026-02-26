import { Toaster } from 'react-hot-toast'
import { useAuth } from './contexts/AuthContext'
import { useApp } from './contexts/AppContext'
import { useTheme } from './contexts/ThemeContext'
import Login from './components/auth/Login'
import KidHome from './components/kid/KidHome'
import ParentHome from './components/parent/ParentHome'

function AppContent() {
  const { user } = useAuth()
  const { mode, loadingData } = useApp()
  const { theme } = useTheme()
  const LoadingDeco = theme.LoadingDecoration

  if (!user) return <Login />

  if (loadingData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-quinn-blue">
        <div className="mb-4"><LoadingDeco /></div>
        <p className="font-display text-2xl text-white">Loading...</p>
      </div>
    )
  }

  if (mode === 'parent') return <ParentHome />
  return <KidHome />
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            borderRadius: '16px',
            fontSize: '15px',
          },
          duration: 3000,
        }}
      />
      <AppContent />
    </>
  )
}
