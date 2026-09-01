'use client';

import { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { handleSignUp, handleSignIn, handleGoogleSignIn, handleDemoLogin, isTestMode } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const minPwLength = isTestMode ? 4 : 6;
  const passwordLongEnough = password.length >= minPwLength;
  const passwordsMatch = password === passwordConfirm;
  const signupReady = mode === 'signup'
    ? !!(email.trim() && name.trim() && passwordLongEnough && passwordConfirm && passwordsMatch)
    : !!(email.trim() && password.trim());

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (!passwordLongEnough) {
      setError(`비밀번호는 ${minPwLength}자 이상이어야 해요.`);
      return;
    }
    if (mode === 'signup' && !passwordsMatch) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    let errMsg: string | null;
    if (mode === 'signup') {
      errMsg = await handleSignUp(email.trim(), password, name.trim());
    } else {
      errMsg = await handleSignIn(email.trim(), password);
    }

    if (errMsg) {
      if (errMsg.includes('Invalid login')) setError('이메일 또는 비밀번호가 맞지 않아요.');
      else if (errMsg.includes('already registered')) setError('이미 가입된 이메일이에요.');
      else if (errMsg.includes('invalid_email') || errMsg.includes('valid email')) setError('올바른 이메일 주소를 입력해주세요.');
      else setError(errMsg);
    }
    setLoading(false);
  };

  const handleDemo = async () => {
    setError('');
    setDemoLoading(true);
    try {
      await handleDemoLogin();
    } catch {
      setError('체험 계정 준비에 실패했어요.');
    }
    setDemoLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    const errMsg = await handleGoogleSignIn();
    if (errMsg) setError(errMsg);
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-dvh px-5 pt-[80px] pb-10 bg-surface animate-slide-up">
      {/* Header */}
      <h1
        className="text-[28px] font-semibold text-ink mb-3"
        style={{ letterSpacing: '-0.5px' }}
      >
        {mode === 'login' ? '다시 만나서 반가워요' : '반가워요'}
      </h1>
      <p className="text-sub text-[15px] leading-relaxed mb-8">
        {mode === 'login'
          ? '이메일과 비밀번호로 로그인하세요.'
          : 'WithBook에서 책으로 연결되는\n새로운 경험을 시작하세요.'}
      </p>

      {/* Form */}
      <div className="space-y-3 mb-4">
        {mode === 'signup' && (
          <Input
            value={name}
            onChange={setName}
            placeholder="이름 (프로필에 표시돼요)"
          />
        )}
        <Input
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="이메일 주소"
        />

        {mode === 'login' ? (
          <Input
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="비밀번호"
          />
        ) : (
          <>
            {/* 비밀번호 + 보기 토글 + 조건 표시 */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={`비밀번호 (${minPwLength}자 이상)`}
                  className={`w-full px-4 py-3 pr-11 rounded-[11px] border bg-surface text-ink text-[14px] placeholder:text-inactive outline-none transition-colors duration-200 ${
                    !password
                      ? 'border-border focus:border-action'
                      : passwordLongEnough
                        ? 'border-[#34c759] focus:border-[#34c759]'
                        : 'border-[#ff3b30] focus:border-[#ff3b30]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-sub"
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {password && (
                <p className={`text-[12px] mt-1.5 px-1 flex items-center gap-1 ${passwordLongEnough ? 'text-[#34c759]' : 'text-[#ff3b30]'}`}>
                  <span className="text-[13px]">{passwordLongEnough ? '✓' : '✕'}</span>
                  {passwordLongEnough ? '사용 가능한 비밀번호예요' : `비밀번호는 ${minPwLength}자 이상이어야 해요`}
                </p>
              )}
            </div>

            {/* 비밀번호 확인 + 보기 토글 + 일치 표시 */}
            <div>
              <div className="relative">
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  placeholder="비밀번호 확인"
                  className={`w-full px-4 py-3 pr-11 rounded-[11px] border bg-surface text-ink text-[14px] placeholder:text-inactive outline-none transition-colors duration-200 ${
                    !passwordConfirm
                      ? 'border-border focus:border-action'
                      : passwordsMatch
                        ? 'border-[#34c759] focus:border-[#34c759]'
                        : 'border-[#ff3b30] focus:border-[#ff3b30]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-sub"
                  aria-label={showPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showPasswordConfirm ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordConfirm && (
                <p className={`text-[12px] mt-1.5 px-1 flex items-center gap-1 ${passwordsMatch ? 'text-[#34c759]' : 'text-[#ff3b30]'}`}>
                  <span className="text-[13px]">{passwordsMatch ? '✓' : '✕'}</span>
                  {passwordsMatch ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-[13px] text-red-500 mb-3 px-1">{error}</p>
      )}

      {/* Submit */}
      <Button onClick={handleSubmit} disabled={loading || !signupReady}>
        {loading ? '잠시만요...' : mode === 'login' ? '로그인' : '회원가입'}
      </Button>

      {/* Toggle mode */}
      <button
        onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setPasswordConfirm(''); setShowPassword(false); setShowPasswordConfirm(false); }}
        className="mt-4 text-[13px] text-sub text-center"
      >
        {mode === 'login' ? (
          <>계정이 없으신가요? <span className="text-action font-medium">회원가입</span></>
        ) : (
          <>이미 계정이 있으신가요? <span className="text-action font-medium">로그인</span></>
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[12px] text-sub">또는</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* OAuth buttons */}
      <div className="space-y-3">
        {/* Google — 실제 동작 */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="press-scale w-full py-3.5 rounded-full border border-border bg-surface text-[15px] font-semibold text-ink flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-40"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          구글로 계속하기
        </button>

        {/* Apple — 준비 중 */}
        <Button variant="dark" disabled>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="white">
            <path d="M14.94 9.88c-.02-2.08 1.7-3.08 1.78-3.13-0.97-1.42-2.48-1.61-3.01-1.63-1.28-.13-2.5.75-3.15.75-.65 0-1.65-.73-2.71-.71-1.4.02-2.68.81-3.4 2.06-1.45 2.52-.37 6.25 1.04 8.3.69 1 1.51 2.12 2.59 2.08 1.04-.04 1.43-.67 2.69-.67 1.25 0 1.61.67 2.71.65 1.12-.02 1.83-.98 2.51-1.99.79-1.15 1.12-2.27 1.14-2.33-.02-.01-2.18-.84-2.2-3.32zM12.87 3.88c.57-.7.96-1.66.85-2.63-.82.03-1.82.55-2.41 1.24-.53.61-.99 1.59-.87 2.53.92.07 1.86-.46 2.43-1.14z"/>
          </svg>
          Apple로 계속하기 (준비 중)
        </Button>

        {/* Kakao — 준비 중 */}
        <Button variant="kakao" disabled>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              d="M9 2C5.13 2 2 4.48 2 7.54c0 1.97 1.3 3.7 3.27 4.67l-.84 3.06c-.07.24.2.44.42.3L8.4 13.3c.2.02.4.03.6.03 3.87 0 7-2.48 7-5.54C16 4.48 12.87 2 9 2z"
              fill="#1d1d1f"
            />
          </svg>
          카카오로 계속하기 (준비 중)
        </Button>
      </div>

      {/* Demo login (test mode only) */}
      {isTestMode && (
        <>
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[12px] text-sub">또는</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <button
            onClick={handleDemo}
            disabled={demoLoading || loading}
            className="press-scale w-full py-3 text-[14px] text-action font-medium transition-all duration-200 disabled:opacity-40"
          >
            {demoLoading ? '체험 계정 준비 중...' : '체험 계정으로 둘러보기'}
          </button>
        </>
      )}

      {/* Terms */}
      <p className="text-[11px] text-caption text-center mt-8 leading-relaxed">
        계속하면{' '}
        <span className="underline">이용약관</span> 및{' '}
        <span className="underline">개인정보처리방침</span>에
        <br />
        동의하는 것으로 간주됩니다.
      </p>
    </div>
  );
}
