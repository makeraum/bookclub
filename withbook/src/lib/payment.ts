/**
 * 회비 결제 설정.
 *
 * PAYMENT_MODE 하나로 데모/실제를 전환합니다.
 *   'demo' — 카드·카카오페이 비활성, 계좌 이체만 받고 서재지기가 수동 확인
 *   'live' — PG 결제 활성 (연동 후)
 *
 * 실제 연동은 아래 requestPgPayment()의 TODO 지점에서 시작합니다.
 */

export type PaymentMode = 'demo' | 'live';

export const PAYMENT_MODE: PaymentMode = 'demo';

export const IS_DEMO_PAYMENT = PAYMENT_MODE === 'demo';

/** 데모 모드 상단 안내 문구 */
export const DEMO_PAYMENT_NOTICE = '결제 기능은 준비 중입니다. 회비는 계좌 이체로 받습니다';

export type PaymentMethod = 'transfer' | 'card' | 'kakaopay';

export interface PaymentMethodInfo {
  id: PaymentMethod;
  label: string;
  description: string;
  /** demo 모드에서 쓸 수 있는지 */
  availableInDemo: boolean;
}

export const PAYMENT_METHODS: PaymentMethodInfo[] = [
  {
    id: 'transfer',
    label: '계좌 이체',
    description: '입금자명을 이름으로 남겨주세요',
    availableInDemo: true,
  },
  {
    id: 'card',
    label: '카드 결제',
    description: '정식 출시 후 이용할 수 있어요',
    availableInDemo: false,
  },
  {
    id: 'kakaopay',
    label: '카카오페이',
    description: '정식 출시 후 이용할 수 있어요',
    availableInDemo: false,
  },
];

export function isMethodAvailable(method: PaymentMethod): boolean {
  if (!IS_DEMO_PAYMENT) return true;
  return PAYMENT_METHODS.find(m => m.id === method)?.availableInDemo ?? false;
}

/** 계좌 등록에 쓰는 은행 목록 */
export const BANKS = [
  '국민은행', '신한은행', '우리은행', '하나은행', '농협은행', '기업은행',
  'SC제일은행', '한국씨티은행', '카카오뱅크', '토스뱅크', '케이뱅크',
  '새마을금고', '신협', '우체국', '수협은행', '부산은행', '대구은행',
  '경남은행', '광주은행', '전북은행', '제주은행',
] as const;

export type BankName = (typeof BANKS)[number];

/**
 * 계좌번호 마스킹 — 목록·요약에서는 가린 형태만 보여줍니다.
 * 전체 번호는 결제 시트에서만 노출합니다.
 *   3333-01-1234567 → 3333-01-****567
 *   1002123456789   → 1002****789
 */
export function maskAccountNumber(accountNumber: string): string {
  const value = accountNumber.trim();
  if (!value) return '';

  if (value.includes('-')) {
    const parts = value.split('-');
    const last = parts.pop() ?? '';
    const tail = last.length > 3 ? `****${last.slice(-3)}` : '****';
    return [...parts, tail].join('-');
  }

  if (value.length <= 7) return `****${value.slice(-3)}`;
  return `${value.slice(0, 4)}****${value.slice(-3)}`;
}

/** 계좌가 다 채워졌는지 */
export function isAccountReady(account: {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
} | null | undefined): boolean {
  if (!account) return false;
  return !!(account.bankName.trim() && account.accountNumber.trim() && account.accountHolder.trim());
}

/** 금액 표기 — 12,000원 */
export function formatWon(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

/**
 * PG 결제 요청 진입점.
 *
 * TODO: 토스페이먼츠 연동
 *   1. @tosspayments/payment-sdk 설치 후 loadTossPayments(CLIENT_KEY) 호출
 *   2. requestPayment('카드' | '카카오페이', { amount, orderId, orderName, successUrl, failUrl })
 *   3. successUrl 라우트(/api/payments/confirm)에서 secretKey로 결제 승인 API 호출
 *   4. 승인 응답을 fee_payments에 status='paid', method, paid_at으로 기록
 *   5. PAYMENT_MODE를 'live'로 바꾸면 카드·카카오페이 버튼이 활성화됩니다
 */
export async function requestPgPayment(_params: {
  method: PaymentMethod;
  amount: number;
  orderName: string;
  eventId: string;
  userId: string;
}): Promise<{ ok: boolean; message: string }> {
  if (IS_DEMO_PAYMENT) {
    return { ok: false, message: '정식 출시 후 이용할 수 있어요' };
  }
  // TODO: 토스페이먼츠 연동 — 위 주석의 2~4단계를 여기에 구현합니다
  return { ok: false, message: '결제 수단을 준비 중입니다' };
}
