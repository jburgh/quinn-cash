export default function EmptyState({ emoji, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-7xl mb-4 animate-bounce-slow">{emoji}</div>
      <h3 className="font-display text-xl text-gray-500 mb-2">{title}</h3>
      {subtitle && <p className="font-body text-gray-400 text-sm max-w-xs">{subtitle}</p>}
    </div>
  )
}
