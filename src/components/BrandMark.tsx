interface BrandMarkProps {
  compact?: boolean
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className={`brand-mark${compact ? ' brand-mark--compact' : ''}`} aria-label="Meridian">
      <span className="brand-mark__orb" aria-hidden="true">M</span>
      <span>Meridian</span>
    </div>
  )
}
