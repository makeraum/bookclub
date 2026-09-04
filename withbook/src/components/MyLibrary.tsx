'use client';

import { useState, type ReactNode } from 'react';
import { useApp } from '../context/AppContext';
import { useDismissed } from '../lib/use-dismissed';
import { PLACEHOLDER_COLORS, SHELL_METRIC_LABELS } from '../lib/mock-data';
import { toKoreanCount } from '../lib/utils';
import GateProgressLine from './GateProgressCard';

const GATE_LEVEL_LABEL = { reader: '독자', recorder: '기록자', librarian: '서재지기' } as const;

/**
 * 마이 서재 — 3층 구조.
 *   1층 "나"      : 프로필(밑줄 진행·인생책 흡수) + 내 서재 활동
 *   2층 "내 기록"  : 독서 기록 · 함께 읽은 사람들 · 조개 지표(접이식)
 *   3층 "운영·정보": 한 카드 안의 리스트 메뉴 + 방침 푸터
 * 카드 간격은 12px로 통일하고, 3층 행은 56px 컴팩트 높이로 맞췄습니다.
 */
export default function MyLibrary() {
  const {
    profile, setSubView, handleSignOut, gateLevel,
    myHighlights, mySeojae, myHighlightPairs, shellMetrics,
    myCoAttendances, coAttendanceVisible, toggleCoAttendanceVisible, selectCoAttendee,
  } = useApp();

  // 함께 읽은 사람들 — 최초 1회 안내 배너 (닫으면 다시 뜨지 않습니다)
  const [coAttendanceNoticeDismissed, dismissCoAttendanceNotice] = useDismissed(
    'withbook-coattendance-notice-shown'
  );
  const showCoAttendanceNotice = !coAttendanceNoticeDismissed && myCoAttendances.length > 0;

  const isHost = mySeojae.some(s => s.members.some(m => m.role === 'owner'));
  const hasFavoriteBook = profile.favoriteBooks.some(Boolean);

  return (
    <div className="flex flex-col min-h-dvh bg-canvas">
      {/* Header — 로그아웃은 맨 아래 푸터로 내렸습니다 */}
      <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm px-5 pt-[58px] pb-3 border-b border-border">
        <h1 className="text-[20px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
          마이 서재
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-24 space-y-3">

        {/* ───── 1층 · 나 ───── */}

        {/* 프로필 — 일러스트 · 이름 · 배지 · 수정 · 밑줄 진행 · 인생책 */}
        <section className="bg-surface rounded-[16px] border border-border overflow-hidden">
          <div className="px-5 pt-5 pb-4 flex flex-col items-center">
            <div className="w-[72px] h-[72px] rounded-full overflow-hidden mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-[17px] font-semibold text-ink mb-2">{profile.name || '이름 미설정'}</h2>

            <div className="flex flex-wrap justify-center gap-1.5 mb-3">
              <span className={`px-3 py-1 text-[11px] font-semibold rounded-full ${
                gateLevel === 'reader' ? 'bg-ink text-white' : 'bg-action text-white'
              }`}>
                {GATE_LEVEL_LABEL[gateLevel]}
                {gateLevel === 'librarian' && (
                  <span className="ml-1 font-normal opacity-80">· 초대로 승급</span>
                )}
              </span>
              {profile.readingBadges.map(badge => (
                <span key={badge} className="px-3 py-1 bg-ink text-white text-[11px] font-medium rounded-full">
                  {badge}
                </span>
              ))}
            </div>

            <button
              onClick={() => setSubView('bookEdit')}
              className="press-scale focus-ring px-5 py-2 border border-border rounded-full text-[13px] font-medium text-ink"
            >
              책 프로필 수정
            </button>
          </div>

          {/* 밑줄 진행 — 얇은 한 줄로 흡수 */}
          <div className="px-5 py-3 border-t border-border">
            <GateProgressLine />
          </div>

          {/* 인생책 3권 — 프로필 바로 아래에 붙여 맥락을 되찾았습니다 */}
          <div className="px-5 py-4 border-t border-border">
            {hasFavoriteBook ? (
              <>
                <h3 className="text-[13px] font-semibold text-ink mb-2.5" style={{ letterSpacing: '-0.3px' }}>
                  인생책 3권
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {profile.favoriteBooks.map((book, i) => (
                    <div key={i} className="aspect-[3/4.2] rounded-[11px] overflow-hidden">
                      {book ? (
                        book.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
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
              </>
            ) : (
              /* 전부 미등록이면 빈 슬롯을 크게 띄우지 않고 한 줄로 줄입니다 */
              <div className="flex items-center gap-3">
                <p className="flex-1 min-w-0 text-[13px] text-sub">인생책을 등록해 보세요</p>
                <button
                  onClick={() => setSubView('bookEdit')}
                  className="press-scale focus-ring flex-shrink-0 px-3 py-1.5 rounded-full bg-canvas text-[12px] font-medium text-action"
                >
                  등록하기
                </button>
              </div>
            )}
          </div>

          {/* 인상 깊은 문구 — 책 프로필의 일부라 프로필 카드 안에 둡니다 */}
          {profile.quote && (
            <div className="px-5 py-4 border-t border-border">
              <h3 className="text-[13px] font-semibold text-ink mb-2" style={{ letterSpacing: '-0.3px' }}>
                인상 깊은 문구
              </h3>
              <p className="text-[13px] text-ink leading-[1.7] italic">{profile.quote}</p>
            </div>
          )}
        </section>

        {/* 내 서재 활동 */}
        <section className="bg-surface rounded-[16px] border border-border px-5 py-4">
          <h3 className="text-[15px] font-semibold text-ink mb-3" style={{ letterSpacing: '-0.3px' }}>내 서재 활동</h3>
          <div className="flex gap-3">
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
        </section>

        {/* ───── 2층 · 내 기록 ───── */}

        {/* 독서 기록 — 마이 탭의 본문 */}
        <section className="bg-surface rounded-[16px] border border-border px-5 py-4">
          <h3 className="text-[15px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>독서 기록</h3>
          <p className="text-[12px] text-sub mb-3">내가 남긴 밑줄 {myHighlights.length}개</p>
          {myHighlights.length > 0 ? (
            <div className="space-y-3">
              {myHighlights.map(h => (
                <div key={h.id} className="flex gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className="w-[42px] h-[58px] rounded-[6px] overflow-hidden flex-shrink-0">
                    {h.book.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
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
            <div className="py-6 text-center">
              <p className="text-[14px] text-sub">아직 독서 기록이 없어요</p>
              <p className="text-[12.5px] text-caption mt-1">홈에서 ＋ 밑줄 버튼을 눌러 시작해보세요</p>
            </div>
          )}
        </section>

        {/* 함께 읽은 사람들 */}
        {myCoAttendances.length > 0 && (
          <section className="bg-surface rounded-[16px] border border-border px-5 py-4">
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
            <p className="text-[12px] text-sub mb-3">오프라인 모임에서 함께한 사람들이에요</p>

            {/* 최초 1회 안내 배너 */}
            {showCoAttendanceNotice && coAttendanceVisible && (
              <div className="bg-action/5 border border-action/20 rounded-[11px] p-3 mb-3 flex items-start gap-2">
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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
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
          </section>
        )}

        {/* 조개 지표 — 접이식. 0인 항목은 "전체 보기"로만 */}
        <ShellMetricsSection
          values={SHELL_METRIC_LABELS.map(({ key, label, icon, description }) => ({
            key,
            label,
            icon,
            description,
            value: key === 'togetherDays'
              ? (myHighlightPairs.reduce((sum, p) => sum + p.streakCount, 0) || shellMetrics.togetherDays)
              : shellMetrics[key],
          }))}
        />

        {/* ───── 3층 · 운영 · 정보 ───── */}

        <section className="bg-surface rounded-[16px] border border-border overflow-hidden divide-y divide-border">
          {isHost && (
            <MenuRow
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              }
              title="서재지기 콘솔"
              subtitle="출석 체크, 발제 질문, 운영 관리"
              onClick={() => setSubView('librarianConsole')}
            />
          )}
          <MenuRow
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            }
            title="서재 운영 자료실"
            subtitle="진행표, 발제 질문, 스타터 키트 등"
            onClick={() => setSubView('resourceLibrary')}
          />
          <MenuRow
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
            title="개인정보 관리"
            subtitle="동의 내역, 데이터 내려받기, 회원 탈퇴"
            onClick={() => setSubView('privacySettings')}
          />
          <MenuRow
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            }
            title="위드북이 지키는 3가지 원칙"
            subtitle="AI가 대신 읽어주지 않습니다"
            onClick={() => setSubView('principles')}
          />
        </section>

        {/* 방침 · 로그아웃 푸터 */}
        <footer className="pt-5 pb-8">
          <div className="flex items-center justify-center gap-4">
            <a href="/privacy" target="_blank" rel="noreferrer" className="text-[12px] text-sub underline">
              개인정보처리방침
            </a>
            <span className="text-[12px] text-inactive">·</span>
            <a href="/terms" target="_blank" rel="noreferrer" className="text-[12px] text-sub underline">
              이용약관
            </a>
            <span className="text-[12px] text-inactive">·</span>
            <button onClick={handleSignOut} className="text-[12px] text-sub underline press-scale">
              로그아웃
            </button>
          </div>
          <p className="text-[11px] text-caption text-center mt-2">위드북 (WithBook)</p>
        </footer>
      </div>
    </div>
  );
}

/* ── 3층 리스트 행 — 높이 56px 고정 ── */

function MenuRow({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="press-scale focus-ring w-full h-[56px] px-4 flex items-center gap-3 text-left"
    >
      <span className="text-sub flex-shrink-0 flex items-center justify-center w-[20px]">{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-[14px] text-ink leading-[1.35] truncate">{title}</span>
        <span className="block text-[11.5px] text-sub leading-[1.35] truncate">{subtitle}</span>
      </span>
      <span className="text-[16px] text-sub flex-shrink-0">›</span>
    </button>
  );
}

/* ── 조개 지표 — 접이식 + 0인 항목 숨김 ── */

type ShellMetricRow = { key: string; label: string; icon: string; description: string; value: number };

function ShellMetricsSection({ values }: { values: ShellMetricRow[] }) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const earned = values.filter(m => m.value > 0);
  const hiddenCount = values.length - earned.length;
  const rows = showAll ? values : earned;

  return (
    <section className="bg-surface rounded-[16px] border border-border overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="press-scale focus-ring w-full px-5 py-4 flex items-center gap-3 text-left"
      >
        <span className="flex-1 min-w-0">
          <span className="block text-[15px] font-semibold text-ink leading-[1.35]" style={{ letterSpacing: '-0.3px' }}>
            조개 지표
          </span>
          <span className="block text-[12px] text-sub leading-[1.35]">사고 팔 수 없는 지표</span>
        </span>
        {!open && earned.length > 0 && (
          <span className="text-[12px] text-sub flex-shrink-0">{earned.length}개 쌓임</span>
        )}
        <span
          className="text-[13px] text-sub flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        >
          ⌄
        </span>
      </button>

      {open && (
        <div className="px-5 pb-4">
          {rows.length > 0 ? (
            <div className="space-y-3">
              {rows.map(m => (
                <div key={m.key} className="flex items-center gap-3">
                  <span className="text-[16px] w-[24px] text-center flex-shrink-0">{m.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-medium text-ink">{m.label}</p>
                    <p className="text-[11.5px] text-sub">{m.description}</p>
                  </div>
                  <span className={`text-[17px] font-bold flex-shrink-0 ${m.value > 0 ? 'text-ink' : 'text-inactive'}`}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12.5px] text-sub">아직 쌓인 지표가 없어요. 함께 읽으면 하나씩 늘어납니다.</p>
          )}

          {hiddenCount > 0 && (
            <button
              onClick={() => setShowAll(s => !s)}
              className="press-scale focus-ring mt-3 text-[12px] text-action font-medium"
            >
              {showAll ? '쌓인 지표만 보기' : `전체 보기 (${hiddenCount}개 더)`}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
