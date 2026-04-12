import { useState, useEffect } from 'react';
import { useLiveSession } from '../../context/LiveSessionContext';
import { useLang } from '../../context/LanguageContext';

function useCountdown(targetDate) {
  const [diff, setDiff] = useState(null);
  useEffect(() => {
    if (!targetDate) return;
    const tick = () => setDiff(new Date(targetDate) - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return diff;
}

export default function UpNextSidebar() {
  const { upNext, loading } = useLiveSession();
  const { t } = useLang();
  const diff = useCountdown(upNext?.startsAt);

  if (loading) return <div className="rounded-3xl bg-surface-container-high p-6 animate-pulse h-40" />;
  if (!upNext?.title) return null;

  const title = upNext.title;

  const formatCountdown = () => {
    if (diff == null) return '';
    if (diff <= 0) return t('live.startingSoon');
    const totalSec = Math.floor(diff / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}${t('common.min')} ${s.toString().padStart(2, '0')}${t('common.sec')}`;
  };

  return (
    <div className="rounded-3xl bg-surface-container-high p-6 shadow-card">
      <p className="text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant mb-4">{t('live.upNext')}</p>

      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center">
          <span className="material-icon text-on-surface-variant">arrow_forward</span>
        </div>
        <div className="min-w-0">
          <h3 className="font-headline font-bold text-base text-on-surface leading-snug mb-1">{title}</h3>
          <p className="text-sm text-on-surface-variant">{upNext.speakerOrTeam}</p>
        </div>
      </div>

      {diff != null && (
        <div className="mt-4 pt-4 border-t border-outline-variant/30">
          <p className="text-xs font-label text-on-surface-variant mb-1">{t('live.starting')}</p>
          <p className="font-headline font-bold text-2xl text-primary tabular-nums">{formatCountdown()}</p>
        </div>
      )}
    </div>
  );
}
