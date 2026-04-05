export default function RubricBar({ score }) {
  const pct = score != null ? (score / 10) * 100 : 0;
  const color = score == null ? 'bg-outline-variant'
              : score >= 8   ? 'bg-secondary'
              : score >= 5   ? 'bg-primary'
              : 'bg-tertiary';

  return (
    <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
