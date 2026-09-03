'use client';

import { useApp } from '../context/AppContext';
import { MOCK_CO_ATTENDANCE_DETAILS, PLACEHOLDER_COLORS } from '../lib/mock-data';
import { toKoreanCount } from '../lib/utils';
import FullScreenSheet from './ui/Overlay';

export default function CoAttendeeProfile() {
  const { selectedCoAttendeeId, selectCoAttendee } = useApp();

  if (!selectedCoAttendeeId) return null;

  const detail = MOCK_CO_ATTENDANCE_DETAILS[selectedCoAttendeeId];
  if (!detail) return null;

  const countText = `${toKoreanCount(detail.count)} 번 같은 자리에 있었어요`;

  return (
    <FullScreenSheet title="함께 읽은 사람" onClose={() => selectCoAttendee(null)}>
      <div className="pb-24">
          {/* 프로필 영역 */}
          <div className="bg-surface px-5 py-6 flex flex-col items-center border-b border-border">
            <div className="w-[64px] h-[64px] rounded-full overflow-hidden mb-3">
              <img src={detail.userAvatar} alt={detail.userName} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-[17px] font-semibold text-ink mb-1">{detail.userName}</h2>
            <p className="text-[13.5px] text-sub">{countText}</p>
          </div>

          {/* 함께한 모임 */}
          <section className="px-5 pt-5">
            <h3 className="text-[15px] font-semibold text-ink mb-3" style={{ letterSpacing: '-0.3px' }}>
              함께한 모임
            </h3>
            <div className="space-y-3">
              {detail.sharedMeetings.map((meeting, i) => {
                const bookColor = PLACEHOLDER_COLORS[parseInt(meeting.book.isbn) % PLACEHOLDER_COLORS.length];
                const dateStr = new Date(meeting.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
                return (
                  <div key={i} className="flex items-center gap-3 bg-surface rounded-[11px] border border-border p-3">
                    <div className="w-[36px] h-[50px] rounded-[5px] overflow-hidden flex-shrink-0">
                      {meeting.book.coverUrl ? (
                        <img src={meeting.book.coverUrl} alt={meeting.book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: bookColor }}
                        >
                          <span className="text-white text-[7px]">{meeting.book.title[0]}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-medium text-ink truncate">
                        &laquo;{meeting.book.title}&raquo;
                      </p>
                      <p className="text-[12px] text-sub mt-0.5">{meeting.seojaeName}</p>
                      <p className="text-[11px] text-caption mt-0.5">{dateStr}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 같은 문장에 머물렀어요 */}
          {detail.sharedHighlight && (
            <section className="px-5 pt-6 pb-4">
              <h3 className="text-[15px] font-semibold text-ink mb-3" style={{ letterSpacing: '-0.3px' }}>
                같은 문장에 머물렀어요
              </h3>
              <div className="bg-surface rounded-[14px] border border-border p-4">
                {/* 공유 문장 */}
                <div className="border-l-[3px] border-action/70 pl-4 py-1 mb-4">
                  <p className="text-[14px] text-ink leading-[1.75] font-medium" style={{ letterSpacing: '-0.2px' }}>
                    &ldquo;{detail.sharedHighlight.sentence}&rdquo;
                  </p>
                  <p className="text-[11.5px] text-caption mt-1.5">
                    &mdash; &laquo;{detail.sharedHighlight.book.title}&raquo; {detail.sharedHighlight.book.author}
                  </p>
                </div>

                {/* 나의 이유 */}
                <div className="bg-canvas rounded-[11px] p-3 mb-2">
                  <p className="text-[11px] font-semibold text-sub mb-1">나의 이유</p>
                  <p className="text-[13px] text-ink leading-[1.6]">{detail.sharedHighlight.myReason}</p>
                </div>

                {/* 상대의 이유 */}
                <div className="bg-canvas rounded-[11px] p-3">
                  <p className="text-[11px] font-semibold text-sub mb-1">{detail.userName}의 이유</p>
                  <p className="text-[13px] text-ink leading-[1.6]">{detail.sharedHighlight.partnerReason}</p>
                </div>
              </div>
            </section>
          )}
      </div>
    </FullScreenSheet>
  );
}
