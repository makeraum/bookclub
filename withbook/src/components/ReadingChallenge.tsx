'use client';

import { SAME_BOOK_GROUPS, PLACEHOLDER_COLORS } from '../lib/mock-data';

/**
 * 이달의 공동 독서 챌린지 + 같은 책 읽는 사람들.
 * 홈 피드에 있던 것을 서재 탭 상단으로 옮겼습니다 —
 * "무엇을 함께 읽을까"를 고르는 자리에 있어야 하는 카드들입니다.
 */
export default function ReadingChallenge() {
  return (
    <>
      {/* 이달의 공동 독서 챌린지 */}
      <div className="px-5 pt-4 pb-1">
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

      {/* 같은 책 읽는 사람들 */}
      <div className="px-5 pt-4">
        <h3 className="text-[15px] font-semibold text-ink mb-3" style={{ letterSpacing: '-0.3px' }}>
          같은 책 읽는 사람들
        </h3>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar">
          {SAME_BOOK_GROUPS.map(group => (
            <div key={group.book.isbn} className="flex-shrink-0 w-[118px]">
              <div className="aspect-[3/2] rounded-[8px] overflow-hidden mb-2">
                {group.book.coverUrl ? (
                  <img
                    src={group.book.coverUrl}
                    alt={group.book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      backgroundColor:
                        PLACEHOLDER_COLORS[parseInt(group.book.isbn) % PLACEHOLDER_COLORS.length],
                    }}
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
    </>
  );
}
