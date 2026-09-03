'use client';

import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_SEOJAE, MOCK_HIGHLIGHTS, DEFAULT_PROMISES, DEMO_RETROSPECTIVES, MOCK_OFFLINE_EVENTS } from '../lib/mock-data';
import { DISCUSSION_QUESTIONS } from '../lib/resource-data';
import type { AttendanceRecord, DiscussionQuestion, QuietMember, NoShowMember, EventType, Highlight, HighlightSentiment } from '../lib/types';

type ConsoleTab = 'attendance' | 'questions' | 'noshow' | 'quiet' | 'memo' | 'promises' | 'retrospective';

const TAB_LABELS: { key: ConsoleTab; label: string }[] = [
  { key: 'attendance', label: '출석' },
  { key: 'questions', label: '발제 질문' },
  { key: 'noshow', label: '노쇼' },
  { key: 'quiet', label: '조용한 회원' },
  { key: 'memo', label: '메모' },
  { key: 'promises', label: '약속' },
  { key: 'retrospective', label: '회고' },
];

// ── 데모 데이터 (서재지기 콘솔용) ──

function buildDemoAttendances(seojaeId: string): AttendanceRecord[] {
  const seojae = MOCK_SEOJAE.find(s => s.id === seojaeId);
  if (!seojae) return [];
  return seojae.members.map(m => ({
    userId: m.userId,
    userName: m.userName,
    userAvatar: m.userAvatar,
    attended: false,
  }));
}

function buildDemoQuestions(category: string): DiscussionQuestion[] {
  const pool = DISCUSSION_QUESTIONS.find(c => c.category === category)?.questions
    || DISCUSSION_QUESTIONS[0].questions;
  // 랜덤 8개 선택 (seed로 일관성 유지)
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 8).map((q, i) => ({
    id: `dq-${i}`,
    order: i + 1,
    text: q,
    isUsed: false,
  }));
}

const DEMO_NOSHOW: Record<string, NoShowMember[]> = {
  sj1: [
    { userId: 'u-noshow1', userName: '김태영', userAvatar: '/assets/avatar-doyoon.png', missedCount: 2 },
  ],
  sj2: [],
};

const DEMO_QUIET: Record<string, QuietMember[]> = {
  sj1: [
    { userId: 'u-quiet1', userName: '정민재', userAvatar: '/assets/avatar-jihwan.png', weeksSilent: 3 },
  ],
  sj2: [
    { userId: 'u-quiet2', userName: '이채원', userAvatar: '/assets/avatar-soyul.png', weeksSilent: 4 },
  ],
};

// ── 서재의 EventType 추정 (약속 기본값 로드용) ──
function guessEventType(seojaeId: string): EventType {
  // 서재는 기본적으로 bookclub 유형
  const seojae = MOCK_SEOJAE.find(s => s.id === seojaeId);
  if (!seojae) return 'bookclub';
  const name = seojae.name;
  if (name.includes('과학') || name.includes('산책')) return 'bookclub';
  return 'bookclub';
}

// ── 장르 추정 (현재 책 기반) ──
function guessCategory(seojaeId: string): string {
  const seojae = MOCK_SEOJAE.find(s => s.id === seojaeId);
  if (!seojae?.currentBook) {
    // 기본 소설
    if (seojaeId === 'sj1') return '소설'; // 강남 화요 서재 — 싯다르타/데미안
    if (seojaeId === 'sj2') return '비문학'; // 과학 산책 서재
    return '소설';
  }
  // 간단한 장르 추정
  const title = seojae.currentBook.title;
  if (['코스모스', '이기적 유전자'].includes(title)) return '비문학';
  if (['걷는 사람, 하정우'].includes(title)) return '에세이';
  return '소설';
}

