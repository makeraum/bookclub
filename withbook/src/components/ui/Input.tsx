'use client';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'search' | 'password';
  multiline?: boolean;
  rows?: number;
  className?: string;
}

export default function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline = false,
  rows = 3,
  className = '',
}: InputProps) {
  const base = `w-full px-4 py-3 rounded-[11px] border border-border bg-surface text-ink text-[14px]
    placeholder:text-inactive outline-none transition-colors duration-200
    focus:border-action ${className}`;

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`${base} resize-none`}
      />
    );
  }

  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={base}
    />
  );
}
