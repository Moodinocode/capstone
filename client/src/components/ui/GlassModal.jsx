import { useEffect } from 'react';

export default function GlassModal({ open, onClose, title, children }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass rounded-3xl p-6 w-full max-w-md animate-fade-in">
        {title && (
          <h3 className="font-headline font-bold text-xl text-on-surface mb-4">{title}</h3>
        )}
        {children}
      </div>
    </div>
  );
}
