const config = {
  not_started: {
    bg:   'bg-surface-container border border-outline-variant',
    text: 'text-on-surface-variant',
    icon: 'radio_button_unchecked',
    label: 'Not Started',
  },
  in_progress: {
    bg:   'bg-surface-container border border-outline',
    text: 'text-on-surface',
    icon: 'pending',
    label: 'In Progress',
  },
  submitted: {
    bg:   'bg-secondary/15 border border-secondary/30',
    text: 'text-secondary',
    icon: 'check_circle',
    label: 'Submitted',
  },
};

export default function StatusBadge({ status }) {
  const { bg, text, icon, label } = config[status] ?? config.not_started;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-label font-semibold tracking-wide uppercase ${bg} ${text}`}>
      <span className="material-icon text-sm">{icon}</span>
      {label}
    </span>
  );
}
