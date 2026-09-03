'use client';

import { useEffect, useRef, useState } from 'react';
import { PROVINCES, findProvince, type ProvinceId, type District, type RegionSelection } from '../../lib/regions';
import { ChipRow, FilterChip, FilterLabel } from './FilterChips';

/**
 * 지역 선택 — 1단(시·도) → 2단(세부 지역) 2단 구조.
 * 참가 탭 필터와 모임 생성 폼이 같은 컴포넌트를 씁니다.
 *
 * 층위 표현: 2단은 별도 라벨 없이 왼쪽 12px 들여쓰기 + #f5f5f7 트레이 + 한 단계 작은 칩.
 *
 * allowAll=true  → 1단에 "전체" 칩 노출 (필터용)
 * allowAll=false → 시·도를 반드시 하나 고름 (생성 폼용)
 */
export default function RegionSelector({
  value,
  onChange,
  allowAll = true,
  label = '지역',
}: {
  value: RegionSelection;
  onChange: (next: RegionSelection) => void;
  allowAll?: boolean;
  label?: string;
}) {
  const province = findProvince(value.province);
  const open = province !== null;

  // 트레이 실제 높이를 재서 max-height 트랜지션에 씀 (빈 여백 없이 정확히 접힘)
  const trayRef = useRef<HTMLDivElement>(null);
  const [trayHeight, setTrayHeight] = useState(0);

  useEffect(() => {
    const el = trayRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTrayHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function selectProvince(id: ProvinceId | null) {
    if (id === value.province) return;
    onChange({ province: id, district: null });
  }

  function selectDistrict(district: District | null) {
    onChange({ province: value.province, district });
  }

  return (
    <div>
      {label && <FilterLabel>{label}</FilterLabel>}

      {/* 1단: 시·도 */}
      <ChipRow>
        {allowAll && (
          <FilterChip
            label="전체"
            selected={value.province === null}
            onTap={() => selectProvince(null)}
          />
        )}
        {PROVINCES.map(p => (
          <FilterChip
            key={p.id}
            label={p.label}
            selected={value.province === p.id}
            onTap={() => selectProvince(p.id)}
          />
        ))}
      </ChipRow>

      {/* 2단: 세부 지역 — 시·도의 하위임을 들여쓰기 + 트레이로 표현 */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ maxHeight: open ? trayHeight : 0, opacity: open ? 1 : 0 }}
        aria-hidden={!open}
      >
        <div ref={trayRef} className="pt-2 pl-3">
          <div className="rounded-[12px] px-2.5 py-2" style={{ backgroundColor: '#f5f5f7' }}>
            <ChipRow fadeColor="#f5f5f7">
              <FilterChip
                label="전체"
                selected={value.district === null}
                onTap={() => selectDistrict(null)}
                size="sm"
              />
              {(province?.districts ?? []).map(d => (
                <FilterChip
                  key={d}
                  label={d}
                  selected={value.district === d}
                  onTap={() => selectDistrict(d)}
                  size="sm"
                />
              ))}
            </ChipRow>
          </div>
        </div>
      </div>
    </div>
  );
}
