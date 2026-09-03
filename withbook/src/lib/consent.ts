/**
 * 개인정보 동의 항목 정의 (개인정보보호법 기준)
 *
 * 약관·방침을 개정하면 아래 버전 상수를 올립니다.
 * 사용자의 최신 동의 버전이 현재 버전보다 낮으면 재동의를 받습니다.
 * (동의 여부 판정은 lib/consent-check.ts의 needsReconsent 참고)
 */

/** 각 문서의 현재 버전 — 개정 시 이 값을 올리면 재동의를 받게 됩니다 */
export const POLICY_VERSIONS = {
  age14: '1.0',
  terms: '1.0',
  privacy: '1.0',
  overseas: '1.0',
  sensitive: '1.0',
  marketing_email: '1.0',
} as const;

export type ConsentType = keyof typeof POLICY_VERSIONS;

export interface ConsentItem {
  type: ConsentType;
  required: boolean;
  /** 체크박스 옆 한 줄 */
  label: string;
  /** 라벨 아래 보조 설명 (없으면 생략) */
  note?: string;
  /** "전문 보기"로 펼쳐지는 내용 */
  detail: string[];
  /** 시각적으로 구분해 보여줄 항목 (민감정보) */
  emphasized?: boolean;
  /** 동의하지 않을 때 무엇이 제한되는지 */
  declineNote?: string;
}

export const CONSENT_ITEMS: ConsentItem[] = [
  {
    type: 'age14',
    required: true,
    label: '만 14세 이상입니다',
    detail: [
      '위드북은 만 14세 미만 아동의 가입을 받지 않습니다. 법정대리인의 동의를 받는 절차를 아직 갖추지 못했기 때문입니다.',
      '만 14세 미만임이 확인되면 계정과 관련 기록은 지체 없이 삭제됩니다.',
    ],
  },
  {
    type: 'terms',
    required: true,
    label: '서비스 이용약관',
    note: '위드북 이용에 관한 기본 규칙입니다',
    detail: [
      '위드북은 책을 읽고 밑줄을 남기는 사람들을 연결하는 서비스입니다. 이용약관은 계정, 게시물, 모임 참여, 이용 제한, 책임의 범위를 정합니다.',
      '다른 이용자의 밑줄과 기록을 무단으로 수집하거나 외부에 옮기는 행위, 모임에서 다른 참가자를 불쾌하게 하는 행위는 이용 제한 사유가 됩니다.',
      '전문은 이용약관 페이지에서 확인할 수 있습니다.',
    ],
  },
  {
    type: 'privacy',
    required: true,
    label: '개인정보 수집·이용',
    note: '이름 · 이메일 · 활동지역 · 프로필',
    detail: [
      '수집 항목: 이름, 이메일 주소, 활동지역(시·도 및 세부 지역), 프로필 정보(프로필 이미지, 인생책, 좋아하는 작가, 관심 장르).',
      '수집 목적: 계정 생성과 로그인, 지역 기반 모임 안내, 프로필 표시, 문의 응대.',
      '보유 기간: 회원 탈퇴 시까지. 탈퇴하면 지체 없이 파기합니다.',
      '동의를 거부할 수 있으나, 이 항목에 동의하지 않으면 계정을 만들 수 없습니다.',
    ],
  },
  {
    type: 'overseas',
    required: true,
    label: '개인정보 국외 이전',
    note: 'Supabase(일본) · Vercel(미국)에 저장됩니다',
    detail: [
      '위드북은 자체 서버를 두지 않고 아래 사업자의 인프라를 이용합니다. 그 결과 회원의 개인정보가 국외에 저장·처리됩니다.',
      '이전받는 자: Supabase Inc. — 이전 국가: 일본(도쿄 리전) — 이전 항목: 이름, 이메일, 활동지역, 프로필, 밑줄·회고 등 서비스 이용 기록 — 이전 목적: 데이터베이스 및 인증 서비스 제공 — 보유 기간: 회원 탈퇴 시까지.',
      '이전받는 자: Vercel Inc. — 이전 국가: 미국 — 이전 항목: 접속 IP, 접속 기록 — 이전 목적: 웹 서비스 호스팅 — 보유 기간: 로그 보관 기간까지.',
      '이전받는 자: 알라딘 커뮤니케이션 — 이전 국가: 대한민국(국내) — 도서 검색 시 검색어가 전달되며, 회원을 식별할 수 있는 정보는 전달하지 않습니다.',
      '동의를 거부할 수 있으나, 이 항목에 동의하지 않으면 서비스를 제공할 수 없습니다.',
    ],
  },
  {
    type: 'sensitive',
    required: false,
    emphasized: true,
    label: '민감정보 처리 동의',
    note: '독서기록 · 인상 깊은 문장 · 가치관 태그를 취향 매칭에 활용',
    declineNote: '동의하지 않아도 가입할 수 있습니다. 취향 매칭 기능만 제한됩니다.',
    detail: [
      '무엇이 민감정보인가: 어떤 책을 읽었는지, 어떤 문장에 밑줄을 그었는지, 어떤 가치관 태그를 골랐는지는 사상·신념이나 정치적 견해를 드러낼 수 있습니다. 개인정보보호법은 이런 정보를 민감정보로 보고 별도 동의를 받도록 정하고 있습니다.',
      '처리 목적: 같은 책을 다르게 읽은 사람 찾기, 밑줄 짝 연결, 서재 추천 등 취향 기반 매칭.',
      '보유 기간: 동의를 철회하거나 회원 탈퇴할 때까지.',
      '동의하지 않아도 밑줄을 남기고 읽고 모임에 참여할 수 있습니다. 다만 매칭 대상에서 제외되어 같은 책 다른 시선, 서재 추천, 새 밑줄 짝 연결은 이용할 수 없습니다.',
      '동의는 마이 → 설정 → 개인정보 관리에서 언제든 철회할 수 있습니다.',
    ],
  },
  {
    type: 'marketing_email',
    required: false,
    label: '모임 알림 수신 (이메일)',
    note: '새 모임과 회고 안내를 이메일로 받습니다',
    declineNote: '동의하지 않아도 가입할 수 있습니다.',
    detail: [
      '보내는 내용: 참여 중인 서재의 모임 일정, 새로 열린 모임 안내, 회고 요청.',
      '보유 기간: 수신 동의를 철회하거나 회원 탈퇴할 때까지.',
      '수신 동의와 무관하게, 계정과 보안에 관한 안내(비밀번호 재설정 등)는 발송됩니다.',
      '마이 → 설정 → 개인정보 관리에서 언제든 철회할 수 있습니다.',
    ],
  },
];

