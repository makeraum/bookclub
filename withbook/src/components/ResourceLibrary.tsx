'use client';

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TIMETABLE_2H,
  SILENCE_PHRASES,
  DISCUSSION_QUESTIONS,
  FAILURE_PATTERNS,
  STARTER_KIT,
  OPERATION_DASHBOARD,
  BOOK_SELECTION_CRITERIA,
} from '../lib/resource-data';

const TABS = [
  '진행표',
  '발제 질문',
  '이렇게 하면 망합니다',
  '스타터 키트',
  '운영 숫자',
  '책 선정 기준',
] as const;

type TabName = (typeof TABS)[number];

export default function ResourceLibrary() {
  const { setSubView } = useApp();
  const [activeTab, setActiveTab] = useState<TabName>('진행표');

  return (
    <div className="flex flex-col min-h-dvh bg-canvas animate-fade">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm px-5 pt-[58px] pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSubView(null)}
            className="press-scale w-[34px] h-[34px] rounded-full bg-canvas flex items-center justify-center"
          >
            <span className="text-[18px]">‹</span>
          </button>
          <h1
            className="text-[17px] font-semibold text-ink"
            style={{ letterSpacing: '-0.3px' }}
          >
            자료실
          </h1>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="sticky top-[107px] z-10 bg-surface/95 backdrop-blur-sm border-b border-border">
        <div className="flex gap-2 px-5 py-3 overflow-x-auto hide-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`press-scale px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 border whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-ink text-white border-transparent'
                  : 'bg-transparent text-ink border-chip-border'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === '진행표' && <TimetableTab />}
        {activeTab === '발제 질문' && <DiscussionTab />}
        {activeTab === '이렇게 하면 망합니다' && <FailurePatternsTab />}
        {activeTab === '스타터 키트' && <StarterKitTab />}
        {activeTab === '운영 숫자' && <DashboardTab />}
        {activeTab === '책 선정 기준' && <BookCriteriaTab />}
      </div>

      {/* CC License footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-sm border-t border-border px-5 py-3 safe-bottom">
        <p className="text-[11px] text-caption text-center leading-[1.5]">
          위드북(WithBook) 서재 키트 · 크레딧 표기 시 상업적 이용 외 전부 허용
        </p>
      </div>
    </div>
  );
}

/* ── 진행표 탭 ── */
function TimetableTab() {
  return (
    <div className="px-5 pt-5">
      <h2
        className="text-[17px] font-semibold text-ink mb-1"
        style={{ letterSpacing: '-0.3px' }}
      >
        2시간 서재 진행표
      </h2>
      <p className="text-[13px] text-sub mb-4">
        처음 진행하는 분도 따라 할 수 있는 분 단위 가이드
      </p>

      <div className="space-y-2.5">
        {TIMETABLE_2H.map((item, i) => (
          <div
            key={i}
            className="bg-surface rounded-[14px] border border-border p-4"
          >
            <div className="flex items-start gap-3">
              <span className="text-[12px] font-mono font-semibold text-action bg-action/10 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                {item.time}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-ink leading-snug">
                  {item.activity}
                </p>
                {item.tip && (
                  <p className="text-[12.5px] text-sub mt-1 leading-[1.6]">
                    {item.tip}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 침묵이 흐를 때 */}
      <div className="mt-8 mb-6">
        <h3
          className="text-[17px] font-semibold text-ink mb-1"
          style={{ letterSpacing: '-0.3px' }}
        >
          침묵이 흐를 때
        </h3>
        <p className="text-[13px] text-sub mb-4">
          진행자가 침묵을 부드럽게 깨는 문장 20개
        </p>

        <div className="space-y-2">
          {SILENCE_PHRASES.map((phrase, i) => (
            <div
              key={i}
              className="bg-surface rounded-[11px] border border-border px-4 py-3 flex items-start gap-3"
            >
              <span className="text-[12px] font-mono text-caption flex-shrink-0 mt-0.5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-[13.5px] text-ink leading-[1.6]">
                &ldquo;{phrase}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 발제 질문 탭 ── */
function DiscussionTab() {
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  const toggle = (category: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className="px-5 pt-5">
      <h2
        className="text-[17px] font-semibold text-ink mb-1"
        style={{ letterSpacing: '-0.3px' }}
      >
        발제 질문 200선
      </h2>
      <p className="text-[13px] text-sub mb-4">
        장르별 보편적 질문 — 어떤 책이든 바로 쓸 수 있습니다
      </p>

      <div className="space-y-3 mb-6">
        {DISCUSSION_QUESTIONS.map(({ category, questions }) => {
          const isOpen = openCategories.has(category);
          return (
            <div
              key={category}
              className="bg-surface rounded-[14px] border border-border overflow-hidden"
            >
              <button
                onClick={() => toggle(category)}
                className="w-full flex items-center justify-between px-4 py-4 press-scale"
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 bg-ink text-white text-[11px] font-semibold rounded-full">
                    {category}
                  </span>
                  <span className="text-[13px] text-sub">
                    {questions.length}개
                  </span>
                </div>
                <span
                  className={`text-[16px] text-sub transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                >
                  ›
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-border px-4 pb-4 animate-fade">
                  <div className="space-y-2 pt-3">
                    {questions.map((q, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="text-[11px] font-mono text-caption flex-shrink-0 mt-1 w-[20px] text-right">
                          {i + 1}
                        </span>
                        <p className="text-[13px] text-ink leading-[1.7]">
                          {q}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── 이렇게 하면 망합니다 탭 ── */
function FailurePatternsTab() {
  return (
    <div className="px-5 pt-5">
      <h2
        className="text-[17px] font-semibold text-ink mb-1"
        style={{ letterSpacing: '-0.3px' }}
      >
        이렇게 하면 망합니다
      </h2>
      <p className="text-[13px] text-sub mb-4">
        실패한 진행 방식 {FAILURE_PATTERNS.length}가지 — 반면교사로 삼으세요
      </p>

      <div className="space-y-3 mb-6">
        {FAILURE_PATTERNS.map((item, i) => (
          <div
            key={i}
            className="bg-surface rounded-[14px] border border-border p-4"
          >
            <div className="flex items-start gap-3">
              <span className="text-[14px] flex-shrink-0 mt-0.5">✕</span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-ink leading-snug">
                  {item.title}
                </p>
                <p className="text-[12.5px] text-sub mt-1.5 leading-[1.6]">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 스타터 키트 탭 ── */
function StarterKitTab() {
  return (
    <div className="px-5 pt-5">
      <h2
        className="text-[17px] font-semibold text-ink mb-1"
        style={{ letterSpacing: '-0.3px' }}
      >
        서재 개설 스타터 키트
      </h2>
      <p className="text-[13px] text-sub mb-4">
        {STARTER_KIT.length}단계 체크리스트 — 이것만 따라하면 서재가 열립니다
      </p>

      <div className="space-y-3 mb-6">
        {STARTER_KIT.map((item, i) => (
          <div
            key={i}
            className="bg-surface rounded-[14px] border border-border p-4"
          >
            <div className="flex items-start gap-3">
              <span className="w-[28px] h-[28px] rounded-full bg-action/10 text-action text-[13px] font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-ink leading-snug">
                  {item.step}
                </p>
                <p className="text-[12.5px] text-sub mt-1.5 leading-[1.6]">
                  {item.detail}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 운영 숫자 탭 ── */
function DashboardTab() {
  return (
    <div className="px-5 pt-5">
      <h2
        className="text-[17px] font-semibold text-ink mb-1"
        style={{ letterSpacing: '-0.3px' }}
      >
        운영 숫자 대시보드
      </h2>
      <p className="text-[13px] text-sub mb-4">
        위드북 커뮤니티의 실시간 지표
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {OPERATION_DASHBOARD.map((item, i) => (
          <div
            key={i}
            className="bg-surface rounded-[14px] border border-border p-4 flex flex-col"
          >
            <p className="text-[12px] text-sub font-medium mb-1">
              {item.label}
            </p>
            <p className="text-[22px] font-bold text-ink">{item.value}</p>
            {item.note && (
              <p className="text-[11px] text-caption mt-1">{item.note}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 책 선정 기준 탭 ── */
function BookCriteriaTab() {
  return (
    <div className="px-5 pt-5">
      <h2
        className="text-[17px] font-semibold text-ink mb-1"
        style={{ letterSpacing: '-0.3px' }}
      >
        책 선정 기준
      </h2>
      <p className="text-[13px] text-sub mb-4">
        좋은 책을 고르는 {BOOK_SELECTION_CRITERIA.length}가지 기준
      </p>

      <div className="space-y-3 mb-6">
        {BOOK_SELECTION_CRITERIA.map((item, i) => (
          <div
            key={i}
            className="bg-surface rounded-[14px] border border-border p-4"
          >
            <div className="flex items-start gap-3">
              <span className="text-[14px] flex-shrink-0 mt-0.5">◎</span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-ink leading-snug">
                  {item.title}
                </p>
                <p className="text-[12.5px] text-sub mt-1.5 leading-[1.6]">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
