import CoinIcon from '../components/common/CoinIcon'
import { playBankIt } from '../utils/sounds'

function ClassicCurrencyIcon({ size = 'md', className = '' }) {
  return <CoinIcon size={size} className={className} />
}

function ClassicLoginDecoration() {
  return <CoinIcon size="xl" className="mb-4" />
}

function ClassicLoadingDecoration() {
  return <CoinIcon size="xl" className="animate-bounce-slow" />
}

export const classicTheme = {
  id: 'classic',

  // Labels
  loginTagline: 'Your family reward store',
  loginButton: "Let's Go! 🚀",
  balanceLabel: "Quinn's Balance",
  storeTab: '🛒 Store',
  trophyTab: '🏆 Trophy Case',
  bankLabel: 'Bank It! 🎉',
  celebrationTitle: 'Session Banked!',
  celebrationEmoji: '🎉',
  requestLabel: 'I want this! 🙋',
  cantAffordLabel: 'Keep saving! 💪',
  experienceBadge: '✨ Again!',

  // Styles
  affordableRing: '',
  headerBg: 'bg-quinn-blue',
  pageBg: 'bg-gradient-to-b from-blue-50 to-white',
  tabActive: 'bg-blue-50 text-quinn-blue',
  tabInactive: 'text-blue-200 hover:text-white',
  balanceLabelClass: 'font-body text-blue-200 text-sm',
  coinActiveClass: 'animate-wiggle-loop',

  // Visual
  confettiColors: ['#2563EB', '#F97316', '#0D9488', '#FCD34D', '#EC4899'],
  CurrencyIcon: ClassicCurrencyIcon,
  LoginDecoration: ClassicLoginDecoration,
  LoadingDecoration: ClassicLoadingDecoration,
  HeaderDecoration: null,
  SessionDecoration: null,

  // Sound
  bankSound: playBankIt,
}
