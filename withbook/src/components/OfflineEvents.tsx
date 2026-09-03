'use client';

import { useState, useMemo } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import { useApp } from '../context/AppContext';
import {
  MOCK_OFFLINE_EVENTS,
  MOCK_CITY_COMMUNITIES,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_COLORS,
  PLACEHOLDER_COLORS,
  DEFAULT_PROMISES,
} from '../lib/mock-data';
import HostProfileCard from './HostProfileCard';
import RegionSelector from './ui/RegionSelector';
import { ChipRow, FilterChip, FilterDivider, FilterLabel } from './ui/FilterChips';
import { ALL_REGIONS, matchesRegion, regionSummaryParts, type RegionSelection } from '../lib/regions';
import type { OfflineEvent, EventType, HighlightStats } from '../lib/types';

export default function OfflineEvents() {
  const { appliedEvents, profile, gates, highlightStats, myCityRegion, setSubView, isTestMode, pendingRetrospectiveEventId, openRetrospective } = useApp();
  const myCommunity = MOCK_CITY_COMMUNITIES.find(c => c.region === myCityRegion);
  const [selectedEvent, setSelectedEvent] = useState<OfflineEvent | null>(null);
  const [showGateLock, setShowGateLock] = useState(false);
  const [typeFilter, setTypeFilter] = useState<EventType | null>(null);
  const [regionFilter, setRegionFilter] = useState<RegionSelection>(ALL_REGIONS);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const filteredEvents = useMemo(() => {
    return MOCK_OFFLINE_EVENTS.filter(ev => {
      if (typeFilter && ev.type !== typeFilter) return false;
      if (!matchesRegion(regionFilter, ev.region)) return false;
      if (selectedDate !== null) {
        const evDay = new Date(ev.date).getDate();
        if (evDay !== selectedDate) return false;
      }
      return true;
    });
  }, [typeFilter, regionFilter, selectedDate]);

  const hasFilterSelection = typeFilter !== null || regionFilter.province !== null;
  const filterSummary = useMemo(() => {
    const typeLabel = typeFilter ? EVENT_TYPE_LABELS[typeFilter] : '전체 종류';
    return [...regionSummaryParts(regionFilter), typeLabel].join(' · ');
  }, [typeFilter, regionFilter]);

  const handleEventTap = (ev: OfflineEvent) => {
    // rotation(북 라운지) 타입은 Gate 2 필요
    if (ev.type === 'rotation' && !gates.gate2At && !isTestMode) {
      setShowGateLock(true);
      return;
    }
    setSelectedEvent(ev);
  };

  if (showGateLock) {
    return (
      <GateLockCard
        highlightStats={highlightStats}
        gate1At={gates.gate1At}
        onBack={() => setShowGateLock(false)}
      />
    );
  }

  if (selectedEvent) {
    return (
      <EventDetail
        event={selectedEvent}
        applied={appliedEvents.has(selectedEvent.id)}
        onBack={() => setSelectedEvent(null)}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-canvas">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm px-5 pt-[58px] pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
            참가
          </h1>
          <button
            onClick={() => setSubView('resourceLibrary')}
            className="text-[13px] text-action font-medium press-scale"
          >
            자료실
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* 도시 커뮤니티 헤더 */}
        {myCommunity && (
          <div className="px-5 pt-4 pb-2">
            <div className="bg-surface rounded-[14px] border border-border px-4 py-3 flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-ink text-white text-[10.5px] font-semibold rounded-full">
                {myCommunity.region}
              </span>
              <span className="text-[14px] font-semibold text-ink">{myCommunity.name}</span>
              <span className="text-[12px] text-sub">·</span>
              <span className="text-[12px] text-sub">9월 기수</span>
              <span className="text-[12px] text-sub">·</span>
              <span className="text-[12px] text-sub">{myCommunity.memberCount}/{myCommunity.maxMembers}명</span>
            </div>
          </div>
        )}

        {/* Retrospective prompt */}
        {pendingRetrospectiveEventId && (() => {
          const retroEvent = MOCK_OFFLINE_EVENTS.find(ev => ev.id === pendingRetrospectiveEventId);
          if (!retroEvent) return null;
          const bookTitle = retroEvent.book?.title || '모임';
          return (
            <div className="px-5 pt-4">
              <div className="bg-surface rounded-[18px] border border-border p-5">
                <p className="text-[11px] font-semibold text-action tracking-[0.3px] uppercase mb-2">30초 회고</p>
                <h3 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
                  《{bookTitle}》 모임은 어땠나요?
                </h3>
                <p className="text-[12.5px] text-sub mt-1">30초면 됩니다</p>
                <button
                  onClick={() => openRetrospective(pendingRetrospectiveEventId)}
                  className="press-scale mt-3 px-5 py-2.5 bg-action text-white text-[13px] font-semibold rounded-full"
                >
                  회고 남기기
                </button>
              </div>
            </div>
          );
        })()}

        {/* Filter card — 모임 종류 / 지역 한 카드에 묶음 */}
        <div className="px-5 pt-4 pb-3">
          <div className="bg-surface rounded-[16px] border border-border p-4">
            {/* 모임 종류 */}
            <FilterLabel>모임 종류</FilterLabel>
            <ChipRow>
              <FilterChip
                label="전체"
                selected={typeFilter === null}
                onTap={() => setTypeFilter(null)}
              />
              {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map(t => (
                <FilterChip
                  key={t}
                  label={EVENT_TYPE_LABELS[t]}
                  selected={typeFilter === t}
                  onTap={() => setTypeFilter(typeFilter === t ? null : t)}
                />
              ))}
            </ChipRow>

            <FilterDivider />

            {/* 지역 — 시·도 → 세부 지역 2단 */}
            <RegionSelector value={regionFilter} onChange={setRegionFilter} />

            {/* 현재 선택 요약 */}
            <div
              className="mt-4 pt-3 flex items-center justify-between gap-3"
              style={{ borderTop: '1px solid #f5f5f7' }}
            >
              <p className="text-[12px] truncate" style={{ color: '#86868b' }}>
                {filterSummary}
              </p>
              {hasFilterSelection && (
                <button
                  onClick={() => {
                    setTypeFilter(null);
                    setRegionFilter(ALL_REGIONS);
                  }}
                  className="press-scale focus-ring text-[12px] font-medium text-action flex-shrink-0"
                >
                  초기화
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mini calendar */}
        <MiniCalendar
          events={MOCK_OFFLINE_EVENTS}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          typeFilter={typeFilter}
          regionFilter={regionFilter}
        />

        {/* Event cards */}
        <section className="px-5 pt-4 pb-4">
          {filteredEvents.length > 0 ? (
            <div className="space-y-3">
              {filteredEvents.map(ev => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  applied={appliedEvents.has(ev.id)}
                  onTap={() => handleEventTap(ev)}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-[32px] mb-2">📭</p>
              <p className="text-[14px] text-sub">조건에 맞는 행사가 없어요</p>
              <button
                onClick={() => {
                  setTypeFilter(null);
                  setRegionFilter(ALL_REGIONS);
                  setSelectedDate(null);
                }}
                className="mt-3 text-[13px] text-action font-medium"
              >
                필터 초기화
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ── Mini Calendar ── */
function MiniCalendar({
  events,
  selectedDate,
  onSelectDate,
  typeFilter,
  regionFilter,
}: {
  events: OfflineEvent[];
  selectedDate: number | null;
  onSelectDate: (d: number | null) => void;
  typeFilter: EventType | null;
  regionFilter: RegionSelection;
}) {
  const year = 2026;
  const month = 8; // September (0-indexed)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  const eventDays = useMemo(() => {
    const days = new Set<number>();
    events.forEach(ev => {
      if (typeFilter && ev.type !== typeFilter) return;
      if (!matchesRegion(regionFilter, ev.region)) return;
      const d = new Date(ev.date).getDate();
      days.add(d);
    });
    return days;
  }, [events, typeFilter, regionFilter]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="mx-5 bg-surface rounded-[18px] border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-semibold text-ink">2026년 9월</h3>
        {selectedDate !== null && (
          <button
            onClick={() => onSelectDate(null)}
            className="text-[12px] text-action font-medium"
          >
            날짜 초기화
          </button>
        )}
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {dayNames.map(name => (
          <div key={name} className="text-center text-[11px] text-sub font-medium py-1">
            {name}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-0">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="h-9" />;
          const hasEvent = eventDays.has(day);
          const isSelected = selectedDate === day;

          return (
            <button
              key={day}
              onClick={() => {
                if (hasEvent) onSelectDate(isSelected ? null : day);
              }}
              className={`h-9 flex flex-col items-center justify-center rounded-full relative transition-colors ${
                isSelected
                  ? 'bg-action text-white'
                  : hasEvent
                  ? 'text-ink'
                  : 'text-inactive'
              }`}
            >
              <span className="text-[13px] font-medium">{day}</span>
              {hasEvent && !isSelected && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-action" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Event Card ── */
function EventCard({
  event,
  applied,
  onTap,
}: {
  event: OfflineEvent;
  applied: boolean;
  onTap: () => void;
}) {
  const isFull = event.currentParticipants >= event.maxParticipants;
  const dateObj = new Date(event.date);
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dateStr = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일 (${dayNames[dateObj.getDay()]})`;

  return (
    <button
      onClick={onTap}
      className="press-scale w-full bg-surface rounded-[18px] border border-border p-4 text-left"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full"
            style={{
              backgroundColor: EVENT_TYPE_COLORS[event.type].bg,
              color: EVENT_TYPE_COLORS[event.type].text,
            }}
          >
            {EVENT_TYPE_LABELS[event.type]}
          </span>
          {applied && (
            <span className="px-2 py-0.5 bg-action/10 text-action text-[10.5px] font-semibold rounded-full">
              신청완료
            </span>
          )}
        </div>
        {isFull && (
          <span className="text-[10.5px] font-semibold text-sub bg-canvas px-2 py-0.5 rounded-full">
            마감
          </span>
        )}
      </div>

      <h4 className="text-[15px] font-semibold text-ink leading-snug mb-1">{event.title}</h4>
      {event.type === 'rotation' && (
        <p className="text-[12px] text-sub mb-2 leading-relaxed">
          책 취향이 닿는 사람들과 돌아가며 이야기하는 자리
        </p>
      )}

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-sub">📅</span>
          <span className="text-[12.5px] text-sub">{dateStr} {event.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-sub">📍</span>
          <span className="text-[12.5px] text-sub">{event.venue}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-sub">👥</span>
          <span className="text-[12.5px] text-sub">
            {event.currentParticipants}/{event.maxParticipants}명
          </span>
          <span className="text-[12.5px] text-sub">·</span>
          <span className="text-[12.5px] text-sub">
            {event.fee > 0 ? `${event.fee.toLocaleString()}원` : '무료'}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ── Event Detail ── */
function EventDetail({
  event,
  applied,
  onBack,
}: {
  event: OfflineEvent;
  applied: boolean;
  onBack: () => void;
}) {
  const { applyEvent, cancelEvent, profile } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState(profile.name || '');
  const [phone, setPhone] = useState('');
  const [showPromiseModal, setShowPromiseModal] = useState(false);
  const [promiseChecked, setPromiseChecked] = useState(false);

  const promises = DEFAULT_PROMISES[event.type];
  const promiseStorageKey = `withbook-promise-confirmed-${event.id}`;
  const isPromiseConfirmed = typeof window !== 'undefined' && localStorage.getItem(promiseStorageKey) === 'true';

  const isFull = event.currentParticipants >= event.maxParticipants && !applied;
  const dateObj = new Date(event.date);
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dateStr = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일 (${dayNames[dateObj.getDay()]})`;
  const bookColor = event.book
    ? PLACEHOLDER_COLORS[parseInt(event.book.isbn) % PLACEHOLDER_COLORS.length]
    : undefined;

  function handleApply() {
    // 약속 확인 안 했으면 모달 먼저
    if (!isPromiseConfirmed && !showForm) {
      setShowPromiseModal(true);
      return;
    }
    if (!showForm) {
      setShowForm(true);
      return;
    }
    if (!name.trim() || !phone.trim()) return;
    applyEvent(event.id);
    setShowForm(false);
  }

  function handlePromiseConfirm() {
    localStorage.setItem(promiseStorageKey, 'true');
    setShowPromiseModal(false);
    setPromiseChecked(false);
    setShowForm(true);
  }

  function handleCancel() {
    cancelEvent(event.id);
  }

  return (
    <div className="flex flex-col min-h-dvh bg-canvas animate-slide-up">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm px-5 pt-[58px] pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="press-scale w-[34px] h-[34px] rounded-full bg-canvas flex items-center justify-center"
          >
            <span className="text-[18px]">‹</span>
          </button>
          <h1 className="text-[17px] font-semibold text-ink truncate">{event.title}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
        {/* Hero */}
        <div className="bg-surface px-5 py-6 flex flex-col items-center border-b border-border">
          <span
            className="px-3 py-1 text-[12px] font-semibold rounded-full mb-3"
            style={{
              backgroundColor: EVENT_TYPE_COLORS[event.type].bg,
              color: EVENT_TYPE_COLORS[event.type].text,
            }}
          >
            {EVENT_TYPE_LABELS[event.type]}
          </span>
          <h2
            className="text-[19px] font-semibold text-ink text-center"
            style={{ letterSpacing: '-0.3px' }}
          >
            {event.title}
          </h2>
          <p className="text-[13px] text-sub mt-1">
            {event.currentParticipants}/{event.maxParticipants}명 참여 중
          </p>
        </div>

        {/* Info card */}
        <div className="bg-surface mt-3 px-5 py-4 border-b border-border space-y-3">
          <div className="flex items-center gap-3 p-3 bg-action/5 rounded-[11px]">
            <div className="w-10 h-10 rounded-full bg-action/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[18px]">📅</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-action">일시</p>
              <p className="text-[14px] font-medium text-ink">{dateStr} {event.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-canvas rounded-[11px]">
            <div className="w-10 h-10 rounded-full bg-canvas flex items-center justify-center flex-shrink-0 border border-border">
              <span className="text-[18px]">📍</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-sub">장소</p>
              <p className="text-[14px] font-medium text-ink">{event.venue}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-canvas rounded-[11px]">
            <div className="w-10 h-10 rounded-full bg-canvas flex items-center justify-center flex-shrink-0 border border-border">
              <span className="text-[18px]">💰</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-sub">참가비</p>
              <p className="text-[14px] font-medium text-ink">
                {event.fee > 0 ? `${event.fee.toLocaleString()}원` : '무료'}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-surface mt-3 px-5 py-5 border-b border-border">
          <h3
            className="text-[15px] font-semibold text-ink mb-2"
            style={{ letterSpacing: '-0.3px' }}
          >
            모임 소개
          </h3>
          <p className="text-[13.5px] text-sub leading-[1.7]">{event.description}</p>
        </div>

        {/* Book (bookclub only) */}
        {event.book && (
          <div className="bg-surface mt-3 px-5 py-5 border-b border-border">
            <h3
              className="text-[15px] font-semibold text-ink mb-3"
              style={{ letterSpacing: '-0.3px' }}
            >
              함께 읽는 책
            </h3>
            <div className="flex items-center gap-3 p-3 bg-canvas rounded-[11px]">
              <div className="w-[42px] h-[58px] rounded-[6px] overflow-hidden flex-shrink-0">
                {event.book.coverUrl ? (
                  <img
                    src={event.book.coverUrl}
                    alt={event.book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: bookColor }}
                  >
                    <span className="text-white text-[8px]">{event.book.title[0]}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-ink">{event.book.title}</p>
                <p className="text-[12px] text-sub">{event.book.author}</p>
              </div>
            </div>
          </div>
        )}

        {/* Host */}
        <HostProfileCard
          hostId={event.hostId}
          hostName={event.host}
          sectionTitle="주최자"
          book={event.book}
        />

        {/* 이 모임의 약속 */}
        <div className="bg-surface mt-3 px-5 py-5 border-b border-border">
          <h3
            className="text-[15px] font-semibold text-ink mb-3"
            style={{ letterSpacing: '-0.3px' }}
          >
            이 모임의 약속
          </h3>
          <div className="bg-canvas rounded-[14px] p-4">
            <ul className="space-y-1.5">
              {promises.map((p, i) => (
                <li key={i} className="text-[13.5px] text-ink leading-[1.7]">
                  · {p}
                </li>
              ))}
            </ul>
            <p className="text-[11.5px] text-caption mt-3">약속은 서재지기가 정합니다</p>
          </div>
        </div>

        {/* Application form */}
        {showForm && !applied && (
          <div className="bg-surface mt-3 px-5 py-5 border-b border-border animate-slide-up">
            <h3
              className="text-[15px] font-semibold text-ink mb-3"
              style={{ letterSpacing: '-0.3px' }}
            >
              신청 정보
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[12px] text-sub font-medium mb-1 block">이름</label>
                <Input value={name} onChange={setName} placeholder="이름을 입력해주세요" />
              </div>
              <div>
                <label className="text-[12px] text-sub font-medium mb-1 block">연락처</label>
                <Input
                  value={phone}
                  onChange={setPhone}
                  placeholder="010-0000-0000"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-surface/95 backdrop-blur-sm border-t border-border safe-bottom">
        {applied ? (
          <Button variant="outline" onClick={handleCancel}>
            신청 취소하기
          </Button>
        ) : (
          <Button
            onClick={handleApply}
            disabled={isFull || (showForm && (!name.trim() || !phone.trim()))}
          >
            {isFull ? '마감되었어요' : '신청하기'}
          </Button>
        )}
      </div>

      {/* 약속 확인 바텀시트 */}
      {showPromiseModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => { setShowPromiseModal(false); setPromiseChecked(false); }}
          />
          <div className="relative w-full max-w-[430px] bg-surface rounded-t-[20px] px-5 pt-6 pb-8 safe-bottom animate-slide-up">
            <h3
              className="text-[17px] font-semibold text-ink mb-4"
              style={{ letterSpacing: '-0.3px' }}
            >
              이 모임의 약속
            </h3>
            <div className="bg-canvas rounded-[14px] p-4 mb-5">
              <ul className="space-y-1.5">
                {promises.map((p, i) => (
                  <li key={i} className="text-[13.5px] text-ink leading-[1.7]">
                    · {p}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setPromiseChecked(!promiseChecked)}
              className="flex items-center gap-3 mb-5 w-full"
            >
              <div className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center flex-shrink-0 transition-colors ${
                promiseChecked ? 'bg-action' : 'bg-canvas border border-border'
              }`}>
                {promiseChecked && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className="text-[14px] text-ink font-medium">읽었습니다</span>
            </button>
            <button
              onClick={handlePromiseConfirm}
              disabled={!promiseChecked}
              className="w-full py-3.5 rounded-[12px] bg-action text-white text-[15px] font-semibold disabled:opacity-40 transition-opacity press-scale"
            >
              참가 확정
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Gate Lock Card (북 라운지 이벤트 잠금 안내) ── */
function GateLockCard({
  highlightStats,
  gate1At,
  onBack,
}: {
  highlightStats: HighlightStats;
  gate1At: string | null;
  onBack: () => void;
}) {
  const progress = Math.min(highlightStats.totalCount / 30, 1);

  return (
    <div className="flex flex-col min-h-dvh bg-canvas animate-fade">
      <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm px-5 pt-[58px] pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="press-scale w-[34px] h-[34px] rounded-full bg-canvas flex items-center justify-center"
          >
            <span className="text-[18px]">‹</span>
          </button>
          <h1 className="text-[17px] font-semibold text-ink">참가</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-[72px] h-[72px] rounded-full bg-canvas flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M6 6h8v20H6V6zm12 0h8v20h-8V6z" fill="#1d1d1f" opacity="0.15" />
            <path d="M14 8v16" stroke="#0066cc" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
          </svg>
        </div>

        <h2
          className="text-[19px] font-semibold text-ink text-center mb-3"
          style={{ letterSpacing: '-0.3px' }}
        >
          지금은 기록을 쌓는 시간이에요
        </h2>

        <p className="text-sub text-[14px] text-center leading-[1.7] mb-8 max-w-[280px]">
          기록이 쌓인 분들끼리 먼저 만납니다.{'\n'}
          조금만 더 밑줄을 남겨주세요.
        </p>

        {/* Progress status */}
        <div className="w-full max-w-[280px] bg-surface rounded-[14px] border border-border p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] font-medium text-ink">밑줄</span>
              <span className="text-[13px] text-sub">
                {highlightStats.totalCount}/30
              </span>
            </div>
            <div className="w-full h-[6px] bg-canvas rounded-full overflow-hidden">
              <div
                className="h-full bg-action rounded-full transition-all duration-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-ink">기록자 달성</span>
            <span className={`text-[13px] ${gate1At ? 'text-action font-semibold' : 'text-sub'}`}>
              {gate1At ? '완료' : '미달성'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-ink">서재 참여</span>
            <span className="text-[13px] text-sub">0/2회</span>
          </div>
        </div>
      </div>
    </div>
  );
}
