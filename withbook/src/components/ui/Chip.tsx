'use client';

interface ChipProps {
  label: string;
  selected: boolean;
  variant?: 'genre' | 'author' | 'badge';
  onClick: () => void;
}

export default function Chip({ label, selected, variant = 'genre', onClick }: ChipProps) {
  const base = 'press-scale px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 border whitespace-nowrap';

  const styles = {
    genre: selected
      ? 'bg-ink text-white border-ink'
      : 'bg-transparent text-ink border-chip-border',
    author: selected
      ? 'bg-action text-white border-action'
      : 'bg-transparent text-ink border-chip-border',
    badge: selected
      ? 'bg-ink text-white border-ink'
      : 'bg-transparent text-ink border-chip-border',
  };

  return (
    <button onClick={onClick} className={`${base} ${styles[variant]}`}>
      {label}
    </button>
  );
}
