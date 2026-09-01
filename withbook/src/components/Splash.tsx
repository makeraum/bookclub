'use client';

import Button from './ui/Button';
import { useApp } from '../context/AppContext';

export default function Splash() {
  const { setRoute } = useApp();

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-5 bg-surface animate-fade">
      {/* Logo */}
      <div className="w-16 h-16 rounded-[18px] bg-ink flex items-center justify-center mb-5">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path
            d="M6 6h8v20H6V6zm12 0h8v20h-8V6z"
            fill="white"
            opacity="0.9"
          />
          <path
            d="M14 8v16"
            stroke="#0066cc"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Title */}
      <h1
        className="text-[44px] font-semibold text-ink mb-6"
        style={{ letterSpacing: '-1px' }}
      >
        WithBook
      </h1>

      {/* Copy */}
      <p className="text-center text-sub text-[15px] leading-relaxed mb-12">
        책을 기록하고, 나누는 곳.
        <br />
        당신의 서재가 이야기가 되고,
        <br />
        이야기가 인연이 됩니다.
      </p>

      {/* CTA */}
      <div className="w-full max-w-sm">
        <Button onClick={() => setRoute('login')}>시작하기</Button>
      </div>
    </div>
  );
}
