'use client';

import { useApp } from '../context/AppContext';

/**
 * 밑줄 진행 표시 ("밑줄 4/30").
 * 예전에는 카드 하나를 통째로 차지했지만, 마이 탭 프로필 카드 안의
 * 얇은 한 줄로 흡수했습니다 — 프로필과 같은 "나"의 정보라서 따로 둘 이유가 없습니다.
 */
export default function GateProgressLine() {
  const { highlightStats, gates } = useApp();
  const { totalCount, bookCount } = highlightStats;
  const threshold = 30;

  // Gate 1 달성 — 진행바 대신 달성 표시
  if (gates.gate1At) {
    return (
      <div className="flex items-center gap-2">
        <svg width="13" height="13" viewBox="0 0 32 32" fill="none" className="flex-shrink-0">
          <path d="M16 4L20 12L28 13.5L22 19.5L23.5 28L16 24L8.5 28L10 19.5L4 13.5L12 12L16 4Z" fill="#0066cc" />
        </svg>
        <span className="text-[12px] text-sub">
          기록자 달성 · {bookCount}권에서 밑줄 {totalCount}개
        </span>
      </div>
    );
  }

  // Gate 1 미달성 — 얇은 진행바 + 수치 한 줄
  const progress = Math.min(totalCount / threshold, 1);
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-[4px] bg-canvas rounded-full overflow-hidden">
        <div
          className="h-full bg-action rounded-full transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <span className="text-[12px] text-sub flex-shrink-0 tabular-nums">
        밑줄 {totalCount}/{threshold}
        {bookCount > 0 && ` · ${bookCount}권`}
      </span>
    </div>
  );
}
