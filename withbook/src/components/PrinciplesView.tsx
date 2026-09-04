'use client';

import { useApp } from '../context/AppContext';
import FullScreenSheet from './ui/Overlay';

/**
 * 위드북이 지키는 3가지 원칙.
 * 마이 탭에 큰 검정 카드로 상시 노출돼 있던 것을, 한 번 읽으면 되는 내용이라
 * 운영·정보 리스트의 한 줄로 내리고 이 전체 화면으로 옮겼습니다.
 */
export const PRINCIPLES: { icon: string; title: string; summary: string; body: string }[] = [
  {
    icon: '📖',
    title: 'AI가 대신 읽어주지 않습니다',
    summary: '요약 없이, 밑줄과 메모만 남깁니다',
    body: '책의 줄거리를 요약해 주거나 대신 읽어주는 기능은 만들지 않습니다. 남는 것은 당신이 직접 고른 문장과, 그 문장 옆에 적은 메모뿐입니다.',
  },
  {
    icon: '✍️',
    title: '밑줄은 사람이 쓴 것만 인정합니다',
    summary: 'AI는 "왜 이 문장이 남았나요?"만 묻습니다',
    body: '생성된 문장은 기록으로 세지 않습니다. AI가 하는 일은 질문을 건네는 것까지이고, 답을 쓰는 것은 언제나 사람입니다.',
  },
  {
    icon: '🤝',
    title: '매칭의 최종 확정은 사람이 합니다',
    summary: '알고리즘이 고르고, 사람이 확인합니다',
    body: '밑줄 짝이나 모임 추천은 알고리즘이 후보를 고르는 데까지만 관여합니다. 실제로 이어질지는 서로가 확인한 뒤에 정해집니다.',
  },
];

export default function PrinciplesView() {
  const { setSubView } = useApp();

  return (
    <FullScreenSheet title="위드북이 지키는 3가지 원칙" onClose={() => setSubView(null)}>
      <div className="px-4 py-4 pb-10">
        <div className="bg-dark rounded-[16px] px-5 py-5 mb-3">
          <p className="text-white/95 text-[15px] font-medium leading-[1.6]">
            읽는 일을 대신해 주는 도구는 만들지 않습니다.
          </p>
          <p className="text-white/55 text-[13px] leading-[1.7] mt-2">
            위드북이 기능을 더하거나 뺄 때마다 아래 세 가지를 기준으로 삼습니다.
          </p>
        </div>

        <div className="space-y-3">
          {PRINCIPLES.map((p, i) => (
            <div key={p.title} className="bg-surface rounded-[16px] border border-border p-5">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-[16px]">{p.icon}</span>
                <span className="text-[11.5px] font-semibold text-sub tabular-nums">
                  원칙 {i + 1}
                </span>
              </div>
              <h3 className="text-[15.5px] font-semibold text-ink leading-[1.5]" style={{ letterSpacing: '-0.3px' }}>
                {p.title}
              </h3>
              <p className="text-[12.5px] text-sub mt-1">{p.summary}</p>
              <p className="text-[13.5px] text-ink/85 leading-[1.8] mt-3">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </FullScreenSheet>
  );
}
