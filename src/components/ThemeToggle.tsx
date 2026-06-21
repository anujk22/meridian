interface ThemeToggleProps {
  theme: 'light' | 'dark'
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const dark = theme === 'dark'

  return (
    <button
      className={`theme-toggle${dark ? ' is-dark' : ''}`}
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
      aria-pressed={dark}
      title={`Switch to ${dark ? 'light' : 'dark'} mode`}
    >
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="3" />
        <path d="M10 2V4M10 16V18M2 10H4M16 10H18M4.3 4.3 5.7 5.7M14.3 14.3 15.7 15.7M15.7 4.3 14.3 5.7M5.7 14.3 4.3 15.7" />
      </svg>
      <span><i /></span>
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M15.8 13.2A6.5 6.5 0 0 1 6.8 4.2a6.5 6.5 0 1 0 9 9Z" />
      </svg>
    </button>
  )
}
