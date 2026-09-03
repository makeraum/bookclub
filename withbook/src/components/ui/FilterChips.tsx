'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/* ── 필터 그룹 라벨 ── */
export function FilterLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[12px] font-semibold mb-2" style={{ color: '#86868b' }}>
      {children}
    </p>
  );
}

/* ── 필터 그룹 구분선 ── */
export function FilterDivider() {
  return <div className="h-px my-4" style={{ backgroundColor: '#f5f5f7' }} />;
}

/* ── 필터 칩 ── */
/** md: 상위 칩 (14px / 8·16px), sm: 하위 칩 (13px / 6·12px) */
export function FilterChip({
  label,
  selected,
  onTap,
  size = 'md',
}: {
  label: string;
  selected: boolean;
  onTap: () => void;
  size?: 'md' | 'sm';
}) {
  const sizing =
    size === 'md'
      ? { fontSize: 14, padding: '8px 16px' }
      : { fontSize: 13, padding: '6px 12px' };

  return (
    <button
      type="button"
      onClick={onTap}
      aria-pressed={selected}
      className="press-scale focus-ring rounded-full font-semibold transition-colors duration-200 whitespace-nowrap"
      style={{
        ...sizing,
        lineHeight: 1.4,
        // 선택: 검정 배경 + 흰 텍스트, 보더 없음 (높이를 맞추려 투명 보더만 유지)
        backgroundColor: selected ? '#1d1d1f' : '#ffffff',
        color: selected ? '#ffffff' : '#1d1d1f',
        border: selected ? '1px solid transparent' : '1px solid #d2d2d7',
      }}
    >
      {label}
    </button>
  );
}

/* ── 가로 스크롤 칩 줄 ── */
/** 오른쪽에 잘리는 칩이 있으면 그라데이션 페이드로 더 있음을 알림 */
export function ChipRow({
  children,
  fadeColor = '#ffffff',
}: {
  children: ReactNode;
  fadeColor?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showFade, setShowFade] = useState(false);

  useEffect(() => {
    const scroller = scrollRef.current;
    const content = contentRef.current;
    if (!scroller || !content) return;

    // ResizeObserver가 관찰 즉시 한 번 호출되며 초기 측정까지 처리한다
    const measure = () => {
      setShowFade(scroller.scrollWidth - scroller.scrollLeft - scroller.clientWidth > 4);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(scroller);
    ro.observe(content);
    scroller.addEventListener('scroll', measure, { passive: true });

    return () => {
      ro.disconnect();
      scroller.removeEventListener('scroll', measure);
    };
  }, []);

  return (
    <div className="relative">
      <div ref={scrollRef} className="overflow-x-auto hide-scrollbar">
        <div ref={contentRef} className="flex gap-2 w-max">
          {children}
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 h-full transition-opacity duration-200"
        style={{
          width: 28,
          opacity: showFade ? 1 : 0,
          background: `linear-gradient(to right, ${fadeColor}00, ${fadeColor})`,
        }}
      />
    </div>
  );
}
