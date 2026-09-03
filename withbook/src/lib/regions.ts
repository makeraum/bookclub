/**
 * 지역 데이터 — 대분류(시·도) → 소분류(세부 지역) 2단 구조.
 *
 * 지역을 추가할 때는 이 파일만 수정하면 됩니다.
 * - 새 시·도: PROVINCES 배열에 { id, label, districts } 추가
 * - 새 세부 지역: 해당 시·도의 districts 배열에 문자열 추가
 * 배열 순서가 곧 칩이 노출되는 순서입니다.
 */

export const PROVINCES = [
  {
    id: 'seoul',
    label: '서울',
    districts: ['강남·서초', '마포·서대문', '종로·중구', '성동·광진', '송파·강동', '영등포·여의도'],
  },
  {
    id: 'gyeonggi',
    label: '경기',
    districts: ['성남·분당', '수원', '용인', '안양·평촌', '하남', '평택', '고양·일산', '부천'],
  },
  {
    id: 'incheon',
    label: '인천',
    districts: ['송도', '구월동'],
  },
  {
    id: 'chungnam',
    label: '충남',
    districts: ['천안 서북구', '천안 동남구', '아산', '당진'],
  },
  {
    id: 'daejeon',
    label: '대전',
    districts: ['둔산', '유성'],
  },
  {
    id: 'sejong',
    label: '세종',
    districts: ['세종'],
  },
  {
    id: 'chungbuk',
    label: '충북',
    districts: ['청주'],
  },
  {
    id: 'busan',
    label: '부산',
    districts: ['서면', '해운대'],
  },
  {
    id: 'daegu',
    label: '대구',
    districts: ['동성로'],
  },
] as const;

export type ProvinceId = (typeof PROVINCES)[number]['id'];
export type ProvinceLabel = (typeof PROVINCES)[number]['label'];
export type District = (typeof PROVINCES)[number]['districts'][number];

/** 전체 세부 지역 (평탄화) */
export const DISTRICTS: District[] = PROVINCES.flatMap(p => [...p.districts]);

/** 지역 선택 상태 — province가 null이면 전체, district가 null이면 시·도 전체 */
export interface RegionSelection {
  province: ProvinceId | null;
  district: District | null;
}

export const ALL_REGIONS: RegionSelection = { province: null, district: null };

export function findProvince(id: ProvinceId | null) {
  if (!id) return null;
  return PROVINCES.find(p => p.id === id) ?? null;
}

/** 세부 지역이 속한 시·도 id */
export function provinceOfDistrict(district: string): ProvinceId | null {
  const found = PROVINCES.find(p => (p.districts as readonly string[]).includes(district));
  return found?.id ?? null;
}

/** 선택 상태를 사람이 읽는 라벨로 (예: "서울 전체", "강남·서초") */
export function regionSelectionLabel(sel: RegionSelection): string {
  if (!sel.province) return '전체';
  if (sel.district) return sel.district;
  return `${findProvince(sel.province)?.label ?? ''} 전체`;
}

/** 필터 요약용 조각 (예: ['경기', '수원'] / ['전체 지역']) */
export function regionSummaryParts(sel: RegionSelection): string[] {
  if (!sel.province) return ['전체 지역'];
  const label = findProvince(sel.province)?.label ?? '';
  return [label, sel.district ?? '전체'];
}

/** 특정 지역이 현재 선택 조건에 맞는지 */
export function matchesRegion(sel: RegionSelection, region: string): boolean {
  if (!sel.province) return true;
  if (sel.district) return region === sel.district;
  return provinceOfDistrict(region) === sel.province;
}
