export default function RubricBar({ score }) {
  const pct = score != null ? (score / 5) * 100 : 0;
  const color = score == null ? 'bg-outline-variant'
              : score >= 4   ? 'bg-secondary'
              : score >= 3   ? 'bg-on-surface'
              : 'bg-tertiary';

  return (
    <div className="w-full h-1.5 rounded-full bg-surface-container border border-outline-variant overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
