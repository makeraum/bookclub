'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { UserStory } from '../lib/types';
import { PLACEHOLDER_COLORS } from '../lib/mock-data';

interface StoryViewerProps {
  stories: UserStory[];
  startIndex: number;
  onClose: () => void;
  onViewed: (userId: string) => void;
}

const DURATION = 5000; // 5초 자동 넘김

export default function StoryViewer({ stories, startIndex, onClose, onViewed }: StoryViewerProps) {
  const [userIdx, setUserIdx] = useState(startIndex);
  const [cardIdx, setCardIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const startTimeRef = useRef(Date.now());
  const elapsedRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const story = stories[userIdx];
  const card = story?.cards[cardIdx];
  const totalCards = story?.cards.length ?? 0;

  // 자동 진행 타이머
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const elapsed = elapsedRef.current + (Date.now() - startTimeRef.current);
      const pct = Math.min(elapsed / DURATION, 1);
      setProgress(pct);
      if (pct >= 1) {
        if (timerRef.current) clearInterval(timerRef.current);
        goNext();
      }
    }, 30);
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  const pauseTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    elapsedRef.current += Date.now() - startTimeRef.current;
  }, []);

  const resetAndStart = useCallback(() => {
    elapsedRef.current = 0;
    setProgress(0);
    startTimer();
  }, [startTimer]);

  // 다음 카드 / 다음 유저
  const goNext = useCallback(() => {
    setCardIdx(prev => {
      const nextCard = prev + 1;
      if (nextCard < (stories[userIdx]?.cards.length ?? 0)) {
        elapsedRef.current = 0;
        setProgress(0);
        startTimer();
        return nextCard;
      }
      // 현재 유저 다 봄 → 조회 완료
      onViewed(stories[userIdx].userId);
      // 다음 유저
      setUserIdx(prevUser => {
        const nextUser = prevUser + 1;
        if (nextUser >= stories.length) {
          onClose();
          return prevUser;
        }
        elapsedRef.current = 0;
        setProgress(0);
        startTimer();
        return nextUser;
      });
      return 0;
    });
  }, [userIdx, stories, onViewed, onClose, startTimer]);

  // 이전 카드
  const goPrev = useCallback(() => {
    setCardIdx(prev => {
      if (prev > 0) {
        elapsedRef.current = 0;
        setProgress(0);
        startTimer();
        return prev - 1;
      }
      // 이전 유저
      setUserIdx(prevUser => {
        if (prevUser > 0) {
          const prevUserStory = stories[prevUser - 1];
          setCardIdx(prevUserStory.cards.length - 1);
          elapsedRef.current = 0;
          setProgress(0);
          startTimer();
          return prevUser - 1;
        }
        elapsedRef.current = 0;
        setProgress(0);
        startTimer();
        return prevUser;
      });
      return prev;
    });
  }, [stories, startTimer]);

  // 시작 시 타이머 킴
  useEffect(() => {
    resetAndStart();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  // userIdx, cardIdx 바뀔 때 타이머 리셋
  useEffect(() => {
    resetAndStart();
  }, [userIdx, cardIdx]);// eslint-disable-line react-hooks/exhaustive-deps

  // 터치 처리
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setPaused(true);
    pauseTimer();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    if (!start) { setPaused(false); startTimer(); return; }

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - start.x;
    const deltaY = endY - start.y;

    touchStartRef.current = null;
    setPaused(false);

    // 아래로 스와이프 → 닫기
    if (deltaY > 80 && Math.abs(deltaX) < Math.abs(deltaY)) {
      onViewed(story.userId);
      onClose();
      return;
    }

    // 좌/우 탭 판단 (이동이 적으면 탭으로 처리)
    if (Math.abs(deltaX) < 15 && Math.abs(deltaY) < 15) {
      const screenWidth = window.innerWidth;
      if (endX < screenWidth / 3) {
        goPrev();
      } else {
        goNext();
      }
      return;
    }

    startTimer();
  };

  // 마우스 (데스크톱) 처리
  const handleClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) {
      goPrev();
    } else {
      goNext();
    }
  };

  if (!story || !card) return null;

  const bookColor = PLACEHOLDER_COLORS[parseInt(card.book.isbn) % PLACEHOLDER_COLORS.length];

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <div
        className="relative w-full max-w-[430px] h-full bg-dark flex flex-col overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        {/* 진행 바 */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-3 pt-[env(safe-area-inset-top,12px)] mt-3">
          {Array.from({ length: totalCards }).map((_, i) => (
            <div key={i} className="flex-1 h-[3px] rounded-full bg-white/25 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{
                  width:
                    i < cardIdx
                      ? '100%'
                      : i === cardIdx
                        ? `${progress * 100}%`
                        : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* 유저 정보 + 닫기 */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-2.5 px-4 mt-8 pt-[env(safe-area-inset-top,12px)]">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/40">
            <img src={story.userAvatar} alt={story.userName} className="w-full h-full object-cover" />
          </div>
          <span className="text-white text-[13px] font-semibold flex-1">{story.userName}</span>
          <button
            onClick={e => { e.stopPropagation(); onViewed(story.userId); onClose(); }}
            className="press-scale w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white text-[16px]"
          >
            ✕
          </button>
        </div>

        {/* 카드 콘텐츠 */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 animate-fade" key={`${userIdx}-${cardIdx}`}>
          {/* 책 표지 */}
          <div className="w-[160px] aspect-[3/4.2] rounded-[11px] overflow-hidden mb-8 shadow-lg">
            {card.book.coverUrl ? (
              <img src={card.book.coverUrl} alt={card.book.title} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center p-4"
                style={{ backgroundColor: bookColor }}
              >
                <span className="text-white text-[16px] font-semibold text-center leading-snug">
                  {card.book.title}
                </span>
              </div>
            )}
          </div>

          {/* 문구 */}
          <p className="text-white/90 text-[15px] leading-[1.75] text-center italic mb-6">
            {card.quote}
          </p>

          {/* 책 정보 */}
          <p className="text-white/50 text-[12.5px] text-center">
            《{card.book.title}》· {card.book.author}
          </p>
        </div>

        {/* 하단 그라데이션 */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
