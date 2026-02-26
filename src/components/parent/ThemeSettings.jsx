import { useTheme } from '../../contexts/ThemeContext'

const THEME_OPTIONS = [
  { id: 'classic', emoji: '🚀', name: 'Classic' },
  { id: 'soccer', emoji: '⚽', name: 'Soccer' },
]

export default function ThemeSettings() {
  const { themeId, setTheme } = useTheme()

  return (
    <div className="p-6">
      <h2 className="font-display text-2xl text-gray-800 mb-1">App Theme</h2>
      <p className="font-body text-gray-400 text-sm mb-6">Changes how the app looks for Quinn</p>

      <div className="grid grid-cols-2 gap-3">
        {THEME_OPTIONS.map(({ id, emoji, name }) => (
          <button
            key={id}
            onClick={() => setTheme(id)}
            className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all active:scale-95 ${
              themeId === id
                ? 'border-quinn-blue bg-blue-50 shadow-lg shadow-blue-100'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span className="text-5xl">{emoji}</span>
            <span
              className={`font-display text-lg ${
                themeId === id ? 'text-quinn-blue' : 'text-gray-600'
              }`}
            >
              {name}
            </span>
            {themeId === id && (
              <span className="bg-quinn-blue text-white text-xs font-body font-bold px-3 py-1 rounded-full">
                Active
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
