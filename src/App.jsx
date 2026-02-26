import { Toaster } from 'react-hot-toast'
import { useAuth } from './contexts/AuthContext'
import { useApp } from './contexts/AppContext'
import Login from './components/auth/Login'
import KidHome from './components/kid/KidHome'
import ParentHome from './components/parent/ParentHome'
import CoinIcon from './components/common/CoinIcon'

function AppContent() {
  const { user } = useAuth()
  const { mode, loadingData } = useApp()

  if (!user) return <Login />

  if (loadingData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-quinn-blue">
        <CoinIcon size="xl" className="mb-4 animate-bounce-slow" />
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
