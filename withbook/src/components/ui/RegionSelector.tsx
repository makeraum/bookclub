'use client';

import { PROVINCES, findProvince, type ProvinceId, type District, type RegionSelection } from '../../lib/regions';

/**
 * 지역 선택 — 1단(시·도) → 2단(세부 지역) 2단 구조.
 * 참가 탭 필터와 모임 생성 폼이 같은 컴포넌트를 씁니다.
 *
 * allowAll=true  → 1단에 "전체" 칩 노출 (필터용)
 * allowAll=false → 시·도를 반드시 하나 고름 (생성 폼용)
 */
export default function RegionSelector({
  value,
  onChange,
  allowAll = true,
}: {
  value: RegionSelection;
  onChange: (next: RegionSelection) => void;
  allowAll?: boolean;
}) {
  const province = findProvince(value.province);
  const open = province !== null;

  function selectProvince(id: ProvinceId | null) {
    if (id === value.province) return;
    onChange({ province: id, district: null });
  }

  function selectDistrict(district: District | null) {
    onChange({ province: value.province, district });
  }

  return (
    <div>
      {/* 1단: 시·도 */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {allowAll && (
          <RegionChip
            label="전체"
            selected={value.province === null}
            onTap={() => selectProvince(null)}
          />
        )}
        {PROVINCES.map(p => (
          <RegionChip
            key={p.id}
            label={p.label}
            selected={value.province === p.id}
            onTap={() => selectProvince(p.id)}
          />
        ))}
      </div>

      {/* 2단: 세부 지역 — 시·도를 고르면 부드럽게 펼쳐짐 */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{
          maxHeight: open ? 52 : 0,
          opacity: open ? 1 : 0,
        }}
        aria-hidden={!open}
      >
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pt-2 pb-1">
          <RegionChip
            label="전체"
            selected={value.district === null}
            onTap={() => selectDistrict(null)}
          />
          {(province?.districts ?? []).map(d => (
            <RegionChip
              key={d}
              label={d}
              selected={value.district === d}
              onTap={() => selectDistrict(d)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 지역 칩 (기존 필터 칩과 동일한 토큰) ── */
function RegionChip({
  label,
  selected,
  onTap,
}: {
  label: string;
  selected: boolean;
  onTap: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onTap}
      className={`press-scale px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 border whitespace-nowrap ${
        selected ? 'text-white border-transparent' : 'bg-white text-ink'
      }`}
      style={
        selected
          ? { backgroundColor: '#1d1d1f', borderColor: '#1d1d1f' }
          : { borderColor: '#d2d2d7' }
      }
    >
      {label}
    </button>
  );
}
