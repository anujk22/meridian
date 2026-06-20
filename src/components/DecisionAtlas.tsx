export function DecisionAtlas({ active = false, label = 'Decision meridian', className = '' }: { active?: boolean; label?: string; className?: string }) {
  return (
    <div className={`decision-axis${active ? ' is-synthesizing' : ''} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 240 240">
        <circle cx="120" cy="120" r="86" />
        <ellipse cx="120" cy="120" rx="86" ry="34" />
        <ellipse cx="120" cy="120" rx="36" ry="86" />
        <path d="M34 120h172M120 34v172" />
        <path d="M120 18 130 108 222 120 130 132 120 222 110 132 18 120 110 108Z" className="decision-axis__needle" />
        <circle cx="120" cy="120" r="7" className="decision-axis__center" />
      </svg>
      <span>{label}</span>
    </div>
  )
}
