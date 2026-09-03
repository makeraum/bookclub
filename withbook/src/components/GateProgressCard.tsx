'use client';

import { useApp } from '../context/AppContext';
import type { GateLevel } from '../lib/types';

/**
 * 밑줄 진행 카드 ("서재지기 밑줄 1/30").
 * 홈 피드에 있던 것을 마이 탭 상단으로 옮겼습니다 — 남의 밑줄을 읽는 자리가 아니라
 * 내 기록을 확인하는 자리에 있어야 하는 카드입니다.
 */
export default function GateProgressCard() {
  const { gateLevel, highlightStats, gates } = useApp();
  return (
    <GateProgressCardView
      gateLevel={gateLevel}
      totalCount={highlightStats.totalCount}
      bookCount={highlightStats.bookCount}
      gate1At={gates.gate1At}
    />
  );
}

/* ── 게이트 진행 카드 — 내 기록이므로 마이 탭에 둡니다 ── */

const GATE_LEVEL_LABEL: Record<GateLevel, string> = {
  reader: '독자',
  recorder: '기록자',
  librarian: '서재지기',
};

function GateProgressCardView({
  gateLevel,
  totalCount,
  bookCount,
  gate1At,
}: {
  gateLevel: GateLevel;
  totalCount: number;
  bookCount: number;
  gate1At: string | null;
}) {
  const threshold = 30;
  const progress = Math.min(totalCount / threshold, 1);

  // Gate 1 이미 달성
  if (gate1At) {
    return (
      <div className="px-5 mb-4">
        <div className="bg-surface rounded-[18px] border border-border p-4 flex items-center gap-3">
          <div className="w-[36px] h-[36px] rounded-full bg-action/10 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <path d="M16 4L20 12L28 13.5L22 19.5L23.5 28L16 24L8.5 28L10 19.5L4 13.5L12 12L16 4Z" fill="#0066cc" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-ink">기록자</span>
              <span className="px-2 py-0.5 bg-action/10 text-action text-[10.5px] font-semibold rounded-full">달성</span>
            </div>
            <p className="text-[12px] text-sub mt-0.5">
              {bookCount}권에서 {totalCount}개의 밑줄
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Gate 1 미달성: 프로그레스 바
  return (
    <div className="px-5 mb-4">
      <div className="bg-surface rounded-[18px] border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-ink text-white text-[10.5px] font-semibold rounded-full">
              {GATE_LEVEL_LABEL[gateLevel]}
            </span>
            <span className="text-[13px] font-semibold text-ink">
              밑줄 {totalCount}/{threshold}
            </span>
          </div>
          <span className="text-[12px] text-sub">{bookCount}권에서</span>
        </div>
        <div className="w-full h-[6px] bg-canvas rounded-full overflow-hidden">
          <div
            className="h-full bg-action rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="text-[12px] text-sub mt-2">
          기록이 쌓이고 있어요
        </p>
      </div>
    </div>
  );
}
