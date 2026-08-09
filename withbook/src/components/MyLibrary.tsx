'use client';

import { useApp } from '../context/AppContext';
import { PLACEHOLDER_COLORS, SHELL_METRIC_LABELS } from '../lib/mock-data';

const GATE_LEVEL_LABEL = { reader: '독자', recorder: '기록자', librarian: '서재지기' } as const;

export default function MyLibrary() {
  const { profile, posts, setSubView, authUserId, handleSignOut, gateLevel, highlightStats, gates, mySeojae, myHighlightPairs, shellMetrics } = useApp();
  const myPosts = posts.filter(p => p.userId === (authUserId || profile.id));

  return (
    <div className="flex flex-col min-h-dvh bg-canvas">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm px-5 pt-[58px] pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
            마이 서재
          </h1>
          <button onClick={handleSignOut} className="text-[13px] text-sub press-scale">
            로그아웃
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Profile section */}
        <div className="bg-surface px-5 py-6 flex flex-col items-center border-b border-border">
          <div className="w-[72px] h-[72px] rounded-full overflow-hidden mb-3">
            <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-[17px] font-semibold text-ink mb-2">{profile.name || '이름 미설정'}</h2>

          {/* Gate badge + progress */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 text-[11px] font-semibold rounded-full ${
              gateLevel === 'reader'
                ? 'bg-ink text-white'
                : 'bg-action text-white'
            }`}>
              {GATE_LEVEL_LABEL[gateLevel]}
              {gateLevel === 'librarian' && (
                <span className="ml-1 font-normal opacity-80">· 초대로 승급</span>
              )}
            </span>
            {gates.gate1At ? (
              <span className="text-[12px] text-sub">
                {highlightStats.bookCount}권에서 {highlightStats.totalCount}개의 밑줄
              </span>
            ) : (
              <span className="text-[12px] text-sub">
                밑줄 {highlightStats.totalCount}/30 · {highlightStats.bookCount}권에서
              </span>
            )}
          </div>

          {/* Gate 1 progress bar (미달성 시만) */}
          {!gates.gate1At && (
            <div className="w-full max-w-[200px] mb-3">
              <div className="w-full h-[4px] bg-canvas rounded-full overflow-hidden">
                <div
                  className="h-full bg-action rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(highlightStats.totalCount / 30, 1) * 100}%` }}
                />
              </div>
            </div>
          )}

          {profile.readingBadges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mb-4">
              {profile.readingBadges.map(badge => (
                <span key={badge} className="px-3 py-1 bg-ink text-white text-[11px] font-medium rounded-full">
                  {badge}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => setSubView('bookEdit')}
            className="press-scale px-5 py-2 border border-border rounded-full text-[13px] font-medium text-ink"
          >
            책 프로필 수정
          </button>
        </div>

        {/* 내 서재 활동 */}
        <div className="bg-surface mt-3 px-5 py-5 border-b border-border">
          <h3 className="text-[15px] font-semibold text-ink mb-3" style={{ letterSpacing: '-0.3px' }}>내 서재 활동</h3>
          <div className="flex gap-4">
            <div className="flex-1 bg-canvas rounded-[11px] p-3 text-center">
              <p className="text-[20px] font-bold text-ink">{mySeojae.length}</p>
              <p className="text-[12px] text-sub mt-0.5">참여 서재</p>
            </div>
            <div className="flex-1 bg-canvas rounded-[11px] p-3 text-center">
              <p className="text-[20px] font-bold text-ink">{myHighlightPairs.filter(p => p.isActive).length}</p>
              <p className="text-[12px] text-sub mt-0.5">밑줄 짝</p>
            </div>
            <div className="flex-1 bg-canvas rounded-[11px] p-3 text-center">
              <p className="text-[20px] font-bold text-action">
                {myHighlightPairs.reduce((sum, p) => sum + p.streakCount, 0)}일
              </p>
              <p className="text-[12px] text-sub mt-0.5">함께 읽은 날</p>
            </div>
          </div>
        </div>

        {/* 조개 지표 */}
        <div className="bg-surface mt-3 px-5 py-5 border-b border-border">
          <h3 className="text-[15px] font-semibold text-ink mb-1" style={{ letterSpacing: '-0.3px' }}>조개 지표</h3>
          <p className="text-[12px] text-sub mb-4">사고 팔 수 없는, 함께 읽어야만 쌓이는 지표</p>
          <div className="space-y-3">
            {SHELL_METRIC_LABELS.map(({ key, label, icon, description }) => {
              const value = key === 'togetherDays'
                ? (myHighlightPairs.reduce((sum, p) => sum + p.streakCount, 0) || shellMetrics.togetherDays)
                : shellMetrics[key];
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-[16px] w-[24px] text-center flex-shrink-0">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-medium text-ink">{label}</p>
                    <p className="text-[11.5px] text-sub">{description}</p>
                  </div>
                  <span className="text-[17px] font-bold text-ink flex-shrink-0">{value}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI 3원칙 브랜드 선언 */}
        <div className="bg-surface mt-3 px-5 py-5 border-b border-border">
          <h3 className="text-[15px] font-semibold text-ink mb-3" style={{ letterSpacing: '-0.3px' }}>위드북이 지키는 3가지 원칙</h3>
          <div className="bg-dark rounded-[14px] px-5 py-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-[15px] mt-0.5 flex-shrink-0">📖</span>
              <div>
                <p className="text-white/95 text-[13.5px] font-medium leading-[1.5]">AI가 대신 읽어주지 않습니다</p>
                <p className="text-white/55 text-[12px] leading-[1.5] mt-0.5">요약 없이, 밑줄과 메모만 남깁니다</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[15px] mt-0.5 flex-shrink-0">✍️</span>
              <div>
                <p className="text-white/95 text-[13.5px] font-medium leading-[1.5]">밑줄은 사람이 쓴 것만 인정합니다</p>
                <p className="text-white/55 text-[12px] leading-[1.5] mt-0.5">AI는 &ldquo;왜 이 문장이 남았나요?&rdquo;만 묻습니다</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[15px] mt-0.5 flex-shrink-0">🤝</span>
              <div>
                <p className="text-white/95 text-[13.5px] font-medium leading-[1.5]">매칭의 최종 확정은 사람이 합니다</p>
                <p className="text-white/55 text-[12px] leading-[1.5] mt-0.5">알고리즘이 고르고, 사람이 확인합니다</p>
              </div>
            </div>
          </div>
        </div>

        {/* 서재 운영 자료실 */}
        <button
          onClick={() => setSubView('resourceLibrary')}
          className="press-scale w-full bg-surface mt-3 px-5 py-5 border-b border-border text-left flex items-center gap-3"
        >
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>서재 운영 자료실</h3>
            <p className="text-[12.5px] text-sub mt-0.5">진행표, 발제 질문, 스타터 키트 등</p>
          </div>
          <span className="text-[18px] text-sub flex-shrink-0">›</span>
        </button>

        {/* Favorite books */}
        <div className="bg-surface mt-3 px-5 py-5 border-b border-border">
          <h3 className="text-[15px] font-semibold text-ink mb-3" style={{ letterSpacing: '-0.3px' }}>인생책 3권</h3>
          <div className="grid grid-cols-3 gap-3">
            {profile.favoriteBooks.map((book, i) => (
              <div key={i} className="aspect-[3/4.2] rounded-[11px] overflow-hidden">
                {book ? (
                  book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-2" style={{ backgroundColor: PLACEHOLDER_COLORS[i] }}>
                      <span className="text-white text-[12px] font-medium text-center leading-tight">{book.title}</span>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full bg-canvas border border-dashed border-chip-border flex items-center justify-center rounded-[11px]">
                    <span className="text-[12px] text-inactive">미등록</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quote card */}
        {profile.quote && (
          <div className="bg-surface mt-3 px-5 py-5 border-b border-border">
            <h3 className="text-[15px] font-semibold text-ink mb-3" style={{ letterSpacing: '-0.3px' }}>인상 깊은 문구</h3>
            <div className="bg-canvas rounded-[11px] p-4">
              <p className="text-[13.5px] text-ink leading-[1.7] italic">{profile.quote}</p>
            </div>
          </div>
        )}

        {/* Reading timeline */}
        <div className="bg-surface mt-3 px-5 py-5">
          <h3 className="text-[15px] font-semibold text-ink mb-3" style={{ letterSpacing: '-0.3px' }}>독서 기록</h3>
          {myPosts.length > 0 ? (
            <div className="space-y-4">
              {myPosts.map(post => (
                <div key={post.id} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="w-[42px] h-[58px] rounded-[6px] overflow-hidden flex-shrink-0">
                    {post.book.coverUrl ? (
                      <img src={post.book.coverUrl} alt={post.book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: PLACEHOLDER_COLORS[parseInt(post.book.isbn) % PLACEHOLDER_COLORS.length] }}>
                        <span className="text-white text-[8px]">{post.book.title[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-ink">《{post.book.title}》</p>
                    <p className="text-[12.5px] text-sub mt-0.5 line-clamp-2">{post.quote}</p>
                    <p className="text-[11px] text-caption mt-1">{post.createdAt} · 좋아요 {post.likes}개</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-[14px] text-sub">아직 독서 기록이 없어요</p>
              <p className="text-[12.5px] text-caption mt-1">홈에서 ＋ 밑줄 버튼을 눌러 시작해보세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
