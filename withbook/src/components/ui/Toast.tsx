'use client';

import { useApp } from '../../context/AppContext';

/** 저장·완료처럼 잠깐 알리고 사라지는 메시지 */
export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div className="fixed left-0 right-0 z-[70] flex justify-center px-5 pointer-events-none" style={{ bottom: 88 }}>
      <div className="animate-toast bg-dark text-white text-[13.5px] font-medium px-5 py-3 rounded-full shadow-lg">
        {toast}
      </div>
    </div>
  );
}
