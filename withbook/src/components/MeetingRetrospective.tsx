'use client';

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_OFFLINE_EVENTS, PLACEHOLDER_COLORS } from '../lib/mock-data';
import type { BookRating, OpinionDivergence, ReturnIntent } from '../lib/types';

type Step = 'questions' | 'card' | 'optIn';

export default function MeetingRetrospective() {
  const {
    pendingRetrospectiveEventId,
    retrospectives,
    remainingCards,
    setSubView,
    submitRetrospective,
    saveCardToLibrary,
    shareCardToFeed,
    notificationOptIn,
    setNotificationOptIn,
    updateConsent,
  } = useApp();

  // 열린 시점의 대상 모임을 고정 — 제출 후 pending이 바뀌어도 화면이 흔들리지 않게
  const [eventId] = useState<string | null>(pendingRetrospectiveEventId);
  const alreadyAnswered = retrospectives.some(r => r.eventId === eventId);
  const [step, setStep] = useState<Step>(alreadyAnswered ? 'card' : 'questions');
  const [bookRating, setBookRating] = useState<BookRating | null>(null);
  const [opinionDivergence, setOpinionDivergence] = useState<OpinionDivergence | null>(null);
  const [returnIntent, setReturnIntent] = useState<ReturnIntent | null>(null);
  const [freeText, setFreeText] = useState('');

  const event = MOCK_OFFLINE_EVENTS.find(ev => ev.id === eventId);

  if (!event) {
    return (
      <div className="fixed inset-0 z-40 bg-canvas animate-slide-up flex items-center justify-center">
        <div className="text-center px-8">
          <p className="text-[15px] text-sub">회고 대상 모임을 찾을 수 없어요</p>
          <button
            onClick={() => setSubView(null)}
            className="mt-4 px-6 py-2.5 rounded-full bg-action text-white text-[14px] font-semibold press-scale"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const bookTitle = event.book?.title || '모임';
  const allAnswered = bookRating && opinionDivergence && returnIntent;

  function handleSubmit() {
    if (!allAnswered || !eventId) return;
    submitRetrospective(eventId, {
      bookRating: bookRating!,
      opinionDivergence: opinionDivergence!,
      returnIntent: returnIntent!,
      freeText,
    });
    setStep('card');
  }

  function handleClose() {
    setSubView(null);
  }

  // 방금 생성된 카드 찾기
  const latestCard = remainingCards.find(c => c.eventId === eventId);

  return (
    <div className="fixed inset-0 z-40 bg-canvas animate-slide-up">
      <div className="flex flex-col min-h-dvh max-w-[430px] mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm px-5 pt-[58px] pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="press-scale w-[34px] h-[34px] rounded-full bg-canvas flex items-center justify-center"
            >
              <span className="text-[18px]">&times;</span>
            </button>
            <h1 className="text-[17px] font-semibold text-ink truncate">30초 회고</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-24">
          {/* ── Step 1: 3문항 ── */}
          {step === 'questions' && (
            <div className="px-5 py-6">
              <div className="mb-8">
                <h2 className="text-[19px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
                  《{bookTitle}》 모임은 어땠나요?
                </h2>
                <p className="text-[13px] text-sub mt-1">30초면 됩니다</p>
              </div>

              {/* Q1: 책 */}
              <div className="mb-6">
                <p className="text-[14px] font-semibold text-ink mb-3">책은 어땠나요</p>
                <div className="flex gap-2">
                  <TapChip label="좋았다" selected={bookRating === 'good'} onTap={() => setBookRating('good')} />
                  <TapChip label="보통" selected={bookRating === 'okay'} onTap={() => setBookRating('okay')} />
                  <TapChip label="아쉽다" selected={bookRating === 'disappointing'} onTap={() => setBookRating('disappointing')} />
                </div>
              </div>

              {/* Q2: 의견 */}
              <div className="mb-6">
                <p className="text-[14px] font-semibold text-ink mb-3">의견이 갈렸나요</p>
                <div className="flex gap-2">
                  <TapChip label="많이 갈렸다" selected={opinionDivergence === 'a_lot'} onTap={() => setOpinionDivergence('a_lot')} />
                  <TapChip label="조금" selected={opinionDivergence === 'some'} onTap={() => setOpinionDivergence('some')} />
                  <TapChip label="대체로 비슷했다" selected={opinionDivergence === 'similar'} onTap={() => setOpinionDivergence('similar')} />
                </div>
              </div>

              {/* Q3: 다음 */}
              <div className="mb-6">
                <p className="text-[14px] font-semibold text-ink mb-3">다음에도 오시겠어요</p>
                <div className="flex gap-2">
                  <TapChip label="네" selected={returnIntent === 'yes'} onTap={() => setReturnIntent('yes')} />
                  <TapChip label="미정" selected={returnIntent === 'undecided'} onTap={() => setReturnIntent('undecided')} />
                  <TapChip label="아니오" selected={returnIntent === 'no'} onTap={() => setReturnIntent('no')} />
                </div>
              </div>

              {/* 자유 입력 */}
              <div className="mb-8">
                <input
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder="한 줄 남기기 (건너뛰어도 됩니다)"
                  className="w-full px-4 py-3 bg-surface border border-border rounded-[12px] text-[14px] text-ink placeholder:text-inactive focus:outline-none focus:border-action/50"
                />
              </div>

              {/* 완료 버튼 */}
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className="w-full py-3.5 rounded-[12px] bg-action text-white text-[15px] font-semibold disabled:opacity-40 transition-opacity press-scale"
              >
                완료
              </button>
            </div>
          )}

          {/* ── Step 2: "남은 문장" 카드 ── */}
          {step === 'card' && latestCard && (
            <div className="px-5 py-6">
              <div className="mb-6 text-center">
                <h2 className="text-[19px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
                  이 모임에 남은 문장
                </h2>
                <p className="text-[13px] text-sub mt-1">함께 읽은 기록이에요</p>
              </div>

              {/* Card */}
              <div className="bg-dark rounded-[18px] p-5 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-[42px] h-[58px] rounded-[6px] overflow-hidden flex-shrink-0">
                    {latestCard.book.coverUrl ? (
                      <img src={latestCard.book.coverUrl} alt={latestCard.book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: PLACEHOLDER_COLORS[parseInt(latestCard.book.isbn) % PLACEHOLDER_COLORS.length] }}
                      >
                        <span className="text-white text-[8px]">{latestCard.book.title[0]}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white text-[14px] font-semibold">《{latestCard.book.title}》</p>
                    <p className="text-white/60 text-[12px]">{latestCard.book.author}</p>
                  </div>
                </div>

                {/* Sentences */}
                <div className="space-y-3 mb-4">
                  {latestCard.sentences.map((s, i) => (
                    <div key={i} className="border-l-[2px] border-white/30 pl-3">
                      <p className="text-white/90 text-[13px] leading-[1.7]">&ldquo;{s.sentence}&rdquo;</p>
                      <p className="text-white/50 text-[11px] mt-0.5">— {s.userName}</p>
                    </div>
                  ))}
                </div>

                {/* Participants */}
                <div className="border-t border-white/10 pt-3">
                  <p className="text-white/50 text-[11px]">
                    {latestCard.participants.join(', ')} · {formatDate(latestCard.date)}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    saveCardToLibrary(latestCard.id);
                    setStep('optIn');
                  }}
                  className={`w-full py-3.5 rounded-[12px] text-[15px] font-semibold transition-all press-scale ${
                    latestCard.savedToLibrary
                      ? 'bg-action/10 text-action border border-action/30'
                      : 'bg-action text-white'
                  }`}
                >
                  {latestCard.savedToLibrary ? '저장됨' : '내 서재에 저장'}
                </button>
                <button
                  onClick={() => {
                    shareCardToFeed(latestCard.id);
                    setStep('optIn');
                  }}
                  className={`w-full py-3.5 rounded-[12px] text-[15px] font-semibold border transition-all press-scale ${
                    latestCard.sharedToFeed
                      ? 'bg-action/10 text-action border-action/30'
                      : 'bg-surface text-ink border-border'
                  }`}
                >
                  {latestCard.sharedToFeed ? '피드에 올렸어요' : '피드에 올리기'}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: 알림 동의 + 닫기 ── */}
          {step === 'optIn' && (
            <div className="px-5 py-6">
              <div className="mb-6 text-center">
                <div className="w-16 h-16 rounded-full bg-action/10 flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    <path d="M16 4L20 12L28 13.5L22 19.5L23.5 28L16 24L8.5 28L10 19.5L4 13.5L12 12L16 4Z" fill="#0066cc" />
                  </svg>
                </div>
                <h2 className="text-[19px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
                  회고가 저장되었어요
                </h2>
                <p className="text-[13px] text-sub mt-1">소중한 기록 감사합니다</p>
              </div>

              {/* 알림 동의 체크박스 */}
              <div className="bg-surface border border-border rounded-[14px] p-4 mb-8">
                <button
                  onClick={() => {
                    const next = !notificationOptIn;
                    setNotificationOptIn(next);
                    // 이메일 수신은 선택 동의 항목이라 동의 이력으로도 남깁니다
                    void updateConsent('marketing_email', next);
                  }}
                  className="flex items-center gap-3 w-full"
                >
                  <div className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center flex-shrink-0 transition-colors ${
                    notificationOptIn ? 'bg-action' : 'bg-canvas border border-border'
                  }`}>
                    {notificationOptIn && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[14px] text-ink font-medium text-left">
                    다음 모임 소식을 이메일로 받을게요
                  </span>
                </button>
                <p className="text-[11.5px] text-sub mt-2 ml-[34px]">
                  마이 → 설정 → 개인정보 관리에서 언제든 철회할 수 있어요
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3.5 rounded-[12px] bg-action text-white text-[15px] font-semibold press-scale"
              >
                닫기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Tap Chip ── */
function TapChip({
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
      onClick={onTap}
      className={`press-scale px-4 py-2.5 rounded-full text-[13px] font-semibold transition-all border ${
        selected
          ? 'bg-action text-white border-action'
          : 'bg-surface text-ink border-border'
      }`}
    >
      {label}
    </button>
  );
}

/* ── Date format helper ── */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${dayNames[d.getDay()]})`;
}