export const REQUIRED_CONSENT_TYPES = CONSENT_ITEMS.filter(i => i.required).map(i => i.type);
export const OPTIONAL_CONSENT_TYPES = CONSENT_ITEMS.filter(i => !i.required).map(i => i.type);

/** 사용자가 화면에서 만든 동의 상태 */
export type ConsentDraft = Record<ConsentType, boolean>;

export const EMPTY_CONSENT_DRAFT: ConsentDraft = CONSENT_ITEMS.reduce(
  (acc, item) => ({ ...acc, [item.type]: false }),
  {} as ConsentDraft,
);

/** 저장된 동의 기록 한 건 */
export interface ConsentRecord {
  consentType: ConsentType;
  agreed: boolean;
  policyVersion: string;
  agreedAt: string;
}

/** 필수 항목이 모두 체크됐는지 */
export function requiredConsentsMet(draft: ConsentDraft): boolean {
  return REQUIRED_CONSENT_TYPES.every(t => draft[t]);
}

/**
 * 재동의가 필요한지 판정.
 * 필수 항목의 최신 기록이 없거나, 동의하지 않았거나, 방침 버전이 올라갔으면 true.
 */
export function needsReconsent(records: ConsentRecord[]): boolean {
  return REQUIRED_CONSENT_TYPES.some(type => {
    const latest = latestConsent(records, type);
    if (!latest || !latest.agreed) return true;
    return latest.policyVersion !== POLICY_VERSIONS[type];
  });
}

/** 항목별 가장 최근 기록 (동의 이력은 append-only로 쌓입니다) */
export function latestConsent(records: ConsentRecord[], type: ConsentType): ConsentRecord | null {
  const rows = records
    .filter(r => r.consentType === type)
    .sort((a, b) => (a.agreedAt < b.agreedAt ? 1 : -1));
  return rows[0] ?? null;
}

/** 현재 유효한 동의인지 (철회했거나 기록이 없으면 false) */
export function isConsentActive(records: ConsentRecord[], type: ConsentType): boolean {
  return latestConsent(records, type)?.agreed ?? false;
}
