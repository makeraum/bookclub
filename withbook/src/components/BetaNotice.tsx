'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'withbook_beta_notice_dismissed';

export default function BetaNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        setVisible(true);
      }
    } catch {
      // localStorage 접근 불가 시 무시
    }
  }, []);

  function handleDismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // 무시
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/50" />

      {/* 카드 */}
      <div className="relative mx-6 max-w-[340px] w-full bg-surface rounded-[20px] p-6 animate-fade">
        <div className="flex flex-col items-center text-center">
          {/* 로고 — 파비콘·앱 아이콘과 같은 마크 */}
          <img
            src="/logo/withbook-icon-192.png"
            alt="위드북"
            width={56}
            height={56}
            className="w-14 h-14 mb-4"
          />

          <h2
            className="text-[17px] font-semibold text-ink mb-2"
            style={{ letterSpacing: '-0.3px' }}
          >
            비공개 테스트에 오신 것을 환영합니다
          </h2>

          <p className="text-[14px] text-sub leading-[1.7] mb-6">
            지금은 비공개 테스트 기간이에요.<br />
            예시 데이터가 섞여 있으며,<br />
            서비스 완성 전 여러분의 의견을 듣고 있습니다.
          </p>

          <button
            onClick={handleDismiss}
            className="w-full py-3 rounded-full bg-action text-white text-[14px] font-semibold press-scale"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
