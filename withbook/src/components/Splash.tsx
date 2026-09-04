'use client';

import Button from './ui/Button';
import { useApp } from '../context/AppContext';

export default function Splash() {
  const { setRoute } = useApp();

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-5 bg-surface animate-fade">
      {/* Logo — 파비콘·앱 아이콘과 같은 마크 */}
      <img
        src="/logo/withbook-icon-256.png"
        alt="위드북"
        width={64}
        height={64}
        className="w-16 h-16 mb-5"
      />

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
