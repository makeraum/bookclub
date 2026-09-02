'use client';

import { useApp } from '../context/AppContext';
import { MOCK_SEOJAE } from '../lib/mock-data';
import HostProfileCard from './HostProfileCard';

export default function SeojaeDetail() {
  const { selectedSeojaeId, selectSeojae, joinSeojae, leaveSeojae, joinedSeojaeIds, mySeojae, setTab, setSubView } = useApp();

  const seojae = MOCK_SEOJAE.find(s => s.id === selectedSeojaeId)
    || mySeojae.find(s => s.id === selectedSeojaeId);

  if (!seojae) return null;

  const isJoined = joinedSeojaeIds.has(seojae.id) || mySeojae.some(s => s.id === seojae.id);
  const isFull = seojae.memberCount >= seojae.maxMembers;
  const isOwner = mySeojae.some(s => s.id === seojae.id && s.members.some(m => m.role === 'owner'));

  const handleJoin = async () => {
    await joinSeojae(seojae.id);
  };

  const handleLeave = async () => {
    await leaveSeojae(seojae.id);
    selectSeojae(null);
  };

  const handleChatOpen = () => {
    selectSeojae(null);
    setTab('chat');
  };

  return (
    <div className="fixed inset-0 z-40 bg-canvas animate-slide-up">
      <div className="flex flex-col min-h-dvh max-w-[430px] mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm px-5 pt-[58px] pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => selectSeojae(null)}
              className="press-scale w-[34px] h-[34px] rounded-full bg-canvas flex items-center justify-center"
            >
              <span className="text-[18px]">‹</span>
            </button>
            <h1 className="text-[17px] font-semibold text-ink truncate flex-1">{seojae.name}</h1>
            {isOwner && (
              <button
                onClick={() => setSubView('librarianConsole')}
                className="px-3 py-1.5 rounded-full border border-action/30 text-[12px] font-semibold text-action press-scale"
              >
                운영
              </button>
            )}
            {isJoined && (
              <button
                onClick={handleChatOpen}
                className="p-2 -mr-1 rounded-lg active:bg-muted/20"
                aria-label="채팅"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-28">
          {/* Hero */}
          <div className="bg-surface px-5 py-6 flex flex-col items-center border-b border-border">
            <h2 className="text-[19px] font-semibold text-ink text-center" style={{ letterSpacing: '-0.3px' }}>
              {seojae.name}
            </h2>
            <p className="text-[13px] text-sub mt-1">
              {seojae.memberCount}/{seojae.maxMembers}명 참여 중
            </p>
          </div>

          {/* 서재지기 */}
          <HostProfileCard
            hostId={seojae.ownerId}
            hostName={seojae.ownerName}
            hostAvatar={seojae.ownerAvatar}
            sectionTitle="서재지기"
            book={seojae.currentBook}
          />

          {/* 소개 */}
          <div className="bg-surface mt-3 px-5 py-5 border-b border-border">
            <h3 className="text-[15px] font-semibold text-ink mb-2" style={{ letterSpacing: '-0.3px' }}>
              서재 소개
            </h3>
            <p className="text-[13.5px] text-sub leading-[1.7]">{seojae.description}</p>
          </div>

          {/* 월간 오프라인 */}
          {seojae.monthlyOfflineDay && (
            <div className="bg-surface mt-3 px-5 py-5 border-b border-border">
              <h3 className="text-[15px] font-semibold text-ink mb-2" style={{ letterSpacing: '-0.3px' }}>
                오프라인 모임
              </h3>
              <div className="flex items-center gap-3 p-3 bg-action/5 rounded-[11px]">
                <div className="w-10 h-10 rounded-full bg-action/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[18px]">📅</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-action">정기 오프라인</p>
                  <p className="text-[14px] font-medium text-ink">{seojae.monthlyOfflineDay}</p>
                </div>
              </div>
            </div>
          )}

          {/* 멤버 목록 — 성별 표시 없음, 매칭 요소 없음 */}
          <div className="bg-surface mt-3 px-5 py-5 border-b border-border">
            <h3 className="text-[15px] font-semibold text-ink mb-3" style={{ letterSpacing: '-0.3px' }}>
              멤버 ({seojae.memberCount}명)
            </h3>
            <ul className="space-y-3">
              {seojae.members.map(m => (
                <li key={m.userId} className="flex items-center gap-3">
                  <div className="w-[40px] h-[40px] rounded-full overflow-hidden flex-shrink-0">
                    <img src={m.userAvatar} alt={m.userName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] text-ink font-medium">{m.userName}</span>
                    {m.role === 'owner' && (
                      <span className="px-1.5 py-0.5 bg-canvas text-caption text-[10.5px] rounded">서재지기</span>
                    )}
                  </div>
                </li>
              ))}
              {seojae.memberCount > seojae.members.length && (
                <li className="text-[13px] text-sub text-center py-2">
                  외 {seojae.memberCount - seojae.members.length}명
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom action */}
        <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-surface/95 backdrop-blur-sm border-t border-border safe-bottom">
          <div className="max-w-[430px] mx-auto">
            {isJoined ? (
              <button
                onClick={handleLeave}
                disabled={isOwner}
                className="w-full py-3.5 rounded-[14px] text-[15px] font-semibold border border-border text-ink disabled:opacity-40 press-scale"
              >
                {isOwner ? '서재지기는 탈퇴할 수 없어요' : '탈퇴하기'}
              </button>
            ) : (
              <button
                onClick={handleJoin}
                disabled={isFull}
                className="w-full py-3.5 rounded-[14px] text-[15px] font-semibold bg-action text-white disabled:opacity-40 press-scale"
              >
                {isFull ? '마감되었어요' : '참여하기'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
