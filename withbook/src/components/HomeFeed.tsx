'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  STORY_USERS,
  MOCK_STORIES,
  PLACEHOLDER_COLORS,
  REACTION_LABELS,
  DEMO_DIFFERENT_PERSPECTIVE,
} from '../lib/mock-data';
import StoryViewer from './StoryViewer';
import MatchingDisabledNotice from './MatchingDisabledNotice';
import type { Highlight, HighlightReactionType } from '../lib/types';

/**
 * 홈 = 밑줄 피드 하나.
 * 진행률·챌린지·책 캐러셀은 성격이 달라 각자 제 탭으로 옮겼습니다.
 *   · 밑줄 진행 카드 → 마이 탭 (GateProgressCard)
 *   · 챌린지 배너 + 같은 책 읽는 사람들 → 서재 탭 (ReadingChallenge)
 *   · 회고 유도 카드 → 참가 탭
 */

/** 한 번에 그리는 피드 항목 수 */
const PAGE_SIZE = 4;

/** 피드용 밑줄과 "다른 시선" 후보를 분리 */
function splitHighlights(allHighlights: Highlight[]) {
  const mainUserIds = new Set(['u1', 'u2', 'u3', 'u4', 'me']);
  const feed = allHighlights.filter(h => mainUserIds.has(h.userId));
  const others = allHighlights.filter(h => !mainUserIds.has(h.userId));
  return { feed, others };
}

type FeedItem =
  | { kind: 'highlight'; key: string; highlight: Highlight }
  | { kind: 'perspective'; key: string; highlight: Highlight };

/**
 * 밑줄 사이사이에 "같은 책, 다르게 읽었어요" 카드를 끼워 하나의 피드로 만듭니다.
 * 독립 섹션이 아니라 피드 항목이라, 스크롤하다 자연스럽게 만나게 됩니다.
 *
 * 두 목록을 개수 비율에 맞춰 번갈아 섞으므로, 어느 한쪽이 뒤에 몰리지 않습니다.
 * 다른 시선을 고를 때는 바로 앞에 나온 밑줄과 같은 책을 먼저 씁니다.
 */
function buildFeedItems(feed: Highlight[], others: Highlight[]): FeedItem[] {
  const pool = [...others];
  const items: FeedItem[] = [];
  const recentIsbns: string[] = [];
  let fi = 0;
  let taken = 0;

  const takeHighlight = () => {
    const h = feed[fi++];
    items.push({ kind: 'highlight', key: `h-${h.id}`, highlight: h });
    recentIsbns.push(h.book.isbn);
  };

  const takePerspective = () => {
    // 같은 책 우선, 없으면 남은 것 중 앞에서
    let idx = pool.findIndex(p => recentIsbns.includes(p.book.isbn));
    if (idx < 0) idx = 0;
    const [picked] = pool.splice(idx, 1);
    items.push({ kind: 'perspective', key: `p-${picked.id}`, highlight: picked });
    taken += 1;
    recentIsbns.length = 0;
  };

  const totalPerspectives = pool.length;

  // 피드는 언제나 밑줄로 시작합니다 — 첫 화면이 남의 해석 카드면 어색해요
  if (feed.length > 0) takeHighlight();

  while (fi < feed.length || pool.length > 0) {
    if (pool.length === 0) { takeHighlight(); continue; }
    if (fi >= feed.length) { takePerspective(); continue; }
    // 진행 비율이 뒤처진 쪽을 먼저 넣습니다
    const feedProgress = (fi + 1) / feed.length;
    const perspectiveProgress = (taken + 1) / totalPerspectives;
    if (feedProgress <= perspectiveProgress) takeHighlight();
    else takePerspective();
  }

  // 밑줄도 다른 시선도 없으면 데모 카드 하나는 남깁니다 (빈 화면 방지)
  if (items.length === 0) {
    items.push({
      kind: 'perspective',
      key: `p-${DEMO_DIFFERENT_PERSPECTIVE.id}`,
      highlight: DEMO_DIFFERENT_PERSPECTIVE,
    });
  }
  return items;
}

