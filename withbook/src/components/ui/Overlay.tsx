'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

/** 오버레이가 열려 있는 동안 뒤 페이지 스크롤을 잠급니다 (중첩 안전) */
let scrollLockCount = 0;
function lockBodyScroll() {
  scrollLockCount += 1;
  if (scrollLockCount === 1) {
    document.body.style.overflow = 'hidden';
  }
}
function unlockBodyScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = '';
  }
}

const CLOSE_MS = 300;

/**
 * 뒤로가기로 닫히는 오버레이의 공통 동작.
 *
 * 진입할 때 history 항목을 하나 쌓고, 닫기는 항상 history.back()을 거칩니다.
 * 그래서 화면의 닫기 버튼과 브라우저 뒤로가기가 같은 경로를 씁니다.
 * 변경사항이 있으면 뒤로가기도 일단 막고 확인 시트를 띄웁니다.
 */
function useOverlayDismiss({
  onClose,
  dirty,
  onBlockedClose,
}: {
  onClose: () => void;
  dirty: boolean;
  onBlockedClose?: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const dirtyRef = useRef(dirty);
  const confirmedRef = useRef(false);
  const closingRef = useRef(false);

  // 이벤트 핸들러가 최신 dirty를 보도록 렌더 후에 갱신합니다
  useEffect(() => {
    dirtyRef.current = dirty;
  });

  const runClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    setTimeout(onClose, CLOSE_MS);
  }, [onClose]);

  useEffect(() => {
    lockBodyScroll();
    window.history.pushState({ withbookOverlay: true }, '');

    const onPop = () => {
      // 저장하지 않은 변경이 있으면 뒤로가기를 되돌리고 확인부터 받습니다
      if (dirtyRef.current && !confirmedRef.current) {
        window.history.pushState({ withbookOverlay: true }, '');
        onBlockedClose?.();
        return;
      }
      runClose();
    };

    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      unlockBodyScroll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 화면 안의 닫기 버튼 */
  const requestClose = useCallback(() => {
    if (dirtyRef.current && !confirmedRef.current) {
      onBlockedClose?.();
      return;
    }
    window.history.back();
  }, [onBlockedClose]);

  /** 확인 시트에서 "나가기"를 골랐을 때 */
  const forceClose = useCallback(() => {
    confirmedRef.current = true;
    window.history.back();
  }, []);

  return { closing, requestClose, forceClose };
}

/* ── 전체 화면 오버레이 ── */

export interface OverlayAction {
  label: string;
  /**
   * true를 돌려주면 (또는 Promise<true>) 실행 후 오버레이가 닫힙니다.
   * 저장처럼 "하고 나가는" 동작에 씁니다.
   */
  onTap: () => boolean | void | Promise<boolean | void>;
  /** 비활성이면 회색으로 표시되고 눌러도 동작하지 않습니다 */
  enabled?: boolean;
}

/**
 * 페이지 위에 얹히는 화면의 공통 껍데기.
 * 기존 화면들이 저마다 fixed/헤더를 따로 만들던 것을 하나로 모았습니다.
 */
export default function FullScreenSheet({
  title,
  subtitle,
  onClose,
  /** true를 돌려주면 닫지 않고 화면 안에서 처리합니다 (단계 뒤로가기 등) */
  onBack,
  action,
  headerRight,
  dirty = false,
  confirmTitle = '저장하지 않고 나갈까요?',
  confirmBody = '지금까지 입력한 내용은 사라집니다.',
  confirmLeaveLabel = '나가기',
  background = 'canvas',
  headerExtra,
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  onBack?: () => boolean;
  action?: OverlayAction;
  /** 텍스트 버튼 대신 아이콘 등을 넣고 싶을 때 (action보다 우선) */
  headerRight?: ReactNode;
  dirty?: boolean;
  confirmTitle?: string;
  confirmBody?: string;
  confirmLeaveLabel?: string;
  background?: 'canvas' | 'surface';
  /** 헤더 아래 붙는 고정 영역 (탭 바 등) */
  headerExtra?: ReactNode;
  /** 화면 하단에 고정되는 액션 영역 */
  footer?: ReactNode;
  children: ReactNode;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { closing, requestClose, forceClose } = useOverlayDismiss({
    onClose,
    dirty,
    onBlockedClose: () => setConfirmOpen(true),
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  // 열릴 때는 언제나 맨 위에서 시작합니다
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  const bg = background === 'surface' ? 'bg-surface' : 'bg-canvas';
  const actionEnabled = action?.enabled ?? true;

  async function handleAction() {
    if (!action || !actionEnabled) return;
    const shouldClose = await action.onTap();
    if (shouldClose) forceClose();
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${bg} ${closing ? 'sheet-out' : 'sheet-in'}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="flex flex-col h-dvh max-w-[430px] mx-auto">
        {/* 고정 헤더 */}
        <div className="flex-shrink-0 bg-surface/95 backdrop-blur-sm border-b border-border">
          <div className="px-5 pt-[58px] pb-3 flex items-center gap-3">
            <button
              onClick={() => {
                if (onBack?.()) return;
                requestClose();
              }}
              aria-label="닫기"
              className="press-scale focus-ring w-[34px] h-[34px] rounded-full bg-canvas flex items-center justify-center flex-shrink-0"
            >
              <span className="text-[18px] leading-none">&lsaquo;</span>
            </button>

            <div className="flex-1 min-w-0 text-center">
              <h1 className="text-[17px] font-semibold text-ink truncate">{title}</h1>
              {subtitle && <p className="text-[12px] text-sub truncate">{subtitle}</p>}
            </div>

            {headerRight ? (
              <div className="flex-shrink-0 flex items-center gap-1">{headerRight}</div>
            ) : action ? (
              <button
                onClick={handleAction}
                disabled={!actionEnabled}
                className="press-scale focus-ring text-[14px] font-semibold flex-shrink-0 min-w-[34px] text-right transition-colors duration-200"
                style={{ color: actionEnabled ? '#0066cc' : '#86868b' }}
              >
                {action.label}
              </button>
            ) : (
              // 제목을 가운데로 맞추기 위한 자리
              <span className="w-[34px] flex-shrink-0" aria-hidden />
            )}
          </div>
          {headerExtra}
        </div>

        {/* 본문 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>

        {footer && (
          <div className="flex-shrink-0 px-5 py-4 bg-surface/95 backdrop-blur-sm border-t border-border safe-bottom">
            {footer}
          </div>
        )}
      </div>

      {/* 저장하지 않고 나가기 확인 — 오버레이 안에서만 뜨므로 히스토리를 쓰지 않습니다 */}
      {confirmOpen && (
        <BottomSheetShell onClose={() => setConfirmOpen(false)} label={confirmTitle}>
          <h3 className="text-[17px] font-semibold text-ink mb-2" style={{ letterSpacing: '-0.3px' }}>
            {confirmTitle}
          </h3>
          <p className="text-[13.5px] text-sub leading-[1.7] mb-6">{confirmBody}</p>
          <button
            onClick={() => {
              setConfirmOpen(false);
              forceClose();
            }}
            className="press-scale focus-ring w-full py-3.5 rounded-[12px] bg-ink text-white text-[15px] font-semibold"
          >
            {confirmLeaveLabel}
          </button>
          <button
            onClick={() => setConfirmOpen(false)}
            className="press-scale focus-ring w-full py-3 mt-1 text-[14px] text-sub"
          >
            계속 편집하기
          </button>
        </BottomSheetShell>
      )}
    </div>
  );
}

/* ── 바텀 시트 ── */

/**
 * 아래에서 올라오는 시트. 결제·영수·약속 확인처럼 화면 전체를 덮지 않는 경우에 씁니다.
 * 전체 화면 오버레이와 같은 스크롤 잠금·뒤로가기 동작을 공유합니다.
 */
export function BottomSheet({
  onClose,
  label,
  children,
}: {
  onClose: () => void;
  label?: string;
  children: ReactNode;
}) {
  const { closing, requestClose } = useOverlayDismiss({ onClose, dirty: false });
  return (
    <BottomSheetShell onClose={requestClose} label={label} closing={closing}>
      {children}
    </BottomSheetShell>
  );
}

/**
 * 히스토리를 건드리지 않는 순수 바텀 시트.
 * 다른 오버레이 안에서 뜨는 확인 시트처럼, 뒤로가기 스택을 쌓으면
 * 바깥 오버레이의 back()이 확인 시트를 먼저 닫아버리는 경우에 씁니다.
 */
export function BottomSheetShell({
  onClose,
  label,
  closing = false,
  children,
}: {
  onClose: () => void;
  label?: string;
  closing?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true" aria-label={label}>
      <div
        className={`absolute inset-0 bg-black/40 ${closing ? 'dim-out' : 'dim-in'}`}
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-[430px] bg-surface rounded-t-[20px] px-5 pt-6 pb-8 safe-bottom max-h-[88dvh] overflow-y-auto overscroll-contain ${
          closing ? 'sheet-out' : 'sheet-in'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