export default function LibrarianConsole() {
  const { selectedSeojaeId, setSubView, mySeojae } = useApp();

  // 콘솔 대상 서재 결정
  const targetSeojaeId = selectedSeojaeId || mySeojae.find(s =>
    s.members.some(m => m.role === 'owner')
  )?.id || null;

  const seojae = MOCK_SEOJAE.find(s => s.id === targetSeojaeId)
    || mySeojae.find(s => s.id === targetSeojaeId);

  const [activeTab, setActiveTab] = useState<ConsoleTab>('attendance');
  const [attendances, setAttendances] = useState<AttendanceRecord[]>(() =>
    buildDemoAttendances(targetSeojaeId || '')
  );
  const [questions, setQuestions] = useState<DiscussionQuestion[]>(() =>
    buildDemoQuestions(guessCategory(targetSeojaeId || ''))
  );
  const [memo, setMemo] = useState('');
  const [memoSaved, setMemoSaved] = useState(false);
  const [promiseItems, setPromiseItems] = useState<string[]>(() =>
    [...DEFAULT_PROMISES[guessEventType(targetSeojaeId || '')]]
  );
  const [newPromise, setNewPromise] = useState('');
  const [editingPromiseIdx, setEditingPromiseIdx] = useState<number | null>(null);
  const [editingPromiseText, setEditingPromiseText] = useState('');
  const [promiseSaved, setPromiseSaved] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const noShowMembers = useMemo(() =>
    DEMO_NOSHOW[targetSeojaeId || ''] || [], [targetSeojaeId]);

  const quietMembers = useMemo(() =>
    DEMO_QUIET[targetSeojaeId || ''] || [], [targetSeojaeId]);

  if (!seojae) {
    return (
      <div className="fixed inset-0 z-40 bg-canvas animate-slide-up flex items-center justify-center">
        <div className="text-center px-8">
          <p className="text-[15px] text-sub">서재 정보를 찾을 수 없어요</p>
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

  // ── 출석 토글 ──
  function toggleAttendance(userId: string) {
    setAttendances(prev => prev.map(a =>
      a.userId === userId ? { ...a, attended: !a.attended } : a
    ));
    // TODO: Supabase attendances 테이블에 upsert + co_attendances count 증가
  }

  // ── 발제 질문 재생성 ──
  function regenerateQuestions() {
    setQuestions(buildDemoQuestions(guessCategory(targetSeojaeId || '')));
  }

  // ── 질문 사용 토글 ──
  function toggleQuestionUsed(id: string) {
    setQuestions(prev => prev.map(q =>
      q.id === id ? { ...q, isUsed: !q.isUsed } : q
    ));
  }

  // ── 메모 저장 ──
  function handleSaveMemo() {
    setMemoSaved(true);
    setTimeout(() => setMemoSaved(false), 2000);
    // TODO: Supabase session_notes 테이블에 upsert
  }

  // ── 약속 관리 ──
  function handleAddPromise() {
    if (!newPromise.trim()) return;
    setPromiseItems(prev => [...prev, newPromise.trim()]);
    setNewPromise('');
  }

  function handleDeletePromise(idx: number) {
    setPromiseItems(prev => prev.filter((_, i) => i !== idx));
  }

  function handleStartEditPromise(idx: number) {
    setEditingPromiseIdx(idx);
    setEditingPromiseText(promiseItems[idx]);
  }

  function handleFinishEditPromise() {
    if (editingPromiseIdx === null) return;
    if (editingPromiseText.trim()) {
      setPromiseItems(prev => prev.map((p, i) => i === editingPromiseIdx ? editingPromiseText.trim() : p));
    }
    setEditingPromiseIdx(null);
    setEditingPromiseText('');
  }

  function handleSavePromises() {
    setPromiseSaved(true);
    setTimeout(() => setPromiseSaved(false), 2000);
    // TODO: Supabase meeting_promises 테이블에 upsert
  }

  const attendedCount = attendances.filter(a => a.attended).length;

  return (
    <div className="fixed inset-0 z-40 bg-canvas animate-slide-up">
      <div className="flex flex-col min-h-dvh max-w-[430px] mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm px-5 pt-[58px] pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSubView(null)}
              className="press-scale w-[34px] h-[34px] rounded-full bg-canvas flex items-center justify-center"
            >
              <span className="text-[18px]">‹</span>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-[17px] font-semibold text-ink truncate">서재지기 콘솔</h1>
              <p className="text-[12px] text-sub truncate">{seojae.name}</p>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="bg-surface border-b border-border px-2">
          <div className="flex overflow-x-auto no-scrollbar">
            {TAB_LABELS.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-shrink-0 px-4 py-3 text-[13px] font-medium border-b-2 transition-colors ${
                  activeTab === t.key
                    ? 'text-action border-action'
                    : 'text-sub border-transparent'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto pb-24">

          {/* ── 1. 출석 체크 ── */}
          {activeTab === 'attendance' && (
            <div className="px-5 py-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
                    출석 체크
                  </h2>
                  <p className="text-[12px] text-sub mt-0.5">{today} 모임</p>
                </div>
                <span className="text-[13px] text-sub">
                  {attendedCount}/{attendances.length}명 출석
                </span>
              </div>

              <ul className="space-y-2">
                {attendances.map(a => (
                  <li key={a.userId}>
                    <button
                      onClick={() => toggleAttendance(a.userId)}
                      className="w-full flex items-center gap-3 p-3 rounded-[11px] bg-surface border border-border press-scale"
                    >
                      <div className="w-[36px] h-[36px] rounded-full overflow-hidden flex-shrink-0">
                        <img src={a.userAvatar} alt={a.userName} className="w-full h-full object-cover" />
                      </div>
                      <span className="flex-1 text-left text-[14px] text-ink font-medium">{a.userName}</span>
                      <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center transition-colors ${
                        a.attended ? 'bg-action' : 'bg-canvas border border-border'
                      }`}>
                        {a.attended && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>

              {attendedCount > 0 && (
                <p className="text-[12px] text-sub text-center mt-4">
                  출석한 멤버의 함께 모임 횟수가 자동으로 1회 추가됩니다
                </p>
              )}
            </div>
          )}

          {/* ── 2. 발제 질문 ── */}
          {activeTab === 'questions' && (
            <div className="px-5 py-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
                    발제 질문 8개
                  </h2>
                  <p className="text-[12px] text-sub mt-0.5">
                    장르: {guessCategory(targetSeojaeId || '')} 기반 자동 생성
                  </p>
                </div>
                <button
                  onClick={regenerateQuestions}
                  className="px-3 py-1.5 rounded-full border border-border text-[12px] font-medium text-sub press-scale"
                >
                  다시 뽑기
                </button>
              </div>

              {/* LLM 연동 안내 */}
              <div className="p-3 bg-action/5 rounded-[11px] mb-4">
                <p className="text-[12px] text-sub leading-[1.6]">
                  현재는 자료실의 발제 질문 200선에서 장르별로 자동 추출합니다.
                  향후 LLM 연동 시, 책 내용과 서재 대화 맥락을 반영한 맞춤 질문을 생성할 예정입니다.
                </p>
              </div>

              <ul className="space-y-2">
                {questions.map(q => (
                  <li key={q.id}>
                    <button
                      onClick={() => toggleQuestionUsed(q.id)}
                      className={`w-full text-left p-3.5 rounded-[11px] border transition-colors press-scale ${
                        q.isUsed
                          ? 'bg-action/5 border-action/30'
                          : 'bg-surface border-border'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className={`text-[13px] font-bold flex-shrink-0 mt-0.5 ${
                          q.isUsed ? 'text-action' : 'text-sub'
                        }`}>
                          {q.order}.
                        </span>
                        <p className={`text-[13.5px] leading-[1.65] ${
                          q.isUsed ? 'text-ink' : 'text-ink'
                        }`}>
                          {q.text}
                        </p>
                      </div>
                      {q.isUsed && (
                        <span className="inline-block mt-2 ml-6 text-[11px] text-action font-medium">
                          사용함
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              {/* ── 의견이 갈린 지점 ── */}
              <DivergentOpinionsSection />
            </div>
          )}

          {/* ── 3. 노쇼 집계 ── */}
          {activeTab === 'noshow' && (
            <div className="px-5 py-5">
              <div className="mb-4">
                <h2 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
                  노쇼 현황
                </h2>
                <p className="text-[12px] text-sub mt-0.5">
                  누적 2회 이상 불참한 멤버만 표시 (서재지기에게만 보입니다)
                </p>
              </div>

              {noShowMembers.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-canvas flex items-center justify-center mx-auto mb-3">
                    <span className="text-[24px]">&#10003;</span>
                  </div>
                  <p className="text-[14px] text-sub">노쇼 해당자가 없어요</p>
                  <p className="text-[12px] text-caption mt-1">모두 잘 참여하고 있습니다</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {noShowMembers.map(m => (
                    <li key={m.userId} className="flex items-center gap-3 p-3 rounded-[11px] bg-surface border border-border">
                      <div className="w-[36px] h-[36px] rounded-full overflow-hidden flex-shrink-0">
                        <img src={m.userAvatar} alt={m.userName} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[14px] text-ink font-medium">{m.userName}</span>
                      </div>
                      <span className="text-[13px] text-sub flex-shrink-0">
                        {m.missedCount}회 불참
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 p-3 bg-canvas rounded-[11px]">
                <p className="text-[12px] text-sub leading-[1.6]">
                  이 정보는 서재지기에게만 보이며, 해당 멤버에게는 표시되지 않습니다.
                  압박이 아닌 관심의 도구로 활용해주세요.
                </p>
              </div>
            </div>
          )}

          {/* ── 4. 조용한 회원 ── */}
          {activeTab === 'quiet' && (
            <div className="px-5 py-5">
              <div className="mb-4">
                <h2 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
                  조용한 회원
                </h2>
                <p className="text-[12px] text-sub mt-0.5">
                  3주 이상 기록이 없는 멤버 (사실만 표시, 점수/퍼센트 없음)
                </p>
              </div>

              {quietMembers.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-canvas flex items-center justify-center mx-auto mb-3">
                    <span className="text-[24px]">&#9825;</span>
                  </div>
                  <p className="text-[14px] text-sub">모두 활발하게 참여하고 있어요</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {quietMembers.map(m => (
                    <li key={m.userId} className="flex items-center gap-3 p-3 rounded-[11px] bg-surface border border-border">
                      <div className="w-[36px] h-[36px] rounded-full overflow-hidden flex-shrink-0">
                        <img src={m.userAvatar} alt={m.userName} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[14px] text-ink font-medium">{m.userName}</span>
                      </div>
                      <span className="text-[13px] text-sub flex-shrink-0">
                        {m.weeksSilent}주째 기록이 없어요
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 p-3 bg-canvas rounded-[11px]">
                <p className="text-[12px] text-sub leading-[1.6]">
                  조용한 멤버에게 가벼운 안부 메시지를 보내보세요.
                  &ldquo;요즘 뭐 읽고 있어요?&rdquo; 한 마디면 충분합니다.
                </p>
              </div>
            </div>
          )}

          {/* ── 5. 모임 메모 ── */}
          {activeTab === 'memo' && (
            <div className="px-5 py-5">
              <div className="mb-4">
                <h2 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
                  모임 메모
                </h2>
                <p className="text-[12px] text-sub mt-0.5">{today} 모임 기록</p>
              </div>

              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="오늘 모임에서 인상 깊었던 점, 다음에 바꿔볼 점 등을 자유롭게 기록하세요..."
                className="w-full h-[200px] p-4 bg-surface border border-border rounded-[14px] text-[14px] text-ink leading-[1.7] resize-none focus:outline-none focus:border-action/50 placeholder:text-inactive"
              />

              <div className="flex items-center justify-between mt-3">
                <span className="text-[12px] text-sub">
                  {memo.length}자
                </span>
                <button
                  onClick={handleSaveMemo}
                  disabled={!memo.trim()}
                  className="px-5 py-2.5 rounded-full bg-action text-white text-[13px] font-semibold disabled:opacity-40 press-scale"
                >
                  {memoSaved ? '저장됨' : '저장'}
                </button>
              </div>

              <div className="mt-6 p-3 bg-canvas rounded-[11px]">
                <p className="text-[12px] text-sub leading-[1.6]">
                  메모는 서재지기 본인만 볼 수 있습니다.
                  멤버에게 공유할 내용은 서재 채팅방에 올려주세요.
                </p>
              </div>
            </div>
          )}

          {/* ── 6. 회고 ── */}
          {activeTab === 'retrospective' && (
            <RetrospectiveTab />
          )}

          {/* ── 7. 약속 관리 ── */}
          {activeTab === 'promises' && (
            <div className="px-5 py-5">
              <div className="mb-4">
                <h2 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
                  모임 약속 관리
                </h2>
                <p className="text-[12px] text-sub mt-0.5">
                  여기서 정한 약속이 모임 상세에 표시됩니다
                </p>
              </div>

              <ul className="space-y-2 mb-4">
                {promiseItems.map((item, idx) => (
                  <li key={idx} className="bg-surface border border-border rounded-[11px]">
                    {editingPromiseIdx === idx ? (
                      <div className="p-3">
                        <textarea
                          value={editingPromiseText}
                          onChange={(e) => setEditingPromiseText(e.target.value)}
                          onBlur={handleFinishEditPromise}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleFinishEditPromise();
                            }
                          }}
                          autoFocus
                          className="w-full bg-canvas border border-border rounded-[8px] p-2.5 text-[13.5px] text-ink leading-[1.7] resize-none focus:outline-none focus:border-action/50"
                          rows={2}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3">
                        <button
                          onClick={() => handleStartEditPromise(idx)}
                          className="flex-1 text-left text-[13.5px] text-ink leading-[1.7]"
                        >
                          · {item}
                        </button>
                        <button
                          onClick={() => handleDeletePromise(idx)}
                          className="flex-shrink-0 w-[28px] h-[28px] rounded-full bg-canvas flex items-center justify-center text-sub press-scale"
                        >
                          <span className="text-[16px] leading-none">&times;</span>
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {/* 항목 추가 */}
              <div className="flex gap-2 mb-4">
                <input
                  value={newPromise}
                  onChange={(e) => setNewPromise(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPromise();
                    }
                  }}
                  placeholder="새 약속 항목을 입력하세요"
                  className="flex-1 px-3.5 py-2.5 bg-surface border border-border rounded-[11px] text-[13.5px] text-ink placeholder:text-inactive focus:outline-none focus:border-action/50"
                />
                <button
                  onClick={handleAddPromise}
                  disabled={!newPromise.trim()}
                  className="flex-shrink-0 px-4 py-2.5 rounded-[11px] bg-action text-white text-[13px] font-semibold disabled:opacity-40 press-scale"
                >
                  추가
                </button>
              </div>

              {/* 저장 버튼 */}
              <div className="flex justify-end">
                <button
                  onClick={handleSavePromises}
                  disabled={promiseItems.length === 0}
                  className="px-5 py-2.5 rounded-full bg-action text-white text-[13px] font-semibold disabled:opacity-40 press-scale"
                >
                  {promiseSaved ? '저장됨' : '저장'}
                </button>
              </div>

              <div className="mt-6 p-3 bg-canvas rounded-[11px]">
                <p className="text-[12px] text-sub leading-[1.6]">
                  약속은 모임 상세 화면에서 참가자에게 표시됩니다.
                  항목을 탭하면 수정할 수 있고, &times; 버튼으로 삭제할 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── 회고 탭 ── */

function RetrospectiveTab() {
  const retros = DEMO_RETROSPECTIVES;

  if (retros.length === 0) {
    return (
      <div className="px-5 py-5">
        <div className="py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-canvas flex items-center justify-center mx-auto mb-3">
            <span className="text-[24px]">&#9998;</span>
          </div>
          <p className="text-[14px] text-sub">아직 회고가 없어요</p>
          <p className="text-[12px] text-caption mt-1">모임 후 참가자들이 회고를 남기면 여기에 표시됩니다</p>
        </div>
      </div>
    );
  }

  // 이벤트별 그룹
  const eventIds = [...new Set(retros.map(r => r.eventId))];

  return (
    <div className="px-5 py-5">
      {eventIds.map(eventId => {
        const event = MOCK_OFFLINE_EVENTS.find(ev => ev.id === eventId);
        const group = retros.filter(r => r.eventId === eventId);
        const total = group.length;
        const bookTitle = event?.book?.title || '모임';

        // 사실 기반 요약
        const goodCount = group.filter(r => r.bookRating === 'good').length;
        const okayCount = group.filter(r => r.bookRating === 'okay').length;
        const disappointingCount = group.filter(r => r.bookRating === 'disappointing').length;

        const divergeALot = group.filter(r => r.opinionDivergence === 'a_lot').length;
        const divergeSome = group.filter(r => r.opinionDivergence === 'some').length;

        const returnYes = group.filter(r => r.returnIntent === 'yes').length;
        const returnUndecided = group.filter(r => r.returnIntent === 'undecided').length;

        const freeTexts = group.filter(r => r.freeText.trim());

        return (
          <div key={eventId}>
            <div className="mb-4">
              <h2 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
                《{bookTitle}》 회고 요약
              </h2>
              <p className="text-[12px] text-sub mt-0.5">{total}명이 회고를 남겼어요</p>
            </div>

            {/* 책 평가 */}
            <div className="bg-surface border border-border rounded-[14px] p-4 mb-3">
              <p className="text-[13px] font-semibold text-ink mb-2">책은 어땠나요</p>
              <div className="space-y-1.5">
                {goodCount > 0 && (
                  <p className="text-[13px] text-ink/80 leading-[1.65]">
                    {total}명 중 {goodCount}명이 &ldquo;좋았다&rdquo;고 답했어요
                  </p>
                )}
                {okayCount > 0 && (
                  <p className="text-[13px] text-ink/80 leading-[1.65]">
                    {okayCount}명이 &ldquo;보통&rdquo;이라고 답했어요
                  </p>
                )}
                {disappointingCount > 0 && (
                  <p className="text-[13px] text-ink/80 leading-[1.65]">
                    {disappointingCount}명이 &ldquo;아쉽다&rdquo;고 답했어요
                  </p>
                )}
              </div>
            </div>

            {/* 의견 갈림 */}
            <div className="bg-surface border border-border rounded-[14px] p-4 mb-3">
              <p className="text-[13px] font-semibold text-ink mb-2">의견이 갈렸나요</p>
              <div className="space-y-1.5">
                {divergeALot > 0 && (
                  <p className="text-[13px] text-ink/80 leading-[1.65]">
                    {divergeALot}명이 &ldquo;많이 갈렸다&rdquo;고 답했어요
                  </p>
                )}
                {divergeSome > 0 && (
                  <p className="text-[13px] text-ink/80 leading-[1.65]">
                    {divergeSome}명이 &ldquo;조금&rdquo;이라고 답했어요
                  </p>
                )}
              </div>
            </div>

            {/* 다음 참여 의향 */}
            <div className="bg-surface border border-border rounded-[14px] p-4 mb-3">
              <p className="text-[13px] font-semibold text-ink mb-2">다음에도 오시겠어요</p>
              <div className="space-y-1.5">
                {returnYes > 0 && (
                  <p className="text-[13px] text-ink/80 leading-[1.65]">
                    {returnYes}명이 &ldquo;네&rdquo;라고 답했어요
                  </p>
                )}
                {returnUndecided > 0 && (
                  <p className="text-[13px] text-ink/80 leading-[1.65]">
                    {returnUndecided}명이 &ldquo;미정&rdquo;이라고 답했어요
                  </p>
                )}
              </div>
            </div>

            {/* 자유 텍스트 응답 */}
            {freeTexts.length > 0 && (
              <div className="bg-surface border border-border rounded-[14px] p-4 mb-3">
                <p className="text-[13px] font-semibold text-ink mb-3">참가자 한 줄</p>
                <div className="space-y-2.5">
                  {freeTexts.map(r => {
                    const userName = r.userId === 'u1' ? '이도윤' : r.userId === 'u2' ? '한소율' : r.userId === 'u3' ? '장서연' : r.userId === 'u4' ? '박지환' : '참가자';
                    return (
                      <div key={r.id} className="border-l-[2px] border-border pl-3">
                        <p className="text-[13px] text-ink/80 leading-[1.65]">{r.freeText}</p>
                        <p className="text-[11px] text-sub mt-0.5">— {userName}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-canvas rounded-[11px]">
              <p className="text-[12px] text-sub leading-[1.6]">
                회고 데이터는 서재지기에게만 공개됩니다.
                참가자의 답변은 익명으로 집계되며, 사실만 표시합니다.
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── 의견이 갈린 지점 ── */

interface OpinionPair {
  book: { title: string; author: string };
  a: { userName: string; reason: string; sentiment: HighlightSentiment };
  b: { userName: string; reason: string; sentiment: HighlightSentiment };
}

function findDivergentPairs(): OpinionPair[] {
  const pairs: OpinionPair[] = [];
  const grouped = new Map<string, Highlight[]>();

  // 같은 책 ISBN으로 그룹
  for (const h of MOCK_HIGHLIGHTS) {
    if (!h.sentiment) continue;
    const list = grouped.get(h.book.isbn) || [];
    list.push(h);
    grouped.set(h.book.isbn, list);
  }

  for (const [, list] of grouped) {
    const positives = list.filter(h => h.sentiment === 'positive');
    const contraries = list.filter(h => h.sentiment === 'contrary');
    const reserveds = list.filter(h => h.sentiment === 'reserved');

    // positive ↔ contrary 쌍
    if (positives.length > 0 && contraries.length > 0) {
      const a = positives[0];
      const b = contraries[0];
      pairs.push({
        book: { title: a.book.title, author: a.book.author },
        a: { userName: a.userName, reason: a.reason, sentiment: a.sentiment! },
        b: { userName: b.userName, reason: b.reason, sentiment: b.sentiment! },
      });
    }
    // positive ↔ reserved 쌍 (contrary 없을 때)
    else if (positives.length > 0 && reserveds.length > 0) {
      const a = positives[0];
      const b = reserveds[0];
      pairs.push({
        book: { title: a.book.title, author: a.book.author },
        a: { userName: a.userName, reason: a.reason, sentiment: a.sentiment! },
        b: { userName: b.userName, reason: b.reason, sentiment: b.sentiment! },
      });
    }
  }

  return pairs;
}

function DivergentOpinionsSection() {
  const pairs = useMemo(() => findDivergentPairs(), []);

  if (pairs.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="mb-4">
        <h3 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
          의견이 갈린 지점
        </h3>
        <p className="text-[12px] text-sub mt-0.5">
          같은 책을 읽고 다른 생각을 남긴 멤버들
        </p>
      </div>

      <div className="space-y-3">
        {pairs.map((pair, idx) => (
          <div key={idx} className="bg-surface border border-border rounded-[14px] p-4">
            <p className="text-[12px] text-sub font-medium mb-3">
              《{pair.book.title}》 · {pair.book.author}
            </p>

            {/* 의견 A */}
            <div className="mb-3">
              <span className="text-[12px] font-semibold text-ink">{pair.a.userName}</span>
              <p className="text-[12.5px] text-ink/80 leading-[1.65] mt-1 line-clamp-2">
                {pair.a.reason}
              </p>
            </div>

            {/* 구분선 */}
            <div className="border-t border-border my-2" />

            {/* 의견 B */}
            <div>
              <span className="text-[12px] font-semibold text-ink">{pair.b.userName}</span>
              <p className="text-[12.5px] text-ink/80 leading-[1.65] mt-1 line-clamp-2">
                {pair.b.reason}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[12px] text-sub text-center mt-4">
        이 지점에서 대화를 시작해보세요
      </p>
    </div>
  );
}
