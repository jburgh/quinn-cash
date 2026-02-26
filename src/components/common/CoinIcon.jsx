/**
 * Gold dollar-coin icon. Replaces the 🪙 emoji throughout the app.
 * Use size prop: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 */
export default function CoinIcon({ size = 'md', className = '' }) {
  const dims = {
    xs: 'w-4 h-4 text-[9px]',
    sm: 'w-5 h-5 text-[11px]',
    md: 'w-7 h-7 text-sm',
    lg: 'w-11 h-11 text-xl',
    xl: 'w-16 h-16 text-3xl',
    '2xl': 'w-24 h-24 text-5xl',
  }
  return (
    <span
      className={`${dims[size] ?? dims.md} ${className} inline-flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-amber-500 text-amber-900 font-bold shadow border border-yellow-300 flex-shrink-0 select-none`}
      style={{ fontFamily: 'Georgia, serif', lineHeight: 1 }}
      aria-hidden="true"
    >
      $
    </span>
  )
}
