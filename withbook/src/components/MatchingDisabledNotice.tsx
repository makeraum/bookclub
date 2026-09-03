'use client';

import { useApp } from '../context/AppContext';

/**
 * 민감정보(독서기록·문장·가치관 태그) 처리에 동의하지 않은 사용자에게
 * 취향 매칭 자리에 대신 보여주는 안내.
 */
export default function MatchingDisabledNotice({ feature }: { feature: string }) {
  const { setTab, setSubView } = useApp();

  return (
    <div className="rounded-[16px] p-4" style={{ backgroundColor: '#f5f5f7' }}>
      <p className="text-[13.5px] font-semibold text-ink mb-1" style={{ letterSpacing: '-0.2px' }}>
        {feature}은 지금 꺼져 있어요
      </p>
      <p className="text-[12.5px] text-sub leading-[1.7] mb-3">
        취향 매칭은 어떤 책을 읽고 어떤 문장에 밑줄을 그었는지를 씁니다. 민감정보 처리에 동의하지
        않으면 매칭 대상에서 제외됩니다. 밑줄을 남기고 모임에 참여하는 것은 그대로 이용할 수 있어요.
      </p>
      <button
        onClick={() => {
          setTab('my');
          setSubView('privacySettings');
        }}
        className="press-scale focus-ring text-[12.5px] text-action font-medium"
      >
        개인정보 관리에서 동의하기
      </button>
    </div>
  );
}
