'use client';

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getEventFee } from '../lib/mock-data';
import {
  PAYMENT_METHODS,
  IS_DEMO_PAYMENT,
  DEMO_PAYMENT_NOTICE,
  isMethodAvailable,
  formatWon,
  type PaymentMethod,
} from '../lib/payment';
import type { OfflineEvent, FeeStatus, FeePayment } from '../lib/types';
import { BottomSheet } from './ui/Overlay';

/* ── 상태 문구 · 배지 ──
   미납자를 부정적으로 표시하지 않습니다. 빨강 대신 회색을 씁니다. */

const STATUS_SENTENCE: Record<FeeStatus, string> = {
  unpaid: '아직 납부하지 않았어요',
  pending: '확인 중이에요',
  paid: '납부 완료',
};

export function statusLabel(status: FeeStatus): string {
  return { unpaid: '미납', pending: '확인 중', paid: '완료' }[status];
}

/** 상태 배지 — 완료만 액센트, 나머지는 회색 계열 */
export function FeeStatusBadge({ status }: { status: FeeStatus }) {
  const style =
    status === 'paid'
      ? { backgroundColor: 'rgba(0, 102, 204, 0.1)', color: '#0066cc' }
      : status === 'pending'
        ? { backgroundColor: '#f5f5f7', color: '#1d1d1f' }
        : { backgroundColor: '#f5f5f7', color: '#86868b' };

  return (
    <span
      className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full whitespace-nowrap"
      style={style}
    >
      {statusLabel(status)}
    </span>
  );
}

