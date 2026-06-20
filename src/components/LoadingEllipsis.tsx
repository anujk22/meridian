export function LoadingEllipsis({ label = 'Generating' }: { label?: string }) {
  return (
    <span className="loading-ellipsis" role="status" aria-label={label}>
      <span aria-hidden="true">.</span>
      <span aria-hidden="true">.</span>
      <span aria-hidden="true">.</span>
    </span>
  )
}
