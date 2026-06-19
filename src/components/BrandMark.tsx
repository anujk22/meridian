interface BrandMarkProps {
  compact?: boolean
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className={`brand-mark${compact ? ' brand-mark--compact' : ''}`} aria-label="Meridian">
      <svg viewBox="0 0 48 48" role="img" aria-hidden="true">
        <circle cx="24" cy="24" r="18.5" />
        <path d="M24 4.5v39M10.5 24h27" />
        <path className="brand-mark__needle" d="m24 10 4.2 14L24 38l-4.2-14L24 10Z" />
        <circle className="brand-mark__center" cx="24" cy="24" r="2.8" />
      </svg>
      <span>Meridian</span>
    </div>
  )
}
