'use client';

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { submitFeedback } from '../lib/database';

const SCREEN_NAMES: Record<string, string> = {
  home: '홈',
  seojae: '서재',
  participate: '참가',
  chat: '채팅',
  my: '마이 서재',
};

export default function FeedbackButton() {
  const { tab, authUserId } = useApp();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const screenName = SCREEN_NAMES[tab] || tab;

  async function handleSubmit() {
    const text = message.trim();
    if (!text) return;

    setSending(true);
    try {
      await submitFeedback(screenName, text, authUserId || undefined);
      setSent(true);
      setMessage('');
      setTimeout(() => {
        setOpen(false);
        setSent(false);
      }, 1500);
    } catch {
      // Supabase 저장 실패 시에도 조용히 닫기
      setSent(true);
      setTimeout(() => {
        setOpen(false);
        setSent(false);
      }, 1500);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setOpen(true)}
        className="fixed z-40 w-11 h-11 rounded-full bg-ink text-white shadow-lg flex items-center justify-center press-scale"
        style={{
          right: 16,
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
        }}
        aria-label="피드백 보내기"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      </button>

      {/* 피드백 모달 */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* 배경 */}
          <div className="absolute inset-0 bg-black/40" onClick={() => { if (!sending) setOpen(false); }} />

          {/* 바텀시트 */}
          <div className="relative w-full max-w-[430px] bg-surface rounded-t-[20px] animate-slide-up">
            {/* 핸들 */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-muted/50" />
            </div>

            <div className="px-5 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
              <h3 className="text-[16px] font-semibold text-ink mb-1">의견 보내기</h3>
              <p className="text-[12px] text-sub mb-4">
                {screenName} 화면에서 보내는 피드백이에요
              </p>

              {sent ? (
                <div className="py-8 text-center animate-fade">
                  <p className="text-[32px] mb-2">&#10003;</p>
                  <p className="text-[15px] font-semibold text-ink">감사합니다!</p>
                  <p className="text-[13px] text-sub mt-1">소중한 의견 잘 받았어요</p>
                </div>
              ) : (
                <>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="불편한 점, 아쉬운 점, 좋았던 점 무엇이든 알려주세요"
                    rows={4}
                    className="w-full bg-canvas border border-border rounded-[11px] px-4 py-3 text-[14px] text-ink placeholder:text-sub resize-none outline-none focus:ring-2 focus:ring-action/30"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setOpen(false)}
                      className="flex-1 py-3 rounded-full border border-border text-[14px] font-semibold text-ink"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!message.trim() || sending}
                      className="flex-1 py-3 rounded-full bg-action text-white text-[14px] font-semibold disabled:opacity-40 transition-opacity"
                    >
                      {sending ? '보내는 중...' : '보내기'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