export function formatDay(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/* ── 모임 상세의 회비 섹션 ── */
export default function FeeSection({ event }: { event: OfflineEvent }) {
  const { myFeePayment, reportFeeTransfer, feePayments, expenses, settlementPublicEvents } = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const fee = getEventFee(event);
  if (!fee) return null;

  const payment = myFeePayment(event.id);
  const status: FeeStatus = payment?.status ?? 'unpaid';

  const statusText =
    status === 'paid'
      ? `${formatDay(payment?.paidAt ?? null)} 납부 완료`
      : STATUS_SENTENCE[status];

  return (
    <div className="bg-surface mt-3 px-5 py-5 border-b border-border">
      <h3 className="text-[15px] font-semibold text-ink mb-3" style={{ letterSpacing: '-0.3px' }}>
        회비
      </h3>

      {IS_DEMO_PAYMENT && (
        <div className="rounded-[11px] px-3 py-2 mb-3" style={{ backgroundColor: '#f5f5f7' }}>
          <p className="text-[11.5px] leading-[1.6]" style={{ color: '#86868b' }}>
            {DEMO_PAYMENT_NOTICE}
          </p>
        </div>
      )}

      {/* 금액 · 포함 내역 · 기한 */}
      <div className="bg-canvas rounded-[14px] p-4 mb-3">
        <p className="text-[20px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
          {formatWon(fee.amount)}
        </p>
        <p className="text-[12.5px] text-sub mt-1.5 leading-[1.6]">
          포함 내역 · {fee.includes.join(' · ')}
        </p>
        <p className="text-[12.5px] text-sub mt-0.5">
          납부 기한 · {formatDay(fee.dueDate)}까지
        </p>
      </div>

      {/* 내 납부 상태 */}
      <div className="flex items-center gap-2 mb-4">
        <FeeStatusBadge status={status} />
        <span className="text-[13.5px] text-ink">{statusText}</span>
      </div>

      {status === 'paid' ? (
        <button
          onClick={() => setReceiptOpen(true)}
          className="press-scale focus-ring px-5 py-2.5 border border-border rounded-full text-[13px] font-medium text-ink"
        >
          영수 카드 보기
        </button>
      ) : status === 'pending' ? (
        <p className="text-[12.5px] text-sub leading-[1.7]">
          서재지기가 입금을 확인하면 완료로 바뀝니다. 보통 하루 안에 확인돼요.
        </p>
      ) : (
        <button
          onClick={() => setSheetOpen(true)}
          className="press-scale focus-ring px-5 py-2.5 bg-action text-white text-[13px] font-semibold rounded-full"
        >
          회비 납부
        </button>
      )}

      {/* 정산 요약 — 서재지기가 공개했을 때만 */}
      {settlementPublicEvents.has(event.id) && (() => {
        const income = feePayments
          .filter(p => p.eventId === event.id && p.status === 'paid')
          .reduce((sum, p) => sum + p.amount, 0);
        const spent = expenses
          .filter(e => e.eventId === event.id)
          .reduce((sum, e) => sum + e.amount, 0);
        return (
          <div className="rounded-[14px] p-4 mt-4" style={{ backgroundColor: '#f5f5f7' }}>
            <p className="text-[12px] font-semibold mb-2" style={{ color: '#86868b' }}>
              정산 요약
            </p>
            <div className="space-y-1.5">
              <SettlementLine label="수입 (회비)" value={formatWon(income)} />
              <SettlementLine label="지출" value={formatWon(spent)} />
              <div className="pt-1.5" style={{ borderTop: '1px solid #e0e0e0' }}>
                <SettlementLine label="잔액" value={formatWon(income - spent)} strong />
              </div>
            </div>
            <p className="text-[11.5px] text-caption mt-3 leading-[1.6]">
              서재지기가 공개한 내역입니다
            </p>
          </div>
        );
      })()}

      {sheetOpen && (
        <PaymentSheet
          event={event}
          amount={fee.amount}
          bankName={fee.bankName}
          bankAccount={fee.bankAccount}
          accountHolder={fee.accountHolder}
          onClose={() => setSheetOpen(false)}
          onTransferReported={(method) => {
            reportFeeTransfer(event.id, fee.amount, method);
            setSheetOpen(false);
          }}
        />
      )}

      {receiptOpen && payment && (
        <ReceiptSheet event={event} payment={payment} onClose={() => setReceiptOpen(false)} />
      )}
    </div>
  );
}

/* ── 결제 시트 ── */
function PaymentSheet({
  event,
  amount,
  bankName,
  bankAccount,
  accountHolder,
  onClose,
  onTransferReported,
}: {
  event: OfflineEvent;
  amount: number;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  onClose: () => void;
  onTransferReported: (method: PaymentMethod) => void;
}) {
  const { profile } = useApp();
  const [selected, setSelected] = useState<PaymentMethod>('transfer');
  const [copied, setCopied] = useState(false);
  const [blockedNote, setBlockedNote] = useState('');

  async function copyAccount() {
    const text = `${bankName} ${bankAccount}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function selectMethod(method: PaymentMethod) {
    if (!isMethodAvailable(method)) {
      setBlockedNote('정식 출시 후 이용할 수 있어요');
      return;
    }
    setBlockedNote('');
    setSelected(method);
  }

  return (
    <BottomSheet onClose={onClose} label="회비 납부">
        <h3 className="text-[17px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
          회비 납부
        </h3>
        <p className="text-[13px] text-sub mt-1 mb-5">
          {event.title} · {formatWon(amount)}
        </p>

        {/* 결제 수단 */}
        <div className="space-y-2 mb-5">
          {PAYMENT_METHODS.map(m => {
            const available = isMethodAvailable(m.id);
            const isSelected = available && selected === m.id;
            return (
              <button
                key={m.id}
                onClick={() => selectMethod(m.id)}
                aria-disabled={!available}
                className="press-scale focus-ring w-full flex items-center gap-3 px-4 py-3.5 rounded-[12px] border text-left transition-colors duration-200"
                style={{
                  borderColor: isSelected ? '#0066cc' : '#e0e0e0',
                  backgroundColor: isSelected ? 'rgba(0, 102, 204, 0.04)' : '#ffffff',
                  opacity: available ? 1 : 0.55,
                }}
              >
                <span
                  className="inline-flex items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    width: 20,
                    height: 20,
                    border: isSelected ? '6px solid #0066cc' : '1px solid #d2d2d7',
                  }}
                />
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="text-[14.5px] font-semibold text-ink">{m.label}</span>
                    {!available && (
                      <span
                        className="px-2 py-0.5 text-[10.5px] font-semibold rounded-full"
                        style={{ backgroundColor: '#f5f5f7', color: '#86868b' }}
                      >
                        준비 중
                      </span>
                    )}
                  </span>
                  <span className="block text-[12px] text-sub mt-0.5">{m.description}</span>
                </span>
              </button>
            );
          })}
        </div>

        {blockedNote && (
          <p className="text-[12.5px] text-sub mb-4 px-1">{blockedNote}</p>
        )}

        {/* 계좌 이체 안내 */}
        {selected === 'transfer' && (
          <div className="rounded-[14px] p-4 mb-5" style={{ backgroundColor: '#f5f5f7' }}>
            <p className="text-[12px] font-semibold mb-2" style={{ color: '#86868b' }}>
              입금 계좌
            </p>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[15px] font-semibold text-ink flex-1 min-w-0">
                {bankName} {bankAccount}
              </p>
              <button
                onClick={copyAccount}
                className="press-scale focus-ring px-3 py-1.5 bg-surface border border-border rounded-full text-[12px] font-medium text-ink flex-shrink-0"
              >
                {copied ? '복사됨' : '복사'}
              </button>
            </div>
            <p className="text-[12.5px] text-sub leading-[1.7]">
              예금주 {accountHolder}
              <br />
              입금자명은 <span className="text-ink font-medium">{profile.name || '이름'}</span>으로
              남겨주세요. 이름이 다르면 확인이 늦어질 수 있어요.
            </p>
          </div>
        )}

        <button
          onClick={() => onTransferReported(selected)}
          disabled={selected !== 'transfer'}
          className="press-scale focus-ring w-full py-3.5 rounded-[12px] bg-action text-white text-[15px] font-semibold disabled:opacity-40 transition-opacity"
        >
          이체 완료했어요
        </button>
        <p className="text-[11.5px] text-caption text-center mt-3 leading-[1.6]">
          누르면 서재지기에게 전달되고, 확인 후 납부 완료로 바뀝니다.
        </p>
        <button
          onClick={onClose}
          className="press-scale focus-ring w-full py-3 mt-1 text-[14px] text-sub"
        >
          닫기
        </button>
    </BottomSheet>
  );
}

/* ── 영수 카드 ── */
function ReceiptSheet({
  event,
  payment,
  onClose,
}: {
  event: OfflineEvent;
  payment: FeePayment;
  onClose: () => void;
}) {
  const paidAt = payment.paidAt ? new Date(payment.paidAt) : null;
  const paidText = paidAt
    ? `${paidAt.getFullYear()}년 ${paidAt.getMonth() + 1}월 ${paidAt.getDate()}일 ${String(paidAt.getHours()).padStart(2, '0')}:${String(paidAt.getMinutes()).padStart(2, '0')}`
    : '-';
  const methodLabel =
    PAYMENT_METHODS.find(m => m.id === payment.method)?.label ?? '계좌 이체';

  return (
    <BottomSheet onClose={onClose} label="영수 카드">
        <h3 className="text-[17px] font-semibold text-ink mb-4" style={{ letterSpacing: '-0.3px' }}>
          영수 카드
        </h3>

        <div className="bg-dark rounded-[18px] p-5 mb-5">
          <p className="text-white/55 text-[11px] font-semibold tracking-[0.5px] uppercase mb-2">
            납부 완료
          </p>
          <p className="text-white text-[16px] font-semibold" style={{ letterSpacing: '-0.3px' }}>
            {event.title}
          </p>
          <p className="text-white text-[24px] font-semibold mt-3" style={{ letterSpacing: '-0.5px' }}>
            {formatWon(payment.amount)}
          </p>
          <div className="border-t border-white/10 mt-4 pt-3 space-y-1">
            <p className="text-white/60 text-[12px]">납부 일시 · {paidText}</p>
            <p className="text-white/60 text-[12px]">결제 수단 · {methodLabel}</p>
            {payment.confirmedBy && (
              <p className="text-white/60 text-[12px]">확인 · {payment.confirmedBy}</p>
            )}
          </div>
        </div>

        <p className="text-[11.5px] text-caption leading-[1.7] mb-4">
          영수 카드는 납부 사실을 확인하기 위한 기록입니다. 세금계산서나 현금영수증이 아닙니다.
        </p>

        <button
          onClick={onClose}
          className="press-scale focus-ring w-full py-3.5 rounded-[12px] border border-border text-[15px] font-semibold text-ink"
        >
          닫기
        </button>
    </BottomSheet>
  );
}

/* ── 정산 요약 한 줄 ── */
function SettlementLine({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[13px] ${strong ? 'text-ink font-medium' : 'text-sub'}`}>{label}</span>
      <span className={`text-[13.5px] text-ink ${strong ? 'font-semibold' : ''}`}>{value}</span>
    </div>
  );
}
