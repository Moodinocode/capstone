import { useLang } from '../../context/LanguageContext';

export default function AutoSaveIndicator({ saveStatus, lastSavedAt }) {
  const { t } = useLang();

  const map = {
    idle:    { icon: 'cloud_done',  text: '',                      color: 'text-on-surface-variant' },
    saving:  { icon: 'sync',        text: t('grade.saving'),        color: 'text-on-surface-variant animate-spin' },
    saved:   {
      icon: 'cloud_done',
      text: lastSavedAt
        ? `${t('grade.saved')} ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : t('grade.saved'),
      color: 'text-primary',
    },
    error:   { icon: 'cloud_off',   text: t('grade.saveError'),     color: 'text-error' },
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
