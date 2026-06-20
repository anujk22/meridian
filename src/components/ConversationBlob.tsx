export function ConversationBlob({ speaker }: { speaker: string }) {
  return (
    <div className="conversation-kernel" aria-hidden="true">
      <div className="conversation-kernel__blob">
        <i />
        <i />
        <i />
      </div>
      <strong>Cross-examination</strong>
      <span>{speaker} is routing a challenge</span>
    </div>
  )
}
