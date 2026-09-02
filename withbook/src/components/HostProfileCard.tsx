'use client';

import { useState } from 'react';
import type { Book } from '../lib/types';
import { MOCK_HOST_PROFILES, generateHostIntro, getBookConnection } from '../lib/host-profiles';

interface HostProfileCardProps {
  hostId?: string;
  hostName: string;
  hostAvatar?: string;
  sectionTitle: string;
  book?: Book;
}

export default function HostProfileCard({ hostId, hostName, hostAvatar, sectionTitle, book }: HostProfileCardProps) {
  const profile = hostId ? MOCK_HOST_PROFILES[hostId] : null;
  const [introHidden, setIntroHidden] = useState(false);

  // 프로필이 없는 주최자 (운영팀 등) → 기존 심플 표시
  if (!profile) {
    return (
      <div className="bg-surface mt-3 px-5 py-5 border-b border-border">
        <h3 className="text-[15px] font-semibold text-ink mb-2" style={{ letterSpacing: '-0.3px' }}>
          {sectionTitle}
        </h3>
        <div className="flex items-center gap-3">
          <div className="w-[40px] h-[40px] rounded-full bg-canvas border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
            {hostAvatar ? (
              <img src={hostAvatar} alt={hostName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[16px]">{'\u{1F464}'}</span>
            )}
          </div>
          <span className="text-[14px] text-ink font-medium">{hostName}</span>
        </div>
      </div>
    );
  }

  const intro = generateHostIntro(profile);
  const bookConnection = book ? getBookConnection(profile, book.isbn) : null;
  const showIntro = profile.hasEnoughRecords && profile.introVisible && !introHidden;

  // 대표 밑줄: 이벤트 책이 있으면 해당 책, 없으면 첫 번째 가능한 책
  let featuredHighlights: { sentence: string; reason: string }[] = [];
  let highlightBookTitle: string | null = null;

  if (book?.isbn && profile.bookHighlights[book.isbn]) {
    const data = profile.bookHighlights[book.isbn];
    featuredHighlights = data.featured.slice(0, 2);
    highlightBookTitle = book.title;
  } else {
    const firstIsbn = Object.keys(profile.bookHighlights)[0];
    if (firstIsbn) {
      const data = profile.bookHighlights[firstIsbn];
      featuredHighlights = data.featured.slice(0, 2);
      highlightBookTitle = data.bookTitle;
    }
  }

  const { metrics } = profile;

  return (
    <div className="bg-surface mt-3 px-5 py-5 border-b border-border">
      <h3 className="text-[15px] font-semibold text-ink mb-3" style={{ letterSpacing: '-0.3px' }}>
        {sectionTitle}
      </h3>

      {/* 프로필 헤더 */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-[48px] h-[48px] rounded-full overflow-hidden flex-shrink-0"
          style={{ boxShadow: '0 0 0 2px rgba(0, 102, 204, 0.15)' }}
        >
          <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-ink">{profile.name}</span>
          <span className="px-2 py-0.5 bg-action/10 text-action text-[10.5px] font-semibold rounded-full">
            {profile.title}
          </span>
        </div>
      </div>

      {/* 소개문 */}
      {profile.hasEnoughRecords ? (
        showIntro ? (
          <div className="bg-canvas rounded-[11px] p-4 mb-4">
            <p className="text-[13.5px] text-ink leading-[1.7]">{intro}</p>
            {bookConnection && (
              <p className="text-[13px] text-action font-medium mt-2.5">{bookConnection}</p>
            )}
            {/* 수정·비공개 — 실제로는 주최자 본인에게만 노출 */}
            <div className="flex justify-end mt-2">
              <button
                onClick={() => setIntroHidden(true)}
                className="text-[11px] text-sub/50 hover:text-sub transition-colors"
              >
                비공개
              </button>
            </div>
          </div>
        ) : introHidden ? (
          <div className="bg-canvas rounded-[11px] p-4 mb-4 flex items-center justify-between">
            <p className="text-[13px] text-sub">소개가 비공개 상태입니다</p>
            <button
              onClick={() => setIntroHidden(false)}
              className="text-[11px] text-action font-medium"
            >
              공개
            </button>
          </div>
        ) : null
      ) : (
        <div className="bg-canvas rounded-[11px] p-4 mb-4">
          <p className="text-[13.5px] text-sub leading-[1.7]">아직 기록이 쌓이는 중입니다.</p>
        </div>
      )}

      {/* 검증 지표 (조개 기반, 숫자만 사실 그대로) */}
      {profile.hasEnoughRecords && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          <MetricPill label="밑줄" value={metrics.highlightCount} unit="개" />
          <MetricPill label="완독" value={metrics.completedBooks} unit="권" />
          <MetricPill label="모임" value={metrics.hostedMeetings} unit="회" />
          <MetricPill label="발제" value={metrics.discussionCredits} />
          <MetricPill label="붙듦" value={metrics.mentorSticks} />
        </div>
      )}

      {/* 대표 밑줄 인용 카드 */}
      {showIntro && featuredHighlights.length > 0 && (
        <div className="mb-3">
          <p className="text-[12px] font-semibold text-sub mb-2">대표 밑줄</p>
          <div className="space-y-2">
            {featuredHighlights.map((h, i) => (
              <div key={i} className="bg-canvas rounded-[11px] p-4">
                <p className="text-[13.5px] text-ink leading-[1.7]">
                  &ldquo;{h.sentence}&rdquo;
                </p>
                {highlightBookTitle && (
                  <p className="text-[11.5px] text-sub mt-1.5">
                    &mdash; {'\u300A'}{highlightBookTitle}{'\u300B'}
                  </p>
                )}
                <p className="text-[12.5px] text-sub leading-[1.6] mt-2">{h.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 고지 */}
      {showIntro && (
        <p className="text-[11px] text-[#6e6e73]/60 leading-[1.5]">
          이 소개는 주최자가 남긴 기록을 바탕으로 정리되었습니다
        </p>
      )}
    </div>
  );
}

function MetricPill({ label, value, unit }: { label: string; value: number; unit?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 px-2.5 py-1 bg-canvas rounded-full text-[11.5px] text-sub border border-[#e0e0e0]/50">
      {label} <span className="font-semibold text-ink">{value}</span>{unit || ''}
    </span>
  );
}
