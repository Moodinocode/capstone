import { useLang } from '../../context/LanguageContext';

const config = {
  not_started: {
    bg:   'bg-surface-container border border-outline-variant',
    text: 'text-on-surface-variant',
    icon: 'radio_button_unchecked',
  },
  in_progress: {
    bg:   'bg-surface-container border border-outline',
    text: 'text-on-surface',
    icon: 'pending',
  },
  submitted: {
    bg:   'bg-secondary/15 border border-secondary/30',
    text: 'text-secondary',
    icon: 'check_circle',
  },
};

export default function StatusBadge({ status }) {
  const { t } = useLang();
  const { bg, text, icon } = config[status] ?? config.not_started;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-label font-semibold tracking-wide uppercase ${bg} ${text}`}>
      <span className="material-icon text-sm">{icon}</span>
      {t(`status.${status}`)}
    </span>
  );
}
