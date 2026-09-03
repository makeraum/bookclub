'use client';

import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  STORY_USERS,
  SAME_BOOK_GROUPS,
  MOCK_STORIES,
  PLACEHOLDER_COLORS,
  REACTION_LABELS,
  MOCK_OFFLINE_EVENTS,
  DEMO_DIFFERENT_PERSPECTIVE,
  DEMO_DIFFERENT_PERSPECTIVE_ISBN,
  DEMO_RETROSPECTIVE_EVENT_ID,
} from '../lib/mock-data';
import StoryViewer from './StoryViewer';
import MatchingDisabledNotice from './MatchingDisabledNotice';
import type { Highlight, HighlightReactionType, GateLevel } from '../lib/types';

/** 피드용 하이라이트와 "다른 시선" 후보를 분리 */
function splitHighlights(allHighlights: Highlight[]) {
  // 피드에 표시할 메인 하이라이트 (기존 5인 u1~u4)
  const mainUserIds = new Set(['u1', 'u2', 'u3', 'u4', 'me']);
  const feed = allHighlights.filter(h => mainUserIds.has(h.userId));
  const others = allHighlights.filter(h => !mainUserIds.has(h.userId));
  return { feed, others };
}

/**
 * 같은 책을 다른 sentiment로 읽은 감상을 찾음.
 * 매칭이 없어도 데모 감상을 돌려주므로 카드는 비지 않는다.
 */
function getDifferentPerspective(
  feedHighlights: Highlight[],
  otherHighlights: Highlight[],
): Highlight {
  // 피드에 있는 positive 하이라이트의 책 목록
  const feedBooks = feedHighlights
    .filter(h => h.sentiment === 'positive')
    .map(h => h.book.isbn);

  // contrary 우선 매칭
  for (const isbn of feedBooks) {
    const contrary = otherHighlights.find(
      h => h.book.isbn === isbn && h.sentiment === 'contrary'
    );
    if (contrary) return contrary;
  }

  // reserved 차선 매칭
  for (const isbn of feedBooks) {
    const reserved = otherHighlights.find(
      h => h.book.isbn === isbn && h.sentiment === 'reserved'
    );
    if (reserved) return reserved;
  }

  // 매칭 결과가 없어도 비어 보이지 않게 데모 감상으로 폴백
  return DEMO_DIFFERENT_PERSPECTIVE;
}

