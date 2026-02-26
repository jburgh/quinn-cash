import { useTheme } from '../../contexts/ThemeContext'

export default function PrizeCard({ prize, balance, onTap }) {
  const { theme } = useTheme()
  const CurrencyIcon = theme.CurrencyIcon
  const canAfford = balance >= prize.price
  const diff = Math.abs(balance - prize.price)

  return (
    <button
      onClick={() => onTap(prize)}
      className={`bg-white rounded-3xl shadow-md overflow-hidden active:scale-95 transition-transform text-left w-full ${canAfford ? theme.affordableRing : ''}`}
    >
      {/* Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {prize.photoURL ? (
          <img
            src={prize.photoURL}
            alt={prize.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🎁</div>
        )}
        {prize.type === 'experience' && (
          <div className="absolute top-2 right-2 bg-quinn-teal text-white text-xs font-body font-bold px-2 py-0.5 rounded-full">
            {theme.experienceBadge}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-display text-gray-800 text-base leading-tight mb-1.5 line-clamp-2">
          {prize.name}
        </p>
        <div className="flex items-center gap-1.5 mb-1">
          <CurrencyIcon size="sm" />
          <span className="font-display text-quinn-orange text-xl">{prize.price}</span>
        </div>
        <p
          className={`font-body text-xs font-bold ${
            canAfford ? 'text-green-500' : 'text-red-400'
          }`}
        >
          {canAfford
            ? diff === 0
              ? 'Exact! 🎯'
              : `$${diff} left after`
            : `Need $${diff} more`}
        </p>
      </div>
    </button>
  )
}
