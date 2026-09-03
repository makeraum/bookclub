'use client';

import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_OFFLINE_EVENTS, getEventFee, FEE_REMINDER_MESSAGE } from '../lib/mock-data';
import {
  formatWon,
  IS_DEMO_PAYMENT,
  DEMO_PAYMENT_NOTICE,
  BANKS,
  maskAccountNumber,
  isAccountReady,
} from '../lib/payment';
import { FeeStatusBadge, formatDay } from './FeeSection';
import { BottomSheet } from './ui/Overlay';
import type { FeeStatus, FeeAccount } from '../lib/types';

type StatusFilter = 'all' | FeeStatus;

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'unpaid', label: '미납' },
  { key: 'pending', label: '확인 중' },
  { key: 'paid', label: '완료' },
];

export default function AccountingTab({ eventId }: { eventId: string }) {
  const {
    getFeeAccount,
    saveFeeAccount,
    feePayments,
    expenses,
    feeReminders,
    settlementPublicEvents,
    confirmFeePayment,
    addExpense,
    removeExpense,
    sendFeeReminder,
    toggleSettlementPublic,
  } = useApp();

  const [filter, setFilter] = useState<StatusFilter>('all');
  const [accountOpen, setAccountOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [reminderSent, setReminderSent] = useState(false);

  const event = MOCK_OFFLINE_EVENTS.find(e => e.id === eventId);
  const fee = event ? getEventFee(event) : null;
  const account = getFeeAccount(eventId);
  const accountReady = isAccountReady(account);

  const payments = useMemo(
    () => feePayments.filter(p => p.eventId === eventId),
    [feePayments, eventId],
  );
  const eventExpenses = useMemo(
    () => expenses.filter(e => e.eventId === eventId),
    [expenses, eventId],
  );
  const reminders = useMemo(
    () => feeReminders.filter(r => r.eventId === eventId),
    [feeReminders, eventId],
  );

  const collected = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  // 서재지기가 회비를 다시 정했으면 그 금액 × 정원을 목표로 잡습니다
  const targetAmount = account?.amount
    ? account.amount * (event?.maxParticipants ?? payments.length)
    : fee?.targetAmount ?? payments.reduce((sum, p) => sum + p.amount, 0);
  const unpaidPayments = payments.filter(p => p.status === 'unpaid');
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const spent = eventExpenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = collected - spent;
  const settlementPublic = settlementPublicEvents.has(eventId);

  const visiblePayments = filter === 'all' ? payments : payments.filter(p => p.status === filter);

  function handleAddExpense() {
    const amount = parseInt(expenseAmount.replace(/[^0-9]/g, ''), 10);
    if (!expenseTitle.trim() || !amount || Number.isNaN(amount)) return;
    addExpense(eventId, expenseTitle.trim(), amount);
    setExpenseTitle('');
    setExpenseAmount('');
  }

  function handleSendReminder() {
    sendFeeReminder(eventId, unpaidPayments);
    setReminderSent(true);
    setTimeout(() => setReminderSent(false), 2500);
  }

  if (!event) {
    return (
      <div className="px-5 py-10 text-center">
        <p className="text-[14px] text-sub">회비를 관리할 모임을 찾을 수 없어요</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-5">
      {IS_DEMO_PAYMENT && (
        <div className="rounded-[11px] px-3 py-2 mb-4" style={{ backgroundColor: '#f5f5f7' }}>
          <p className="text-[11.5px] leading-[1.6]" style={{ color: '#86868b' }}>
            {DEMO_PAYMENT_NOTICE}
          </p>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
          회계
        </h2>
        <p className="text-[12px] text-sub mt-0.5">{event.title}</p>
      </div>

      {/* ── 상단 요약 — 금액과 인원 수만 ── */}
      <div className="bg-surface rounded-[16px] border border-border p-4 mb-4">
        <div className="flex gap-3">
          <SummaryCell label="걷힌 금액" value={formatWon(collected)} accent />
          <SummaryCell label="목표 금액" value={formatWon(targetAmount)} />
          <SummaryCell label="미납" value={`${unpaidPayments.length}명`} />
        </div>
        {pendingCount > 0 && (
          <p className="text-[12px] text-sub mt-3 pt-3" style={{ borderTop: '1px solid #f5f5f7' }}>
            확인 중 {pendingCount}명 · 입금을 확인하면 걷힌 금액에 반영됩니다
          </p>
        )}
      </div>

      {/* ── 입금 계좌 설정 ── */}
      <section className="bg-surface rounded-[16px] border border-border p-4 mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-semibold text-ink" style={{ letterSpacing: '-0.2px' }}>
              입금 계좌 설정
            </h3>
            {accountReady && account ? (
              <>
                <p className="text-[13px] text-ink mt-1">
                  {account.bankName} {maskAccountNumber(account.accountNumber)}
                </p>
                <p className="text-[12px] text-sub mt-0.5">
                  예금주 {account.accountHolder} · {formatWon(account.amount)}
                  {account.dueDate && ` · ${formatDay(account.dueDate)}까지`}
                </p>
                <p className="text-[11.5px] text-caption mt-1.5 leading-[1.6]">
                  전체 계좌번호는 참가자의 결제 시트에서만 보입니다.
                </p>
              </>
            ) : (
              <p className="text-[12px] text-sub mt-1 leading-[1.6]">
                계좌를 등록하면 참가자가 회비를 납부할 수 있어요. 등록 전에는 납부 버튼이 잠깁니다.
              </p>
            )}
          </div>
          <button
            onClick={() => setAccountOpen(true)}
            className={`press-scale focus-ring flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold ${
              accountReady
                ? 'border border-border text-ink'
                : 'bg-action text-white'
            }`}
          >
            {accountReady ? '수정' : '등록'}
          </button>
        </div>
      </section>

      {/* ── 상태 필터 ── */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-3">
        {FILTERS.map(f => {
          const count =
            f.key === 'all' ? payments.length : payments.filter(p => p.status === f.key).length;
          const selected = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="press-scale focus-ring rounded-full font-semibold whitespace-nowrap transition-colors duration-200"
              style={{
                fontSize: 13,
                padding: '6px 12px',
                lineHeight: 1.4,
                backgroundColor: selected ? '#1d1d1f' : '#ffffff',
                color: selected ? '#ffffff' : '#1d1d1f',
                border: selected ? '1px solid transparent' : '1px solid #d2d2d7',
              }}
            >
              {f.label} {count}
            </button>
          );
        })}
      </div>

      {/* ── 참가자별 납부 목록 ── */}
      <ul className="space-y-2 mb-5">
        {visiblePayments.map(p => (
          <li
            key={p.id}
            className="flex items-center gap-3 p-3 rounded-[12px] bg-surface border border-border"
          >
            <div className="w-[36px] h-[36px] rounded-full overflow-hidden flex-shrink-0">
              <img src={p.userAvatar} alt={p.userName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-medium text-ink truncate">{p.userName}</span>
                <FeeStatusBadge status={p.status} />
              </div>
              <p className="text-[11.5px] text-sub mt-0.5">
                {p.status === 'paid' && `${formatDay(p.paidAt)} 납부 · ${formatWon(p.amount)}`}
                {p.status === 'pending' && `${formatDay(p.reportedAt)} 이체 알림 · ${formatWon(p.amount)}`}
                {p.status === 'unpaid' && formatWon(p.amount)}
              </p>
            </div>
            {p.status === 'pending' && (
              <button
                onClick={() => confirmFeePayment(p.id)}
                className="press-scale focus-ring flex-shrink-0 px-3 py-1.5 bg-action text-white text-[12px] font-semibold rounded-full"
              >
                입금 확인
              </button>
            )}
          </li>
        ))}
        {visiblePayments.length === 0 && (
          <li className="py-8 text-center text-[13px] text-sub">해당하는 참가자가 없어요</li>
        )}
      </ul>

      {/* ── 미납 리마인드 ── */}
      <section className="bg-surface rounded-[16px] border border-border p-4 mb-4">
        <h3 className="text-[14px] font-semibold text-ink mb-1" style={{ letterSpacing: '-0.2px' }}>
          미납 안내 보내기
        </h3>
        <p className="text-[12px] text-sub mb-3 leading-[1.6]">
          아직 입금이 확인되지 않은 {unpaidPayments.length}명에게 한 번 안내합니다.
        </p>
        <div className="rounded-[11px] p-3 mb-3" style={{ backgroundColor: '#f5f5f7' }}>
          <p className="text-[12.5px] text-ink leading-[1.7]">{FEE_REMINDER_MESSAGE}</p>
        </div>
        <button
          onClick={handleSendReminder}
          disabled={unpaidPayments.length === 0}
          className="press-scale focus-ring px-5 py-2.5 border border-border rounded-full text-[13px] font-medium text-ink disabled:opacity-40"
        >
          {reminderSent ? '보냈어요' : '안내 보내기'}
        </button>

        {reminders.length > 0 && (
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid #f5f5f7' }}>
            <p className="text-[12px] font-semibold mb-2" style={{ color: '#86868b' }}>
              발송 내역
            </p>
            <ul className="space-y-1.5">
              {reminders.map(r => (
                <li key={r.id} className="text-[12px] text-sub leading-[1.6]">
                  {formatDay(r.sentAt)} · {r.recipientNames.join(', ')} ({r.recipientNames.length}명)
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ── 지출 기록 ── */}
      <section className="bg-surface rounded-[16px] border border-border p-4 mb-4">
        <h3 className="text-[14px] font-semibold text-ink mb-3" style={{ letterSpacing: '-0.2px' }}>
          지출 기록
        </h3>

        <ul className="space-y-2 mb-3">
          {eventExpenses.map(e => (
            <li key={e.id} className="flex items-center gap-3">
              <span className="flex-1 min-w-0 text-[13.5px] text-ink truncate">{e.title}</span>
              <span className="text-[13.5px] text-ink font-medium flex-shrink-0">
                {formatWon(e.amount)}
              </span>
              <button
                onClick={() => removeExpense(e.id)}
                aria-label={`${e.title} 삭제`}
                className="press-scale focus-ring text-[12px] text-sub flex-shrink-0"
              >
                삭제
              </button>
            </li>
          ))}
          {eventExpenses.length === 0 && (
            <li className="text-[13px] text-sub py-2">아직 기록한 지출이 없어요</li>
          )}
        </ul>

        <div className="flex gap-2">
          <input
            value={expenseTitle}
            onChange={e => setExpenseTitle(e.target.value)}
            placeholder="항목명"
            className="flex-1 min-w-0 px-3 py-2.5 bg-surface border border-border rounded-[11px] text-[13.5px] text-ink placeholder:text-inactive outline-none focus:border-action transition-colors"
          />
          <input
            value={expenseAmount}
            onChange={e => setExpenseAmount(e.target.value)}
            inputMode="numeric"
            placeholder="금액"
            className="w-[92px] flex-shrink-0 px-3 py-2.5 bg-surface border border-border rounded-[11px] text-[13.5px] text-ink placeholder:text-inactive outline-none focus:border-action transition-colors"
          />
          <button
            onClick={handleAddExpense}
            disabled={!expenseTitle.trim() || !expenseAmount.trim()}
            className="press-scale focus-ring flex-shrink-0 px-4 py-2.5 bg-action text-white text-[13px] font-semibold rounded-[11px] disabled:opacity-40"
          >
            추가
          </button>
        </div>

        <div
          className="flex items-center justify-between mt-4 pt-3"
          style={{ borderTop: '1px solid #f5f5f7' }}
        >
          <span className="text-[13.5px] text-sub">잔액</span>
          <span className="text-[15px] font-semibold text-ink">{formatWon(balance)}</span>
        </div>
      </section>

      {accountOpen && (
        <FeeAccountSheet
          eventId={eventId}
          initial={account}
          defaultAmount={fee?.amount ?? 0}
          defaultDueDate={fee?.dueDate ?? ''}
          onClose={() => setAccountOpen(false)}
          onSave={(next) => {
            saveFeeAccount(next);
            setAccountOpen(false);
          }}
        />
      )}

      {/* ── 정산 요약 공개 ── */}
      <section className="bg-surface rounded-[16px] border border-border p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-semibold text-ink" style={{ letterSpacing: '-0.2px' }}>
              정산 요약 공개
            </h3>
            <p className="text-[12px] text-sub mt-0.5 leading-[1.6]">
              모임이 끝난 뒤 수입·지출·잔액을 참가자에게 보여줍니다.
            </p>
          </div>
          <button
            onClick={() => toggleSettlementPublic(eventId)}
            aria-label={settlementPublic ? '공개 끄기' : '공개 켜기'}
            className="press-scale focus-ring flex-shrink-0 mt-0.5"
          >
            <div
              className={`w-[36px] h-[20px] rounded-full transition-colors duration-200 flex items-center ${
                settlementPublic ? 'bg-action justify-end' : 'bg-chip-border justify-start'
              }`}
            >
              <div className="w-[16px] h-[16px] rounded-full bg-white mx-[2px] shadow-sm" />
            </div>
          </button>
        </div>

        <div className="rounded-[12px] p-4" style={{ backgroundColor: '#f5f5f7' }}>
          <p className="text-[12px] font-semibold mb-2" style={{ color: '#86868b' }}>
            {settlementPublic ? '참가자에게 이렇게 보입니다' : '공개하면 이렇게 보입니다'}
          </p>
          <div className="space-y-1.5">
            <SettlementRow label="수입 (회비)" value={formatWon(collected)} />
            <SettlementRow label="지출" value={formatWon(spent)} />
            <div className="pt-1.5" style={{ borderTop: '1px solid #e0e0e0' }}>
              <SettlementRow label="잔액" value={formatWon(balance)} strong />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── 요약 셀 ── */
function SummaryCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex-1 min-w-0">
      <p className="text-[11.5px] text-sub mb-1">{label}</p>
      <p
        className="text-[16px] font-semibold truncate"
        style={{ color: accent ? '#0066cc' : '#1d1d1f', letterSpacing: '-0.3px' }}
      >
        {value}
      </p>
    </div>
  );
}

function SettlementRow({
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

/* ── 입금 계좌 · 회비 설정 시트 ── */
function FeeAccountSheet({
  eventId,
  initial,
  defaultAmount,
  defaultDueDate,
  onClose,
  onSave,
}: {
  eventId: string;
  initial: FeeAccount | null;
  defaultAmount: number;
  defaultDueDate: string;
  onClose: () => void;
  onSave: (account: Omit<FeeAccount, 'updatedAt'>) => void;
}) {
  const [bankName, setBankName] = useState(initial?.bankName ?? '');
  const [accountNumber, setAccountNumber] = useState(initial?.accountNumber ?? '');
  const [accountHolder, setAccountHolder] = useState(initial?.accountHolder ?? '');
  const [amount, setAmount] = useState(String(initial?.amount ?? defaultAmount ?? ''));
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? defaultDueDate ?? '');

  const parsedAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10);
  const ready =
    !!bankName &&
    accountNumber.trim().length >= 8 &&
    !!accountHolder.trim() &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0;

  function handleSave() {
    if (!ready) return;
    onSave({
      eventId,
      bankName,
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
      amount: parsedAmount,
      dueDate,
    });
  }

  return (
    <BottomSheet onClose={onClose} label="입금 계좌 설정">
      <h3 className="text-[17px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
        입금 계좌 설정
      </h3>
      <p className="text-[12.5px] text-sub mt-1 mb-5 leading-[1.7]">
        참가자에게 보일 계좌입니다. 전체 계좌번호는 결제 시트에서만 노출되고, 목록과 요약에서는
        가려서 표시됩니다.
      </p>

      <div className="space-y-4">
        {/* 은행 */}
        <div>
          <label className="text-[12px] font-semibold block mb-1.5" style={{ color: '#86868b' }}>
            은행
          </label>
          <select
            value={bankName}
            onChange={e => setBankName(e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-border rounded-[11px] text-[14px] text-ink outline-none focus:border-action transition-colors appearance-none"
          >
            <option value="">은행을 선택하세요</option>
            {BANKS.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* 계좌번호 */}
        <div>
          <label className="text-[12px] font-semibold block mb-1.5" style={{ color: '#86868b' }}>
            계좌번호
          </label>
          <input
            value={accountNumber}
            onChange={e => setAccountNumber(e.target.value)}
            inputMode="numeric"
            placeholder="3333-01-1234567"
            className="w-full px-4 py-3 bg-surface border border-border rounded-[11px] text-[14px] text-ink placeholder:text-inactive outline-none focus:border-action transition-colors"
          />
        </div>

        {/* 예금주 */}
        <div>
          <label className="text-[12px] font-semibold block mb-1.5" style={{ color: '#86868b' }}>
            예금주
          </label>
          <input
            value={accountHolder}
            onChange={e => setAccountHolder(e.target.value)}
            placeholder="예금주 이름"
            className="w-full px-4 py-3 bg-surface border border-border rounded-[11px] text-[14px] text-ink placeholder:text-inactive outline-none focus:border-action transition-colors"
          />
        </div>

        {/* 회비 금액 */}
        <div>
          <label className="text-[12px] font-semibold block mb-1.5" style={{ color: '#86868b' }}>
            회비 금액
          </label>
          <input
            value={amount}
            onChange={e => setAmount(e.target.value)}
            inputMode="numeric"
            placeholder="15000"
            className="w-full px-4 py-3 bg-surface border border-border rounded-[11px] text-[14px] text-ink placeholder:text-inactive outline-none focus:border-action transition-colors"
          />
          {Number.isFinite(parsedAmount) && parsedAmount > 0 && (
            <p className="text-[12px] text-sub mt-1.5">{formatWon(parsedAmount)}</p>
          )}
        </div>

        {/* 납부 기한 */}
        <div>
          <label className="text-[12px] font-semibold block mb-1.5" style={{ color: '#86868b' }}>
            납부 기한
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-border rounded-[11px] text-[14px] text-ink outline-none focus:border-action transition-colors"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={!ready}
        className="press-scale focus-ring w-full py-3.5 mt-6 rounded-[12px] bg-action text-white text-[15px] font-semibold disabled:opacity-40 transition-opacity"
      >
        저장하기
      </button>
      <button
        onClick={onClose}
        className="press-scale focus-ring w-full py-3 mt-1 text-[14px] text-sub"
      >
        닫기
      </button>
    </BottomSheet>
  );
}
