'use client';

import { useState } from 'react';
import {
  CONSENT_ITEMS,
  EMPTY_CONSENT_DRAFT,
  requiredConsentsMet,
  type ConsentDraft,
  type ConsentItem,
  type ConsentType,
} from '../lib/consent';

/**
 * 회원가입 동의 화면.
 * "전체 동의"는 편의 버튼일 뿐이고, 실제 동의 기준은 개별 체크 상태입니다.
 */
export default function ConsentForm({
  title = '약관에 동의해주세요',
  description = '필수 항목에 동의하면 가입이 완료됩니다.',
  submitLabel = '동의하고 가입하기',
  loading = false,
  error,
  onBack,
  onSubmit,
  initial,
}: {
  title?: string;
  description?: string;
  submitLabel?: string;
  loading?: boolean;
  error?: string;
  onBack?: () => void;
  onSubmit: (draft: ConsentDraft) => void;
  initial?: ConsentDraft;
}) {
  const [draft, setDraft] = useState<ConsentDraft>(initial ?? EMPTY_CONSENT_DRAFT);
  const [openDetail, setOpenDetail] = useState<ConsentType | null>(null);

  const allChecked = CONSENT_ITEMS.every(i => draft[i.type]);
  const canSubmit = requiredConsentsMet(draft) && !loading;

  function toggle(type: ConsentType) {
    setDraft(prev => ({ ...prev, [type]: !prev[type] }));
  }

  function toggleAll() {
    const next = !allChecked;
    setDraft(
      CONSENT_ITEMS.reduce(
        (acc, item) => ({ ...acc, [item.type]: next }),
        {} as ConsentDraft,
      ),
    );
  }

  const requiredItems = CONSENT_ITEMS.filter(i => i.required);
  const optionalItems = CONSENT_ITEMS.filter(i => !i.required);

  return (
    <div className="flex flex-col min-h-dvh px-5 pt-[80px] pb-10 bg-surface animate-slide-up">
      {onBack && (
        <button
          onClick={onBack}
          className="press-scale focus-ring self-start -ml-1 mb-4 text-[14px] text-sub"
        >
          ‹ 이전
        </button>
      )}

      <h1 className="text-[24px] font-semibold text-ink mb-2" style={{ letterSpacing: '-0.5px' }}>
        {title}
      </h1>
      <p className="text-sub text-[14px] leading-relaxed mb-6">{description}</p>

      {/* 전체 동의 — 편의 버튼 */}
      <button
        onClick={toggleAll}
        className="press-scale focus-ring w-full flex items-center gap-3 px-4 py-3.5 rounded-[12px] border border-border mb-2 text-left"
      >
        <CheckBox checked={allChecked} />
        <span className="text-[14.5px] font-semibold text-ink">전체 동의</span>
      </button>
      <p className="text-[11.5px] text-caption mb-5 px-1">
        선택 항목까지 한 번에 체크합니다. 항목별로 따로 고르셔도 됩니다.
      </p>

      {/* 필수 항목 */}
      <div className="space-y-1 mb-5">
        {requiredItems.map(item => (
          <ConsentRow
            key={item.type}
            item={item}
            checked={draft[item.type]}
            onToggle={() => toggle(item.type)}
            detailOpen={openDetail === item.type}
            onToggleDetail={() => setOpenDetail(openDetail === item.type ? null : item.type)}
          />
        ))}
      </div>

      {/* 선택 항목 */}
      <p className="text-[12px] font-semibold mb-2 px-1" style={{ color: '#86868b' }}>
        선택 항목
      </p>
      <div className="space-y-2 mb-6">
        {optionalItems.map(item => (
          <ConsentRow
            key={item.type}
            item={item}
            checked={draft[item.type]}
            onToggle={() => toggle(item.type)}
            detailOpen={openDetail === item.type}
            onToggleDetail={() => setOpenDetail(openDetail === item.type ? null : item.type)}
          />
        ))}
      </div>

      {/* 전문 링크 */}
      <p className="text-[11.5px] text-caption mb-6 px-1 leading-relaxed">
        전문은{' '}
        <a href="/terms" target="_blank" rel="noreferrer" className="underline text-sub">
          이용약관
        </a>
        {' · '}
        <a href="/privacy" target="_blank" rel="noreferrer" className="underline text-sub">
          개인정보처리방침
        </a>
        에서 확인할 수 있습니다.
      </p>

      {error && <p className="text-[13px] text-red-500 mb-3 px-1">{error}</p>}

      <button
        onClick={() => onSubmit(draft)}
        disabled={!canSubmit}
        className="press-scale focus-ring w-full py-3.5 rounded-full bg-action text-white text-[15px] font-semibold transition-opacity duration-200 disabled:opacity-40"
      >
        {loading ? '잠시만요...' : submitLabel}
      </button>

      {!requiredConsentsMet(draft) && (
        <p className="text-[12px] text-caption text-center mt-3">
          필수 항목에 모두 동의해야 다음으로 넘어갈 수 있습니다.
        </p>
      )}
    </div>
  );
}

/* ── 동의 항목 한 줄 ── */
function ConsentRow({
  item,
  checked,
  onToggle,
  detailOpen,
  onToggleDetail,
}: {
  item: ConsentItem;
  checked: boolean;
  onToggle: () => void;
  detailOpen: boolean;
  onToggleDetail: () => void;
}) {
  // 민감정보 항목은 회색 배경 박스로 구분
  const boxStyle = item.emphasized
    ? { backgroundColor: '#f5f5f7', padding: '14px 14px 12px' }
    : undefined;

  return (
    <div className={item.emphasized ? 'rounded-[12px]' : ''} style={boxStyle}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          role="checkbox"
          aria-checked={checked}
          aria-label={item.label}
          className="press-scale focus-ring flex-shrink-0 mt-0.5 rounded-full"
        >
          <CheckBox checked={checked} />
        </button>

        <div className="flex-1 min-w-0">
          <button onClick={onToggle} className="text-left w-full">
            <p className="text-[14px] text-ink leading-[1.5]">
              <span className={item.required ? 'text-action font-semibold' : 'text-sub'}>
                [{item.required ? '필수' : '선택'}]
              </span>{' '}
              {item.label}
            </p>
            {item.note && (
              <p className="text-[12px] text-sub mt-0.5 leading-[1.5]">{item.note}</p>
            )}
          </button>

          <button
            onClick={onToggleDetail}
            className="press-scale focus-ring text-[12px] text-sub underline mt-1.5"
          >
            {detailOpen ? '접기' : '전문 보기'}
          </button>

          {detailOpen && (
            <div className="mt-2 space-y-2 animate-fade">
              {item.detail.map((p, i) => (
                <p key={i} className="text-[12.5px] text-sub leading-[1.7]">
                  {p}
                </p>
              ))}
            </div>
          )}

          {item.declineNote && (
            <p className="text-[11.5px] text-caption mt-2 leading-[1.6]">{item.declineNote}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── 체크박스 ── */
function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full transition-colors duration-200"
      style={{
        width: 22,
        height: 22,
        backgroundColor: checked ? '#1d1d1f' : '#ffffff',
        border: checked ? '1px solid transparent' : '1px solid #d2d2d7',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M2.5 6.2L4.8 8.5L9.5 3.8"
          stroke={checked ? '#ffffff' : '#d2d2d7'}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
