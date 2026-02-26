import SoccerBall from '../components/common/SoccerBall'
import { playGoal } from '../utils/sounds'

function SoccerCurrencyIcon({ size = 'md', className = '' }) {
  return <SoccerBall size={size} className={className} />
}

function SoccerLoginDecoration() {
  return <SoccerBall size="xl" className="mb-4 animate-spin-ball" />
}

function SoccerLoadingDecoration() {
  return <SoccerBall size="xl" className="animate-spin-ball" />
}


function SoccerSessionDecoration() {
  return (
    <div className="flex justify-center mb-3">
      <svg width="130" height="45" viewBox="0 0 130 45" aria-hidden="true" className="opacity-60">
        {/* Cross bar */}
        <rect x="5" y="4" width="120" height="7" rx="3.5" fill="#6B7280" />
        {/* Left post */}
        <rect x="5" y="4" width="7" height="41" rx="3.5" fill="#6B7280" />
        {/* Right post */}
        <rect x="118" y="4" width="7" height="41" rx="3.5" fill="#6B7280" />
        {/* Vertical net lines */}
        <line x1="25" y1="11" x2="25" y2="45" stroke="#9CA3AF" strokeWidth="1" />
        <line x1="45" y1="11" x2="45" y2="45" stroke="#9CA3AF" strokeWidth="1" />
        <line x1="65" y1="11" x2="65" y2="45" stroke="#9CA3AF" strokeWidth="1" />
        <line x1="85" y1="11" x2="85" y2="45" stroke="#9CA3AF" strokeWidth="1" />
        <line x1="105" y1="11" x2="105" y2="45" stroke="#9CA3AF" strokeWidth="1" />
        {/* Horizontal net lines */}
        <line x1="12" y1="20" x2="118" y2="20" stroke="#9CA3AF" strokeWidth="1" />
        <line x1="12" y1="30" x2="118" y2="30" stroke="#9CA3AF" strokeWidth="1" />
        <line x1="12" y1="40" x2="118" y2="40" stroke="#9CA3AF" strokeWidth="1" />
      </svg>
    </div>
  )
}

export const soccerTheme = {
  id: 'soccer',

  // Labels
  loginTagline: "Quinn's reward game!",
  loginButton: 'Kick Off! ⚽',
  balanceLabel: 'SCORE',
  storeTab: '⚽ Shop',
  trophyTab: '🏆 Trophy Case',
  bankLabel: 'SCORE! 🎉',
  celebrationTitle: 'GOAL!',
  celebrationEmoji: '⚽',
  requestLabel: 'I want this! ⚽',
  cantAffordLabel: 'Keep training! 💪',
  experienceBadge: '⚽ Again!',

  // Styles
  affordableRing: 'ring-2 ring-green-400 shadow-green-300 shadow-lg',
  headerBg: 'bg-gradient-to-br from-green-700 to-green-800',
  pageBg: 'soccer-field-bg',
  tabActive: 'bg-green-50 text-green-700',
  tabInactive: 'text-green-200 hover:text-white',
  balanceLabelClass: 'font-body text-green-200 text-xs font-bold tracking-widest uppercase',
  coinActiveClass: 'animate-spin-ball',

  // Visual
  confettiColors: ['#2563EB', '#F97316', '#0D9488', '#FCD34D', '#EC4899', '#16A34A'],
  CurrencyIcon: SoccerCurrencyIcon,
  LoginDecoration: SoccerLoginDecoration,
  LoadingDecoration: SoccerLoadingDecoration,
  HeaderDecoration: null,
  SessionDecoration: SoccerSessionDecoration,

  // Sound
  bankSound: playGoal,
}
