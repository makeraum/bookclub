'use client';

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PLACEHOLDER_COLORS, SHELL_METRIC_LABELS } from '../lib/mock-data';
import { toKoreanCount } from '../lib/utils';
import GateProgressCard from './GateProgressCard';

const GATE_LEVEL_LABEL = { reader: '독자', recorder: '기록자', librarian: '서재지기' } as const;

export default function MyLibrary() {
  const { profile, setSubView, handleSignOut, gateLevel, myHighlights, mySeojae, myHighlightPairs, shellMetrics, myCoAttendances, coAttendanceVisible, toggleCoAttendanceVisible, selectCoAttendee } = useApp();

  // 최초 안내 배너
  const [showCoAttendanceNotice, setShowCoAttendanceNotice] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && myCoAttendances.length > 0) {
      const shown = localStorage.getItem('withbook-coattendance-notice-shown');
      if (!shown) {
        setShowCoAttendanceNotice(true);
      }
    }
  }, [myCoAttendances.length]);

  const dismissCoAttendanceNotice = () => {
    setShowCoAttendanceNotice(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('withbook-coattendance-notice-shown', 'true');
    }
  };

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
        {/* 밑줄 진행 — 홈 피드에서 옮겨온 카드 (내 기록이므로 여기가 제자리) */}
        <div className="pt-4">
          <GateProgressCard />
        </div>

        {/* Profile section */}
        <div className="bg-surface px-5 py-6 flex flex-col items-center border-b border-border">
          <div className="w-[72px] h-[72px] rounded-full overflow-hidden mb-3">
            <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-[17px] font-semibold text-ink mb-2">{profile.name || '이름 미설정'}</h2>

          {/* 게이트 배지 — 밑줄 수·진행바는 위 진행 카드와 겹쳐서 뺐습니다 */}
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
          </div>

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

        {/* 함께 읽은 사람들 */}
        {myCoAttendances.length > 0 && (
          <div className="bg-surface mt-3 px-5 py-5 border-b border-border">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>함께 읽은 사람들</h3>
              <button
                onClick={toggleCoAttendanceVisible}
                className="flex items-center gap-1.5 press-scale"
                aria-label={coAttendanceVisible ? '숨기기' : '보이기'}
              >
                <span className="text-[11.5px] text-sub">{coAttendanceVisible ? '보임' : '숨김'}</span>
                <div className={`w-[36px] h-[20px] rounded-full transition-colors duration-200 flex items-center ${coAttendanceVisible ? 'bg-action justify-end' : 'bg-chip-border justify-start'}`}>
                  <div className="w-[16px] h-[16px] rounded-full bg-white mx-[2px] shadow-sm" />
                </div>
              </button>
            </div>
            <p className="text-[12px] text-sub mb-4">오프라인 모임에서 함께한 사람들이에요</p>

            {/* 최초 안내 배너 */}
            {showCoAttendanceNotice && coAttendanceVisible && (
              <div className="bg-action/5 border border-action/20 rounded-[11px] p-3 mb-4 flex items-start gap-2">
                <span className="text-[14px] mt-0.5 flex-shrink-0">👋</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] text-ink leading-[1.5]">
                    같은 모임에 참석했던 사람들의 기록이에요. 프라이버시가 걱정되면 토글을 꺼주세요.
                  </p>
                </div>
                <button onClick={dismissCoAttendanceNotice} className="text-[12px] text-sub flex-shrink-0 press-scale">닫기</button>
              </div>
            )}

            {coAttendanceVisible && (
              <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-5 px-5 pb-1">
                {myCoAttendances.map(att => (
                  <button
                    key={att.userId}
                    onClick={() => selectCoAttendee(att.userId)}
                    className="press-scale flex-shrink-0 w-[120px] flex flex-col items-center bg-canvas rounded-[14px] p-3"
                  >
                    <div className="w-[48px] h-[48px] rounded-full overflow-hidden mb-2">
                      <img src={att.userAvatar} alt={att.userName} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[13px] font-semibold text-ink mb-0.5">{att.userName}</p>
                    <p className="text-[11px] text-sub text-center leading-[1.4]">
                      {toKoreanCount(att.count)} 번 같은 자리
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 서재지기 콘솔 — 주최 서재가 1개 이상일 때만 표시 */}
        {mySeojae.some(s => s.members.some(m => m.role === 'owner')) && (
          <button
            onClick={() => setSubView('librarianConsole')}
            className="press-scale w-full bg-surface mt-3 px-5 py-5 border-b border-border text-left flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-[11px] bg-action/10 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066cc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>서재지기 콘솔</h3>
              <p className="text-[12.5px] text-sub mt-0.5">출석 체크, 발제 질문, 운영 관리</p>
            </div>
            <span className="text-[18px] text-sub flex-shrink-0">›</span>
          </button>
        )}

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

        {/* 설정 */}
        <div className="bg-surface mt-3 border-b border-border">
          <h3 className="text-[15px] font-semibold text-ink px-5 pt-5 pb-1" style={{ letterSpacing: '-0.3px' }}>설정</h3>
          <button
            onClick={() => setSubView('privacySettings')}
            className="press-scale focus-ring w-full px-5 py-4 text-left flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[14px] text-ink">개인정보 관리</p>
              <p className="text-[12px] text-sub mt-0.5">동의 내역, 데이터 내려받기, 회원 탈퇴</p>
            </div>
            <span className="text-[16px] text-sub flex-shrink-0">›</span>
          </button>
        </div>

        {/* 독서 기록 — 위의 "밑줄 n/30"과 같은 자료(내 밑줄)를 봅니다 */}
        <div className="bg-surface mt-3 px-5 py-5">
          <h3 className="text-[15px] font-semibold text-ink mb-1" style={{ letterSpacing: '-0.3px' }}>독서 기록</h3>
          <p className="text-[12px] text-sub mb-3">내가 남긴 밑줄 {myHighlights.length}개</p>
          {myHighlights.length > 0 ? (
            <div className="space-y-4">
              {myHighlights.map(h => (
                <div key={h.id} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="w-[42px] h-[58px] rounded-[6px] overflow-hidden flex-shrink-0">
                    {h.book.coverUrl ? (
                      <img src={h.book.coverUrl} alt={h.book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: PLACEHOLDER_COLORS[parseInt(h.book.isbn) % PLACEHOLDER_COLORS.length] }}>
                        <span className="text-white text-[8px]">{h.book.title[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-ink">《{h.book.title}》</p>
                    <p className="text-[12.5px] text-sub mt-0.5 line-clamp-2">&ldquo;{h.sentence}&rdquo;</p>
                    <p className="text-[11px] text-caption mt-1">{h.createdAt}</p>
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

        {/* 방침 링크 — 마이 탭 맨 아래 고정 */}
        <footer className="mt-3 px-5 pt-6 pb-10 border-t border-border">
          <div className="flex items-center justify-center gap-4">
            <a href="/privacy" target="_blank" rel="noreferrer" className="text-[12px] text-sub underline">
              개인정보처리방침
            </a>
            <span className="text-[12px] text-inactive">·</span>
            <a href="/terms" target="_blank" rel="noreferrer" className="text-[12px] text-sub underline">
              이용약관
            </a>
          </div>
          <p className="text-[11px] text-caption text-center mt-2">위드북 (WithBook)</p>
        </footer>
      </div>
    </div>
  );
}
