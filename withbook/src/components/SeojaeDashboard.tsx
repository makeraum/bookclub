'use client';

import { useApp } from '../context/AppContext';
import { MOCK_SEOJAE, MOCK_CITY_COMMUNITIES, PLACEHOLDER_COLORS } from '../lib/mock-data';
import type { Seojae, HighlightPair } from '../lib/types';

export default function SeojaeDashboard() {
  const { mySeojae, myHighlightPairs, joinedSeojaeIds, myCityRegion, selectSeojae, selectPair } = useApp();

  // 현재 도시의 모든 서재
  const allSeojae = MOCK_SEOJAE.filter(s =>
    myCityRegion ? s.communityId === MOCK_CITY_COMMUNITIES.find(c => c.region === myCityRegion)?.id : true
  );
  const otherSeojae = allSeojae.filter(s => !mySeojae.some(ms => ms.id === s.id));

  return (
    <div className="flex flex-col min-h-dvh bg-canvas">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm px-5 pt-[58px] pb-3 border-b border-border">
        <h1 className="text-[20px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
          서재
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* 시간 예산 배너 */}
        <div className="px-5 pt-4 pb-2">
          <div className="bg-dark rounded-[14px] px-5 py-4">
            <p className="text-white/90 text-[14px] font-medium leading-[1.6]" style={{ letterSpacing: '-0.2px' }}>
              &ldquo;하루 5분, 한 달에 두 시간.<br />그게 전부입니다.&rdquo;
            </p>
          </div>
        </div>

        {/* 섹션: 나의 밑줄 짝 (L1) */}
        <section className="px-5 pt-5 pb-2">
          <h2 className="text-[15px] font-semibold text-ink mb-3" style={{ letterSpacing: '-0.3px' }}>
            나의 밑줄 짝
          </h2>
          {myHighlightPairs.length > 0 ? (
            <div className="space-y-3">
              {myHighlightPairs.map(pair => (
                <PairCard key={pair.id} pair={pair} onTap={() => selectPair(pair.id)} />
              ))}
            </div>
          ) : (
            <div className="bg-surface rounded-[14px] border border-border p-5 text-center">
              <p className="text-[14px] text-sub">이번 달 밑줄 짝이 아직 매칭되지 않았어요</p>
              <p className="text-[12px] text-caption mt-1">서재에서 같은 책을 읽는 짝이 자동으로 매칭됩니다</p>
            </div>
          )}
        </section>

        {/* 섹션: 나의 서재 (L2) */}
        {mySeojae.length > 0 && (
          <section className="px-5 pt-5 pb-2">
            <h2 className="text-[15px] font-semibold text-ink mb-3" style={{ letterSpacing: '-0.3px' }}>
              나의 서재
            </h2>
            <div className="space-y-3">
              {mySeojae.map(seojae => (
                <SeojaeCard
                  key={seojae.id}
                  seojae={seojae}
                  joined
                  onTap={() => selectSeojae(seojae.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* 섹션: 다른 서재 둘러보기 */}
        {otherSeojae.length > 0 && (
          <section className="px-5 pt-5 pb-4">
            <h2 className="text-[15px] font-semibold text-ink mb-3" style={{ letterSpacing: '-0.3px' }}>
              다른 서재 둘러보기
            </h2>
            <div className="space-y-3">
              {otherSeojae.map(seojae => (
                <SeojaeCard
                  key={seojae.id}
                  seojae={seojae}
                  joined={joinedSeojaeIds.has(seojae.id)}
                  onTap={() => selectSeojae(seojae.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ── 밑줄 짝 카드 ── */
function PairCard({ pair, onTap }: { pair: HighlightPair; onTap: () => void }) {
  const bookColor = PLACEHOLDER_COLORS[parseInt(pair.book.isbn) % PLACEHOLDER_COLORS.length];

  return (
    <button
      onClick={onTap}
      className="press-scale w-full bg-surface rounded-[18px] border border-border p-4 text-left"
    >
      <div className="flex items-center gap-3">
        {/* 파트너 아바타 */}
        <div className="w-[44px] h-[44px] rounded-full overflow-hidden flex-shrink-0">
          <img src={pair.partnerAvatar} alt={pair.partnerName} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[14px] font-semibold text-ink">{pair.partnerName}</span>
            <span className="px-2 py-0.5 bg-action/10 text-action text-[10.5px] font-semibold rounded-full">
              밑줄 짝
            </span>
          </div>
          <p className="text-[12.5px] text-sub truncate">
            《{pair.book.title}》 함께 읽는 중
          </p>
        </div>

        {/* 책 커버 */}
        <div className="w-[36px] h-[50px] rounded-[5px] overflow-hidden flex-shrink-0">
          {pair.book.coverUrl ? (
            <img src={pair.book.coverUrl} alt={pair.book.title} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: bookColor }}
            >
              <span className="text-white text-[7px]">{pair.book.title[0]}</span>
            </div>
          )}
        </div>
      </div>

      {/* 스트릭 */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-action/5 rounded-full">
          <span className="text-[13px]">🔥</span>
          <span className="text-[12.5px] font-semibold text-action">
            함께 읽은 날 {pair.streakCount}일
          </span>
        </div>
      </div>
    </button>
  );
}

/* ── 서재 카드 ── */
function SeojaeCard({
  seojae,
  joined,
  onTap,
}: {
  seojae: Seojae;
  joined: boolean;
  onTap: () => void;
}) {
  const isFull = seojae.memberCount >= seojae.maxMembers;
  const visibleMembers = seojae.members.slice(0, 4);

  return (
    <button
      onClick={onTap}
      className="press-scale w-full bg-surface rounded-[18px] border border-border p-4 text-left"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-ink truncate">{seojae.name}</h3>
          {joined && (
            <span className="px-2 py-0.5 bg-action/10 text-action text-[10.5px] font-semibold rounded-full flex-shrink-0">
              참여중
            </span>
          )}
        </div>
        {isFull && (
          <span className="text-[10.5px] font-semibold text-sub bg-canvas px-2 py-0.5 rounded-full flex-shrink-0">
            마감
          </span>
        )}
      </div>

      {/* 서재지기 */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-[20px] h-[20px] rounded-full overflow-hidden flex-shrink-0">
          <img src={seojae.ownerAvatar} alt={seojae.ownerName} className="w-full h-full object-cover" />
        </div>
        <span className="text-[12px] text-sub">{seojae.ownerName}</span>
        <span className="text-[10.5px] text-caption bg-canvas px-1.5 py-0.5 rounded">서재지기</span>
      </div>

      {/* 정보 */}
      <div className="flex items-center gap-3 text-[12.5px] text-sub">
        <span>👥 {seojae.memberCount}/{seojae.maxMembers}명</span>
        {seojae.monthlyOfflineDay && (
          <>
            <span>·</span>
            <span>📅 {seojae.monthlyOfflineDay}</span>
          </>
        )}
      </div>

      {/* 멤버 아바타 스택 */}
      {visibleMembers.length > 0 && (
        <div className="flex items-center mt-3">
          <div className="flex -space-x-2">
            {visibleMembers.map(m => (
              <div key={m.userId} className="w-[26px] h-[26px] rounded-full overflow-hidden border-2 border-surface">
                <img src={m.userAvatar} alt={m.userName} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          {seojae.memberCount > 4 && (
            <span className="text-[11px] text-sub ml-2">+{seojae.memberCount - 4}명</span>
          )}
        </div>
      )}
    </button>
  );
}
