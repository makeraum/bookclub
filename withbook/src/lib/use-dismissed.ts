'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * "한 번 닫으면 다시 뜨지 않는" 안내를 localStorage 플래그로 관리합니다.
 *
 * 예전에는 컴포넌트마다 `useEffect`에서 localStorage를 읽어 `setState`를 호출했는데,
 * 그건 렌더 → 이펙트 → 다시 렌더로 이어지는 연쇄 렌더라 React가 권하지 않는 방식입니다
 * (react-hooks/set-state-in-effect). localStorage는 React 밖의 저장소이므로
 * `useSyncExternalStore`로 구독하는 것이 제 용법입니다.
 *
 * 서버 렌더에서는 언제나 "닫힘"으로 봅니다 — 하이드레이션 전에 안내가 잠깐 번쩍이지 않게
 * 하려는 것이고, 이는 기존 `useEffect` 방식의 타이밍과 같습니다.
 */

const listeners = new Set<() => void>();
/** localStorage 저장이 막혔을 때의 세션 한정 대체 (저장은 못 해도 닫히긴 해야 합니다) */
const dismissedInSession = new Set<string>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  // 다른 탭에서 닫은 경우도 반영합니다
  window.addEventListener('storage', onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

function emit() {
  listeners.forEach(listener => listener());
}

export function useDismissed(key: string): [boolean, () => void] {
  const dismissed = useSyncExternalStore(
    subscribe,
    () => {
      if (dismissedInSession.has(key)) return true;
      try {
        return localStorage.getItem(key) !== null;
      } catch {
        // localStorage 접근이 막혀 있으면 안내를 띄우지 않습니다
        return true;
      }
    },
    () => true,
  );

  const dismiss = useCallback(() => {
    dismissedInSession.add(key);
    try {
      localStorage.setItem(key, 'true');
    } catch {
      // 저장이 안 되면 이번 세션 동안만 닫힙니다
    }
    emit();
  }, [key]);

  return [dismissed, dismiss];
}
