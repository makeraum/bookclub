'use client';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'kakao' | 'dark' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'full';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'full',
  onClick,
  disabled = false,
  className = '',
}: ButtonProps) {
  const base = 'press-scale font-semibold transition-all duration-200 flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-action text-white',
    outline: 'bg-transparent border border-border text-ink',
    kakao: 'bg-kakao text-ink',
    dark: 'bg-ink text-white',
    ghost: 'bg-transparent text-action',
  };

  const sizes = {
    sm: 'px-4 py-2 text-[13px] rounded-full',
    md: 'px-5 py-2.5 text-[14px] rounded-full',
    lg: 'px-6 py-3.5 text-[15px] rounded-full',
    full: 'w-full py-3.5 text-[15px] rounded-full',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${
        disabled ? 'opacity-40 pointer-events-none' : ''
      } ${className}`}
    >
      {children}
    </button>
  );
}
