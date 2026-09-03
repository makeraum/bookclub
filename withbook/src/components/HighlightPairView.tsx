'use client';

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_HIGHLIGHTS, PLACEHOLDER_COLORS } from '../lib/mock-data';
import { toKoreanCount } from '../lib/utils';
import FullScreenSheet from './ui/Overlay';

export default function HighlightPairView() {
  const { selectedPairId, selectPair, myHighlightPairs, setTab, profile, authUserId, myCoAttendances } = useApp();
  const [todayReacted, setTodayReacted] = useState(false);

  const pair = myHighlightPairs.find(p => p.id === selectedPairId);
  if (!pair) return null;

  const bookColor = PLACEHOLDER_COLORS[parseInt(pair.book.isbn) % PLACEHOLDER_COLORS.length];

  // 파트너의 밑줄 (같은 책의 밑줄 중 파트너가 작성한 것)
  const partnerHighlights = MOCK_HIGHLIGHTS.filter(
    h => h.book.isbn === pair.book.isbn && h.userId !== (authUserId || profile.id)
  );
  const todaysPartnerHighlight = partnerHighlights[0]; // 가장 최근 것

  // 나의 밑줄 (같은 책)
  const myHighlights = MOCK_HIGHLIGHTS.filter(
    h => h.book.isbn === pair.book.isbn && h.userId === (authUserId || profile.id)
  );
  const todaysMyHighlight = myHighlights[0];

  const handleReact = () => {
    setTodayReacted(true);
  };

  const handleChatOpen = () => {
    selectPair(null);
    setTab('chat');
  };

  return (
    <FullScreenSheet
      title="밑줄 짝"
      onClose={() => selectPair(null)}
      headerRight={
        <button
          onClick={handleChatOpen}
          className="p-1.5 rounded-lg press-scale focus-ring"
          aria-label="채팅"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      }
    >
      <div className="pb-24">
          {/* 파트너 + 책 정보 */}
          <div className="bg-surface px-5 py-6 flex flex-col items-center border-b border-border">
            <div className="w-[64px] h-[64px] rounded-full overflow-hidden mb-3">
              <img src={pair.partnerAvatar} alt={pair.partnerName} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-[17px] font-semibold text-ink mb-1">{pair.partnerName}</h2>

            {/* 책 */}
            <div className="flex items-center gap-2 mt-2">
              <div className="w-[30px] h-[42px] rounded-[4px] overflow-hidden flex-shrink-0">
                {pair.book.coverUrl ? (
                  <img src={pair.book.coverUrl} alt={pair.book.title} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: bookColor }}
                  >
                    <span className="text-white text-[6px]">{pair.book.title[0]}</span>
                  </div>
                )}
              </div>
              <span className="text-[13px] text-sub">《{pair.book.title}》 함께 읽는 중</span>
            </div>

            {/* 매칭 이유 (문장 기반, 점수 없음) */}
            <p className="text-[11.5px] text-caption mt-2.5">
              같은 서재에서 같은 책 《{pair.book.title}》을 읽고 있어 추천되었습니다
            </p>
            <p className="text-[10.5px] text-caption mt-0.5">
              알고리즘이 고르고, 사람이 확인합니다
            </p>
            {(() => {
              const coAtt = myCoAttendances.find(a => a.userId === pair.partnerUserId);
              if (!coAtt) return null;
              return (
                <p className="text-[11.5px] text-action/80 mt-1.5">
                  이미 {toKoreanCount(coAtt.count)} 번 같은 자리에 있었어요
                </p>
              );
            })()}
          </div>

          {/* 스트릭 카운터 */}
          <div className="px-5 pt-5">
            <div className="bg-action/5 border border-action/20 rounded-[14px] p-4 flex items-center justify-center gap-3">
              <span className="text-[24px]">🔥</span>
              <div className="text-center">
                <p className="text-[22px] font-bold text-action">{pair.streakCount}일</p>
                <p className="text-[12px] text-sub mt-0.5">함께 읽은 날</p>
              </div>
            </div>
          </div>

          {/* 파트너의 오늘 밑줄 */}
          <section className="px-5 pt-5">
            <h3 className="text-[15px] font-semibold text-ink mb-3" style={{ letterSpacing: '-0.3px' }}>
              {pair.partnerName}의 밑줄
            </h3>
            {todaysPartnerHighlight ? (
              <div className="bg-surface rounded-[14px] border border-border p-4">
                <div className="border-l-[3px] border-action/70 pl-4 py-1 mb-3">
                  <p className="text-[14px] text-ink leading-[1.75] font-medium" style={{ letterSpacing: '-0.2px' }}>
                    &ldquo;{todaysPartnerHighlight.sentence}&rdquo;
                  </p>
                </div>
                {todaysPartnerHighlight.reason && (
                  <p className="text-[13px] text-sub leading-[1.6] mb-3">
                    {todaysPartnerHighlight.reason}
                  </p>
                )}
                {/* 반응 버튼 (하루 1회) */}
                {!todayReacted ? (
                  <button
                    onClick={handleReact}
                    className="press-scale w-full py-3 rounded-[11px] bg-action/10 text-action text-[14px] font-semibold"
                  >
                    🙌 공감 보내기
                  </button>
                ) : (
                  <div className="w-full py-3 rounded-[11px] bg-canvas text-center">
                    <span className="text-[14px] text-sub">오늘의 공감을 보냈어요 ✨</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-surface rounded-[14px] border border-border p-5 text-center">
                <p className="text-[14px] text-sub">{pair.partnerName}이 아직 오늘의 밑줄을 남기지 않았어요</p>
              </div>
            )}
          </section>

          {/* 나의 오늘 밑줄 */}
          <section className="px-5 pt-5 pb-4">
            <h3 className="text-[15px] font-semibold text-ink mb-3" style={{ letterSpacing: '-0.3px' }}>
              나의 밑줄
            </h3>
            {todaysMyHighlight ? (
              <div className="bg-surface rounded-[14px] border border-border p-4">
                <div className="border-l-[3px] border-ink/30 pl-4 py-1">
                  <p className="text-[14px] text-ink leading-[1.75] font-medium" style={{ letterSpacing: '-0.2px' }}>
                    &ldquo;{todaysMyHighlight.sentence}&rdquo;
                  </p>
                </div>
                {todaysMyHighlight.reason && (
                  <p className="text-[13px] text-sub leading-[1.6] mt-2">
                    {todaysMyHighlight.reason}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-surface rounded-[14px] border border-dashed border-chip-border p-5 text-center">
                <p className="text-[14px] text-sub mb-2">오늘의 밑줄을 아직 남기지 않았어요</p>
                <p className="text-[12.5px] text-caption">홈에서 ＋ 밑줄 버튼을 눌러 남겨보세요</p>
              </div>
            )}
          </section>
      </div>
    </FullScreenSheet>
  );
}