export default function HomeFeed() {
  const {
    highlights,
    toggleHighlightReaction,
    setSubView,
    setTab,
    viewedStoryUsers,
    markStoryViewed,
    selectCoAttendee,
    consents,
    sensitiveConsentGiven,
  } = useApp();

  const [storyOpen, setStoryOpen] = useState(false);
  const [storyStartIndex, setStoryStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { feed, others } = useMemo(() => splitHighlights(highlights), [highlights]);
  const feedItems = useMemo(() => buildFeedItems(feed, others), [feed, others]);

  // 민감정보 동의를 철회했으면 매칭 카드 대신 안내를 한 번만 보여줍니다.
  // 동의 기록이 없는 상태(체험 계정·로컬 모드)에서는 기존대로 노출합니다.
  const matchingBlocked = consents.length > 0 && !sensitiveConsentGiven;

  const visibleItems = feedItems.slice(0, visibleCount);
  const hasMore = visibleCount < feedItems.length;

  // 매칭 안내는 첫 번째 다른 시선 자리에만 한 번 보여줍니다
  const firstPerspectiveKey = feedItems.find(i => i.kind === 'perspective')?.key ?? null;

  // 무한 스크롤 — 바닥 감시자가 보이면 다음 묶음을 그립니다
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount(prev => Math.min(prev + PAGE_SIZE, feedItems.length));
        }
      },
      { rootMargin: '400px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [feedItems.length, hasMore]);

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
            className="press-scale focus-ring px-4 py-1.5 bg-action text-white text-[13px] font-semibold rounded-full"
          >
            ＋ 밑줄
          </button>
        </div>
      </div>

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

        {/* 밑줄 피드 */}
        <div className="space-y-3 px-5">
          {visibleItems.map(item => {
            if (item.kind === 'highlight') {
              return (
                <HighlightCard
                  key={item.key}
                  highlight={item.highlight}
                  onReaction={type => toggleHighlightReaction(item.highlight.id, type)}
                />
              );
            }
            if (matchingBlocked) {
              if (item.key !== firstPerspectiveKey) return null;
              return (
                <MatchingDisabledNotice key={item.key} feature="같은 책, 다르게 읽었어요" />
              );
            }
            return (
              <DifferentPerspectiveCard
                key={item.key}
                highlight={item.highlight}
                onViewProfile={() => selectCoAttendee(item.highlight.userId)}
              />
            );
          })}

          {feedItems.length === 0 && (
            <div className="bg-surface rounded-[18px] border border-border p-6 text-center">
              <p className="text-[32px] mb-2">📖</p>
              <p className="text-[15px] font-semibold text-ink mb-1">아직 밑줄이 없어요</p>
              <p className="text-[13px] text-sub leading-[1.6]">
                책을 읽고 인상 깊은 문장에 밑줄을 남겨보세요.<br />
                다른 사람들의 밑줄도 여기에 나타나요.
              </p>
              <button
                onClick={() => setSubView('compose')}
                className="press-scale focus-ring mt-4 px-5 py-2.5 bg-action text-white text-[13px] font-semibold rounded-full"
              >
                첫 밑줄 남기기
              </button>
            </div>
          )}
        </div>

        {/* 무한 스크롤 감시자 */}
        {hasMore && (
          <div ref={sentinelRef} className="py-6 text-center">
            <span className="text-[12.5px] text-sub">불러오는 중...</span>
          </div>
        )}

        {/* 피드 맨 아래 — 서재 둘러보기 */}
        {!hasMore && (
          <div className="px-5 mt-5 mb-8">
            <div className="bg-surface rounded-[18px] border border-border p-5 text-center">
              <p className="text-[14px] text-ink font-medium mb-1">
                소규모 독서 서재에서 함께 읽어요
              </p>
              <p className="text-[12.5px] text-sub mb-4">
                같은 책을 읽는 사람들과 밑줄을 나누고, 매달 한 번 만나요
              </p>
              <button
                onClick={() => setTab('seojae')}
                className="press-scale focus-ring px-5 py-2.5 bg-action text-white text-[13px] font-semibold rounded-full"
              >
                서재 둘러보기
              </button>
            </div>
          </div>
        )}
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
