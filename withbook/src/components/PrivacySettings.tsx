'use client';

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CONSENT_ITEMS,
  latestConsent,
  isConsentActive,
  POLICY_VERSIONS,
  type ConsentType,
} from '../lib/consent';
import FullScreenSheet from './ui/Overlay';

type View = 'main' | 'withdraw';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PrivacySettings() {
  const { consents, updateConsent, exportMyData, deleteMyAccount, setSubView, authUserId } = useApp();
  const [view, setView] = useState<View>('main');
  const [busy, setBusy] = useState<ConsentType | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  async function toggleOptional(type: ConsentType, next: boolean) {
    setError('');
    setMessage('');
    setBusy(type);
    const errMsg = await updateConsent(type, next);
    if (errMsg) setError(errMsg);
    else setMessage(next ? '동의로 기록했습니다.' : '철회로 기록했습니다.');
    setBusy(null);
  }

  async function handleExport() {
    setError('');
    setMessage('');
    setExporting(true);
    const blob = await exportMyData();
    setExporting(false);
    if (!blob) {
      setError('데이터를 모으지 못했어요. 잠시 후 다시 시도해주세요.');
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `withbook-my-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMessage('내려받기를 시작했습니다.');
  }

  if (view === 'withdraw') {
    return <WithdrawView onBack={() => setView('main')} onDelete={deleteMyAccount} />;
  }

  return (
    <FullScreenSheet title="개인정보 관리" onClose={() => setSubView(null)}>
      <div className="pb-24">
          {/* 동의 내역 */}
          <section className="bg-surface mt-3 px-5 py-5 border-b border-border">
            <h2 className="text-[15px] font-semibold text-ink mb-1" style={{ letterSpacing: '-0.3px' }}>
              동의 내역
            </h2>
            <p className="text-[12px] text-sub mb-4">
              언제 무엇에 동의했는지 기록해 두었습니다. 선택 항목은 언제든 철회할 수 있습니다.
            </p>

            {consents.length === 0 && (
              <p className="text-[13px] text-sub py-4">
                아직 저장된 동의 기록이 없습니다. 다시 로그인하면 동의 절차가 진행됩니다.
              </p>
            )}

            <div className="space-y-4">
              {CONSENT_ITEMS.map(item => {
                const latest = latestConsent(consents, item.type);
                const active = isConsentActive(consents, item.type);
                const outdated = !!latest && latest.policyVersion !== POLICY_VERSIONS[item.type];

                return (
                  <div key={item.type} className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] text-ink leading-[1.5]">
                        <span className={item.required ? 'text-action font-semibold' : 'text-sub'}>
                          [{item.required ? '필수' : '선택'}]
                        </span>{' '}
                        {item.label}
                      </p>
                      <p className="text-[11.5px] text-sub mt-0.5">
                        {latest
                          ? `${active ? '동의' : '철회'} · ${formatDateTime(latest.agreedAt)} · 버전 ${latest.policyVersion}`
                          : '기록 없음'}
                        {outdated && ' · 개정됨'}
                      </p>
                      {item.type === 'sensitive' && !active && (
                        <p className="text-[11.5px] text-caption mt-1 leading-[1.6]">
                          매칭 대상에서 제외된 상태입니다. 같은 책 다른 시선, 서재 추천, 새 밑줄 짝
                          연결은 이용할 수 없습니다.
                        </p>
                      )}
                    </div>

                    {item.required ? (
                      <span className="text-[11.5px] text-caption flex-shrink-0 mt-0.5">필수</span>
                    ) : (
                      <button
                        onClick={() => toggleOptional(item.type, !active)}
                        disabled={busy === item.type || !authUserId}
                        className="press-scale focus-ring flex-shrink-0 mt-0.5 disabled:opacity-40"
                        aria-label={active ? '철회' : '동의'}
                      >
                        <div
                          className={`w-[36px] h-[20px] rounded-full transition-colors duration-200 flex items-center ${
                            active ? 'bg-action justify-end' : 'bg-chip-border justify-start'
                          }`}
                        >
                          <div className="w-[16px] h-[16px] rounded-full bg-white mx-[2px] shadow-sm" />
                        </div>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {message && <p className="text-[12.5px] text-action mt-4">{message}</p>}
            {error && <p className="text-[12.5px] text-red-500 mt-4">{error}</p>}
          </section>

          {/* 내 데이터 내려받기 */}
          <section className="bg-surface mt-3 px-5 py-5 border-b border-border">
            <h2 className="text-[15px] font-semibold text-ink mb-1" style={{ letterSpacing: '-0.3px' }}>
              내 데이터 내려받기
            </h2>
            <p className="text-[12px] text-sub mb-4 leading-[1.6]">
              내 프로필, 밑줄, 회고, 남은 문장 카드, 동의 이력을 JSON 파일로 받습니다.
            </p>
            <button
              onClick={handleExport}
              disabled={exporting || !authUserId}
              className="press-scale focus-ring px-5 py-2.5 border border-border rounded-full text-[13px] font-medium text-ink disabled:opacity-40"
            >
              {exporting ? '모으는 중...' : 'JSON으로 내려받기'}
            </button>
          </section>

          {/* 방침 링크 */}
          <section className="bg-surface mt-3 border-b border-border">
            <PolicyLink href="/privacy" label="개인정보처리방침" />
            <PolicyLink href="/terms" label="서비스 이용약관" last />
          </section>

          {/* 회원 탈퇴 */}
          <section className="bg-surface mt-3 px-5 py-5">
            <h2 className="text-[15px] font-semibold text-ink mb-1" style={{ letterSpacing: '-0.3px' }}>
              회원 탈퇴
            </h2>
            <p className="text-[12px] text-sub mb-4 leading-[1.6]">
              계정과 기록이 삭제됩니다. 되돌릴 수 없습니다.
            </p>
            <button
              onClick={() => setView('withdraw')}
              className="press-scale focus-ring text-[13px] font-medium"
              style={{ color: '#ff3b30' }}
            >
              탈퇴 절차 보기
            </button>
          </section>
      </div>
    </FullScreenSheet>
  );
}

/* ── 방침 링크 한 줄 ── */
function PolicyLink({ href, label, last }: { href: string; label: string; last?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`press-scale focus-ring flex items-center px-5 py-4 ${last ? '' : 'border-b border-border'}`}
    >
      <span className="flex-1 text-[14px] text-ink">{label}</span>
      <span className="text-[16px] text-sub">›</span>
    </a>
  );
}

/* ── 탈퇴 화면 ── */
function WithdrawView({
  onBack,
  onDelete,
}: {
  onBack: () => void;
  onDelete: () => Promise<string | null>;
}) {
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const ready = confirmText.trim() === '탈퇴합니다';

  async function handleDelete() {
    if (!ready) return;
    setError('');
    setDeleting(true);
    const errMsg = await onDelete();
    if (errMsg) {
      setError(errMsg);
      setDeleting(false);
    }
    // 성공하면 로그아웃되어 이 화면이 사라집니다
  }

  return (
    <FullScreenSheet title="회원 탈퇴" onClose={onBack}>
      <div className="px-5 py-6 pb-24">
          <h2 className="text-[19px] font-semibold text-ink mb-2" style={{ letterSpacing: '-0.3px' }}>
            무엇이 사라지는지 먼저 확인해주세요
          </h2>
          <p className="text-[13px] text-sub leading-[1.7] mb-6">
            탈퇴하면 아래 기록이 즉시 삭제됩니다. 삭제한 뒤에는 복구할 수 없습니다.
          </p>

          <div className="bg-surface rounded-[16px] border border-border p-4 mb-4">
            <p className="text-[12px] font-semibold mb-3" style={{ color: '#86868b' }}>
              삭제되는 것
            </p>
            <ul className="space-y-2">
              {[
                '계정과 로그인 정보',
                '프로필, 인생책, 관심 장르, 인상 깊은 문구',
                '내가 남긴 밑줄과 그 이유, 그때의 기록',
                '모임 회고와 남은 문장 카드',
                '동석 기록과 출석 기록',
                '서재·모임 참여 기록, 밑줄 짝',
                '다른 사람의 밑줄에 남긴 반응',
                '개인정보 동의 이력',
              ].map(t => (
                <li key={t} className="text-[13px] text-ink leading-[1.6] flex gap-2">
                  <span className="text-sub flex-shrink-0">·</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[16px] p-4 mb-4" style={{ backgroundColor: '#f5f5f7' }}>
            <p className="text-[12px] font-semibold mb-3" style={{ color: '#86868b' }}>
              남거나 익명 처리되는 것
            </p>
            <ul className="space-y-2">
              <li className="text-[13px] text-ink leading-[1.6] flex gap-2">
                <span className="text-sub flex-shrink-0">·</span>
                <span>서비스 개선을 위해 남긴 피드백은 작성자 연결이 끊긴 채 남습니다.</span>
              </li>
              <li className="text-[13px] text-ink leading-[1.6] flex gap-2">
                <span className="text-sub flex-shrink-0">·</span>
                <span>
                  내가 운영하던 서재는 삭제되지 않고 운영이 중지됩니다. 다른 멤버들의 기록을 함께
                  지울 수 없기 때문입니다.
                </span>
              </li>
              <li className="text-[13px] text-ink leading-[1.6] flex gap-2">
                <span className="text-sub flex-shrink-0">·</span>
                <span>
                  법령이 보존을 요구하는 기록(소비자 분쟁 처리 3년, 접속 기록 3개월)은 해당 기간
                  분리 보관한 뒤 파기합니다.
                </span>
              </li>
            </ul>
          </div>

          <p className="text-[12.5px] text-sub leading-[1.7] mb-6">
            탈퇴 전에 기록을 남겨두고 싶다면, 이전 화면의 &ldquo;내 데이터 내려받기&rdquo;로 먼저
            받아두세요.
          </p>

          <p className="text-[13px] text-ink mb-2">
            확인을 위해 <span className="font-semibold">탈퇴합니다</span> 를 입력해주세요.
          </p>
          <input
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder="탈퇴합니다"
            className="w-full px-4 py-3 bg-surface border border-border rounded-[11px] text-[14px] text-ink placeholder:text-inactive outline-none focus:border-action transition-colors duration-200 mb-4"
          />

          {error && <p className="text-[13px] text-red-500 mb-3">{error}</p>}

          <button
            onClick={handleDelete}
            disabled={!ready || deleting}
            className="press-scale focus-ring w-full py-3.5 rounded-full text-white text-[15px] font-semibold transition-opacity duration-200 disabled:opacity-40"
            style={{ backgroundColor: '#ff3b30' }}
          >
            {deleting ? '삭제하는 중...' : '탈퇴하고 기록 삭제하기'}
          </button>

          <button
            onClick={onBack}
            className="press-scale focus-ring w-full py-3 mt-2 text-[14px] text-sub"
          >
            돌아가기
          </button>
      </div>
    </FullScreenSheet>
  );
}
