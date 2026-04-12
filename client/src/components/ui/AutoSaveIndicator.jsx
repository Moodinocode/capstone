export default function AutoSaveIndicator({ saveStatus, lastSavedAt }) {
  const map = {
    idle:   { icon: 'cloud_done',  text: '',          color: 'text-on-surface-variant' },
    saving: { icon: 'sync',        text: 'Saving...',  color: 'text-on-surface-variant' },
    saved:  {
      icon: 'cloud_done',
      text: lastSavedAt
        ? `Saved at ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : 'Saved',
      color: 'text-primary',
    },
    error:  { icon: 'cloud_off',   text: 'Save failed', color: 'text-error' },
  };

  const { icon, text, color } = map[saveStatus] ?? map.idle;
  if (!text) return null;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-label ${color}`}>
      <span className={`material-icon text-sm ${saveStatus === 'saving' ? 'animate-spin' : ''}`}>{icon}</span>
      {text}
    </span>
  );
}
