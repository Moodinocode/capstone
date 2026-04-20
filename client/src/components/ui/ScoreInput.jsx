export default function ScoreInput({ value, onChange, disabled }) {
  const handleChange = (e) => {
    const v = e.target.value;
    if (v === '') { onChange(null); return; }
    const num = Math.min(5, Math.max(0, Number(v)));
    onChange(num);
  };

  return (
    <div className="relative">
      <input
        type="number"
        min={0}
        max={5}
        value={value ?? ''}
        onChange={handleChange}
        disabled={disabled}
        placeholder="—"
        className={`w-16 h-16 text-2xl font-headline font-bold text-center rounded-xl
          bg-surface-container text-on-surface placeholder-outline border border-outline-variant
          focus:outline-none focus:ring-2 focus:ring-on-surface transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed`}
      />
      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-label text-on-surface-variant whitespace-nowrap">
        / 5
      </span>
    </div>
  );
}
