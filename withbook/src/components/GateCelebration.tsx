'use client';

import { useApp } from '../context/AppContext';
import Button from './ui/Button';
import { PLACEHOLDER_COLORS } from '../lib/mock-data';

export default function GateCelebration() {
  const { setSubView, highlights, authUserId, profile, highlightStats } = useApp();

  // 내 밑줄 중 최근 3개 대표 표시
  const myHighlights = highlights
    .filter(h => h.userId === (authUserId || profile.id))
    .slice(0, 3);

  const bookCount = highlightStats.bookCount;
  const totalCount = highlightStats.totalCount;

  const handleShare = async () => {
    const text = `위드북에서 ${bookCount}권의 책에 ${totalCount}개의 밑줄을 남기며 기록자가 되었습니다.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: '위드북 기록자 달성', text });
      } catch { /* 사용자가 공유 취소 */ }
    } else {
      await navigator.clipboard.writeText(text);
      alert('클립보드에 복사되었어요');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface animate-fade">
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Badge icon */}
        <div className="w-[88px] h-[88px] rounded-full bg-action/10 flex items-center justify-center mb-6 animate-pop">
          <div className="w-[64px] h-[64px] rounded-full bg-action/20 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 4L20 12L28 13.5L22 19.5L23.5 28L16 24L8.5 28L10 19.5L4 13.5L12 12L16 4Z" fill="#0066cc" />
            </svg>
          </div>
        </div>

        <h1
          className="text-[22px] font-semibold text-ink text-center mb-2 animate-fade"
          style={{ letterSpacing: '-0.5px' }}
        >
          기록자가 되었습니다
        </h1>

        <p className="text-sub text-[14px] text-center leading-[1.7] mb-8 animate-fade">
          {bookCount}권의 책에서 {totalCount}개의 밑줄을 남겼어요.{'\n'}
          이제 기록이 쌓인 분들과 만날 수 있어요.
        </p>

        {/* Recent highlights summary */}
        {myHighlights.length > 0 && (
          <div className="w-full max-w-sm space-y-2.5 mb-8 animate-fade">
            {myHighlights.map(h => (
              <div
                key={h.id}
                className="flex items-center gap-3 p-3 bg-canvas rounded-[11px]"
              >
                <div className="w-[34px] h-[46px] rounded-[4px] overflow-hidden flex-shrink-0">
                  {h.book.coverUrl ? (
                    <img src={h.book.coverUrl} alt={h.book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: PLACEHOLDER_COLORS[parseInt(h.book.isbn) % PLACEHOLDER_COLORS.length] }}
                    >
                      <span className="text-white text-[7px]">{h.book.title[0]}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-ink truncate">《{h.book.title}》</p>
                  <p className="text-[11px] text-sub line-clamp-1">&ldquo;{h.sentence}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="px-5 pb-8 space-y-3 safe-bottom">
        <Button onClick={handleShare} variant="outline">
          공유하기
        </Button>
        <Button onClick={() => setSubView(null)}>
          확인
        </Button>
      </div>
    </div>
  );
}
