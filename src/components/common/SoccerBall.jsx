// Matches CoinIcon's size names exactly so SoccerBall is a drop-in replacement
const SIZES = { xs: 16, sm: 20, md: 28, lg: 44, xl: 64, '2xl': 96 }

export default function SoccerBall({ size = 'md', className = '' }) {
  const px = SIZES[size] ?? 28
  return (
    <span
      className={`inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ fontSize: px * 0.9, lineHeight: 1, width: px, height: px }}
      aria-hidden="true"
    >
      ⚽
    </span>
  )
}