export default function HomeFeed() {
  const { highlights, toggleHighlightReaction, setSubView, setTab, viewedStoryUsers, markStoryViewed, highlightStats, gateLevel, gates, pendingRetrospectiveEventId, openRetrospective, retrospectives, selectCoAttendee, consents, sensitiveConsentGiven } = useApp();
  const [storyOpen, setStoryOpen] = useState(false);
  const [storyStartIndex, setStoryStartIndex] = useState(0);

  const { feed: feedHighlights, others: otherHighlights } = useMemo(
    () => splitHighlights(highlights),
    [highlights]
  );
  const differentPerspective = useMemo(
    () => getDifferentPerspective(feedHighlights, otherHighlights),
    [feedHighlights, otherHighlights]
  );
  // 삽입 위치: 《싯다르타》 밑줄 카드 바로 다음 (없으면 첫 카드 다음)
  const insertIndex = useMemo(() => {
    const idx = feedHighlights.findIndex(h => h.book.isbn === DEMO_DIFFERENT_PERSPECTIVE_ISBN);
    return (idx >= 0 ? idx : 0) + 1;
  }, [feedHighlights]);

  // 민감정보 동의를 철회했으면 매칭 카드 대신 안내를 보여줍니다.
  // 동의 기록 자체가 없는 상태(체험 계정·로컬 모드)에서는 기존대로 카드를 노출합니다.
  const matchingBlocked = consents.length > 0 && !sensitiveConsentGiven;

  // 회고 유도 카드 — 대상이 없으면 데모 모임으로 항상 노출
  const retroEventId = pendingRetrospectiveEventId ?? DEMO_RETROSPECTIVE_EVENT_ID;
  const retroEvent = MOCK_OFFLINE_EVENTS.find(ev => ev.id === retroEventId);
  const retroDone = retrospectives.some(r => r.eventId === retroEventId);

  const storyUserIds = new Set(MOCK_STORIES.map(s => s.userId));

  const handleStoryTap = (userId: string) => {
    const idx = MOCK_STORIES.findIndex(s => s.userId === userId);
    if (idx >= 0) {
      setStoryStartIndex(idx);
      setStoryOpen(true);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-canvas">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm px-5 pt-[58px] pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
            WithBook
          </h1>
          <button
            onClick={() => setSubView('compose')}
            className="press-scale px-4 py-1.5 bg-action text-white text-[13px] font-semibold rounded-full"
          >
            ＋ 밑줄
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Story row */}
        <div className="px-5 py-4">
          <div className="flex gap-4 overflow-x-auto hide-scrollbar">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-[60px] h-[60px] rounded-full border-2 border-chip-border overflow-hidden">
                <img src="/assets/avatar-me.png" alt="나" className="w-full h-full object-cover" />
              </div>
              <span className="text-[10.5px] text-sub">내 서재</span>
            </div>
            {STORY_USERS.map(user => {
              const hasStory = storyUserIds.has(user.id);
              const isViewed = viewedStoryUsers.has(user.id);
              const ringColor = hasStory && !isViewed ? 'bg-action' : 'bg-chip-border';

              return (
                <button
                  key={user.id}
                  onClick={() => hasStory && handleStoryTap(user.id)}
                  className="flex flex-col items-center gap-1 flex-shrink-0 press-scale"
                >
                  <div className={`w-[60px] h-[60px] rounded-full p-[2px] ${ringColor}`}>
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-surface">
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <span className="text-[10.5px] text-sub">{user.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 회고 유도 카드 — 스토리 행 바로 아래, 항상 노출 */}
        <div className="px-5 mb-4">
          <button
            onClick={() => openRetrospective(retroEventId)}
            className="press-scale w-full bg-surface rounded-[18px] border border-border px-4 py-3.5 flex items-center gap-3 text-left"
          >
            <div className="w-[36px] h-[36px] rounded-full bg-action/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[16px]">✎</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-ink" style={{ letterSpacing: '-0.2px' }}>
                지난 모임은 어땠나요?
                <span className="text-[12px] text-sub font-normal ml-1.5">· 30초</span>
              </p>
              <p className="text-[12px] text-sub mt-0.5 truncate">
                {retroDone
                  ? `${retroEvent?.book?.title ? `《${retroEvent.book.title}》 ` : ''}남은 문장 카드 보기`
                  : retroEvent?.book?.title
                  ? `《${retroEvent.book.title}》 모임 · 3문항이면 끝나요`
                  : '3문항이면 끝나요'}
              </p>
            </div>
            <span className="text-[16px] text-inactive flex-shrink-0">&rsaquo;</span>
          </button>
        </div>

        {/* Gate progress card */}
        <GateProgressCard
          gateLevel={gateLevel}
          totalCount={highlightStats.totalCount}
          bookCount={highlightStats.bookCount}
          gate1At={gates.gate1At}
        />

        {/* Challenge banner */}
        <div className="px-5 mb-4">
          <div className="bg-dark rounded-[18px] p-5">
            <span className="text-[11px] font-semibold text-lightblue tracking-[0.5px] uppercase">
              이달의 공동 독서 챌린지
            </span>
            <h3 className="text-white text-[17px] font-semibold mt-2" style={{ letterSpacing: '-0.3px' }}>
              《싯다르타》 함께 읽기 · D-12
            </h3>
            <p className="text-white/60 text-[12.5px] mt-1">12명이 함께 읽고 있어요</p>
          </div>
        </div>

        {/* Same book group */}
        <div className="px-5 mb-5">
          <h3 className="text-[15px] font-semibold text-ink mb-3" style={{ letterSpacing: '-0.3px' }}>
            같은 책 읽는 사람들
          </h3>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar">
            {SAME_BOOK_GROUPS.map(group => (
              <div key={group.book.isbn} className="flex-shrink-0 w-[118px]">
                <div className="aspect-[3/2] rounded-[8px] overflow-hidden mb-2">
                  {group.book.coverUrl ? (
                    <img src={group.book.coverUrl} alt={group.book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: PLACEHOLDER_COLORS[parseInt(group.book.isbn) % PLACEHOLDER_COLORS.length] }}
                    >
                      <span className="text-white text-[11px] font-medium">{group.book.title}</span>
                    </div>
                  )}
                </div>
                <p className="text-[12px] font-medium text-ink truncate">{group.book.title}</p>
                <p className="text-[11px] text-sub">{group.readerCount}명 읽는 중</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section title */}
        <div className="px-5 mb-3">
          <h3 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
            사람들의 밑줄
          </h3>
        </div>

        {/* Highlight cards */}
        <div className="space-y-3 px-5">
          {feedHighlights.length > 0 ? (
            <>
              {feedHighlights.map((highlight, idx) => (
                <div key={highlight.id}>
                  <HighlightCard
                    highlight={highlight}
                    onReaction={(type) => toggleHighlightReaction(highlight.id, type)}
                  />
                  {/* '같은 책, 다르게 읽었어요' 카드 — 기준 책 밑줄 카드 바로 다음 */}
                  {idx + 1 === insertIndex && (
                    <div className="mt-3">
                      {matchingBlocked ? (
                        <MatchingDisabledNotice feature="같은 책, 다르게 읽었어요" />
                      ) : (
                        <DifferentPerspectiveCard
                          highlight={differentPerspective}
                          onViewProfile={() => selectCoAttendee(differentPerspective.userId)}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="bg-surface rounded-[18px] border border-border p-6 text-center">
                <p className="text-[32px] mb-2">📖</p>
                <p className="text-[15px] font-semibold text-ink mb-1">아직 밑줄이 없어요</p>
                <p className="text-[13px] text-sub leading-[1.6]">
                  책을 읽고 인상 깊은 문장에 밑줄을 남겨보세요.<br />
                  다른 사람들의 밑줄도 여기에 나타나요.
                </p>
                <button
                  onClick={() => setSubView('compose')}
                  className="press-scale mt-4 px-5 py-2.5 bg-action text-white text-[13px] font-semibold rounded-full"
                >
                  첫 밑줄 남기기
                </button>
              </div>
              {/* 밑줄이 없어도 다른 시선 카드는 유지 */}
              {matchingBlocked ? (
                <MatchingDisabledNotice feature="같은 책, 다르게 읽었어요" />
              ) : (
                <DifferentPerspectiveCard
                  highlight={differentPerspective}
                  onViewProfile={() => selectCoAttendee(differentPerspective.userId)}
                />
              )}
            </>
          )}
        </div>

        {/* 서재 넛지 카드 */}
        <div className="px-5 mt-5 mb-8">
          <div className="bg-surface rounded-[18px] border border-border p-5 text-center">
            <p className="text-[14px] text-ink font-medium mb-1">
              소규모 독서 서재에서 함께 읽어요
            </p>
            <p className="text-[12.5px] text-sub mb-4">같은 책을 읽는 사람들과 밑줄을 나누고, 매달 한 번 만나요</p>
            <button
              onClick={() => setTab('seojae')}
              className="press-scale px-5 py-2.5 bg-action text-white text-[13px] font-semibold rounded-full"
            >
              서재 둘러보기
            </button>
          </div>
        </div>
      </div>

      {/* Story Viewer Overlay */}
      {storyOpen && (
        <StoryViewer
          stories={MOCK_STORIES}
          startIndex={storyStartIndex}
          onClose={() => setStoryOpen(false)}
          onViewed={markStoryViewed}
        />
      )}
    </div>
  );
}

/* ── Gate Progress Card ── */

const GATE_LEVEL_LABEL: Record<GateLevel, string> = {
  reader: '독자',
  recorder: '기록자',
  librarian: '서재지기',
};

function GateProgressCard({
  gateLevel,
  totalCount,
  bookCount,
  gate1At,
}: {
  gateLevel: GateLevel;
  totalCount: number;
  bookCount: number;
  gate1At: string | null;
}) {
  const threshold = 30;
  const progress = Math.min(totalCount / threshold, 1);

  // Gate 1 이미 달성
  if (gate1At) {
    return (
      <div className="px-5 mb-4">
        <div className="bg-surface rounded-[18px] border border-border p-4 flex items-center gap-3">
          <div className="w-[36px] h-[36px] rounded-full bg-action/10 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <path d="M16 4L20 12L28 13.5L22 19.5L23.5 28L16 24L8.5 28L10 19.5L4 13.5L12 12L16 4Z" fill="#0066cc" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-ink">기록자</span>
              <span className="px-2 py-0.5 bg-action/10 text-action text-[10.5px] font-semibold rounded-full">달성</span>
            </div>
            <p className="text-[12px] text-sub mt-0.5">
              {bookCount}권에서 {totalCount}개의 밑줄
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Gate 1 미달성: 프로그레스 바
  return (
    <div className="px-5 mb-4">
      <div className="bg-surface rounded-[18px] border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-ink text-white text-[10.5px] font-semibold rounded-full">
              {GATE_LEVEL_LABEL[gateLevel]}
            </span>
            <span className="text-[13px] font-semibold text-ink">
              밑줄 {totalCount}/{threshold}
            </span>
          </div>
          <span className="text-[12px] text-sub">{bookCount}권에서</span>
        </div>
        <div className="w-full h-[6px] bg-canvas rounded-full overflow-hidden">
          <div
            className="h-full bg-action rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="text-[12px] text-sub mt-2">
          기록이 쌓이고 있어요
        </p>
      </div>
    </div>
  );
}

/* ── Highlight Card Component ── */

const REACTION_EMOJI: Record<HighlightReactionType, string> = {
  felt_same: '🙌',
  want_to_read: '📖',
  stays_long: '✨',
};

function HighlightCard({
  highlight,
  onReaction,
}: {
  highlight: Highlight;
  onReaction: (type: HighlightReactionType) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const reactionTypes: HighlightReactionType[] = ['felt_same', 'want_to_read', 'stays_long'];

  // reason이 3줄(대략 90자) 이상인지 판단
  const reasonNeedsTruncate = highlight.reason.length > 90;

  return (
    <div className="bg-surface rounded-[18px] border border-border overflow-hidden p-4">
      {/* Header: user info */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-[34px] h-[34px] rounded-full overflow-hidden flex-shrink-0">
          <img src={highlight.userAvatar} alt={highlight.userName} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[13px] font-semibold text-ink">{highlight.userName}</span>
          <span className="text-[12px] text-sub ml-1.5">{highlight.createdAt}</span>
        </div>
      </div>

      {/* Book info — flat, no background */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-[38px] h-[52px] rounded-[6px] overflow-hidden flex-shrink-0">
          {highlight.book.coverUrl ? (
            <img src={highlight.book.coverUrl} alt={highlight.book.title} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: PLACEHOLDER_COLORS[parseInt(highlight.book.isbn) % PLACEHOLDER_COLORS.length] }}
            >
              <span className="text-white text-[8px] text-center px-0.5">{highlight.book.title}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-ink truncate">《{highlight.book.title}》</p>
          <p className="text-[11.5px] text-sub">{highlight.book.author}</p>
        </div>
      </div>

      {/* Sentence — the highlight itself */}
      <div className="mb-4">
        <div className="border-l-[3px] border-action/70 pl-4 py-2">
          <p className="text-[14px] text-ink leading-[1.75] font-medium" style={{ letterSpacing: '-0.2px' }}>
            &ldquo;{highlight.sentence}&rdquo;
          </p>
        </div>
      </div>

      {/* Reason — "왜 이 문장이 남았나요?" */}
      {highlight.reason && (
        <div className="mb-3">
          <p className="text-[11.5px] font-semibold text-sub/70 mb-1.5">
            왜 이 문장이 남았나요?
          </p>
          <p
            className={`text-[13px] text-ink/80 leading-[1.7] ${
              !expanded && reasonNeedsTruncate ? 'line-clamp-3' : ''
            }`}
            style={{ letterSpacing: '-0.1px' }}
          >
            {highlight.reason}
          </p>
          {reasonNeedsTruncate && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-[12px] text-action/80 font-medium mt-1 press-scale"
            >
              더 보기
            </button>
          )}
        </div>
      )}

      {/* Context — "그때의 나" */}
      {highlight.context && expanded && (
        <div className="mb-3 animate-fade">
          <p className="text-[11.5px] text-sub leading-[1.6] bg-canvas/50 rounded-[8px] px-3 py-2">
            <span className="text-[11px] font-semibold text-sub/80">그때의 나</span>
            <br />
            {highlight.context}
          </p>
        </div>
      )}

      {/* Reaction buttons — emoji + count pill */}
      <div className="flex gap-2 mt-1">
        {reactionTypes.map(type => {
          const isActive = highlight.reactions.myReactions.has(type);
          const count = highlight.reactions[type];

          return (
            <button
              key={type}
              onClick={() => onReaction(type)}
              aria-label={REACTION_LABELS[type]}
              title={REACTION_LABELS[type]}
              className="press-scale flex items-center gap-[5px] rounded-full transition-colors duration-200 whitespace-nowrap"
              style={{
                height: 36,
                paddingLeft: 14,
                paddingRight: 14,
                backgroundColor: isActive ? 'rgba(0, 102, 204, 0.1)' : '#fff',
                border: isActive ? '1px solid rgba(0, 102, 204, 0.35)' : '1px solid #e0e0e0',
              }}
            >
              <span className="text-[16px] leading-none">{REACTION_EMOJI[type]}</span>
              {count > 0 && (
                <span
                  className="font-semibold leading-none"
                  style={{
                    fontSize: 13,
                    color: isActive ? '#0066cc' : '#999',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── 같은 책, 다르게 읽었어요 ── */

function DifferentPerspectiveCard({
  highlight,
  onViewProfile,
}: {
  highlight: Highlight;
  onViewProfile: () => void;
}) {
  // 그 사람의 '다른 해석' 문장 1개
  const interpretation = highlight.reason.length > 120
    ? highlight.reason.slice(0, 120) + '…'
    : highlight.reason;

  return (
    <div className="bg-surface rounded-[18px] border border-border p-4">
      {/* 제목 */}
      <div className="mb-3">
        <h4 className="text-[14px] font-semibold text-ink" style={{ letterSpacing: '-0.2px' }}>
          같은 책, 다르게 읽었어요
        </h4>
        <p className="text-[12px] text-sub mt-0.5">《{highlight.book.title}》를 이렇게 읽은 사람도 있어요</p>
      </div>

      {/* 상대 이름 · 프로필 */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-[34px] h-[34px] rounded-full overflow-hidden flex-shrink-0">
          <img src={highlight.userAvatar} alt={highlight.userName} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[13px] font-semibold text-ink">{highlight.userName}</span>
          <span className="text-[12px] text-sub ml-1.5">{highlight.createdAt}</span>
        </div>
      </div>

      {/* 그 사람의 다른 해석 */}
      <div className="border-l-[3px] border-sub/30 pl-4 py-1 mb-3">
        <p className="text-[13.5px] text-ink/85 leading-[1.75]" style={{ letterSpacing: '-0.1px' }}>
          &ldquo;{interpretation}&rdquo;
        </p>
      </div>

      {/* 프로필 보기 */}
      <button
        onClick={onViewProfile}
        className="press-scale text-[12.5px] text-action font-medium"
      >
        프로필 보기
      </button>
    </div>
  );
}
