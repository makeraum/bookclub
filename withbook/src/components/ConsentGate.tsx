'use client';

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import ConsentForm from './ConsentForm';
import { EMPTY_CONSENT_DRAFT, isConsentActive, CONSENT_ITEMS, type ConsentDraft } from '../lib/consent';

/**
 * 이미 가입한 계정의 재동의 화면.
 * 소셜 로그인으로 가입해 동의 이력이 없는 경우, 또는 방침이 개정된 경우에 노출됩니다.
 */
export default function ConsentGate() {
  const { consents, saveConsents, gates, setRoute, handleSignOut } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 이전에 동의했던 선택 항목은 체크된 상태로 시작
  const initial: ConsentDraft = CONSENT_ITEMS.reduce(
    (acc, item) => ({ ...acc, [item.type]: isConsentActive(consents, item.type) }),
    { ...EMPTY_CONSENT_DRAFT },
  );

  const isFirstTime = consents.length === 0;

  async function submit(draft: ConsentDraft) {
    setError('');
    setLoading(true);
    const errMsg = await saveConsents(draft);
    if (errMsg) {
      setError(errMsg);
      setLoading(false);
      return;
    }
    setRoute(gates.gate0At ? 'main' : 'onboarding');
    setLoading(false);
  }

  return (
    <div className="relative">
      <ConsentForm
        title={isFirstTime ? '약관에 동의해주세요' : '약관이 개정되었어요'}
        description={
          isFirstTime
            ? '위드북을 이용하려면 아래 항목에 동의가 필요합니다.'
            : '변경된 내용을 확인하고 다시 동의해주세요. 이전에 동의한 선택 항목은 그대로 표시됩니다.'
        }
        submitLabel="동의하고 계속하기"
        loading={loading}
        error={error}
        initial={initial}
        onSubmit={submit}
      />
      <button
        onClick={handleSignOut}
        className="press-scale focus-ring absolute bottom-4 left-0 right-0 mx-auto text-[12.5px] text-sub"
      >
        나중에 하기 (로그아웃)
      </button>
    </div>
  );
}
