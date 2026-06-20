interface BrandMarkProps {
  compact?: boolean
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className={`brand-mark${compact ? ' brand-mark--compact' : ''}`} aria-label="Meridian">
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <path className="brand-mark__needle" d="M18 2 21 15 34 18 21 21 18 34 15 21 2 18 15 15 18 2Z" />
        <circle className="brand-mark__center" cx="18" cy="18" r="2.2" />
      </svg>
      <span>Meridian</span>
    </div>
  )
}
