'use client';

import { useState, useEffect, useRef } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import { useApp } from '../context/AppContext';
import { PLACEHOLDER_COLORS, ONBOARDING_QUESTIONS } from '../lib/mock-data';
import type { Book, OnboardingAnswers } from '../lib/types';

interface SearchBook extends Book {
  publisher?: string;
}

type Step = 'welcome' | 'q1' | 'q2' | 'q3' | 'resultCard' | 'book' | 'highlight';

export default function OnboardingSlides() {
  const { completeGate0, saveOnboardingAnswers, profile } = useApp();
  const [step, setStep] = useState<Step>('welcome');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentence, setSentence] = useState('');
  const [reason, setReason] = useState('');
  const [context, setContext] = useState('');
  const [saving, setSaving] = useState(false);
  // 검색 상태는 "입력된 검색어"와 "결과가 도착한 검색어"의 차이에서 파생합니다.
  // (이펙트 안에서 동기 setState를 하면 렌더가 연쇄됩니다 — react-hooks/set-state-in-effect)
  const [results, setResults] = useState<SearchBook[]>([]);
  const [resolvedQuery, setResolvedQuery] = useState('');
  const [bestsellers, setBestsellers] = useState<SearchBook[]>([]);
  // 베스트셀러는 book 단계에 들어가면 곧바로 불러오므로 "불러오는 중"에서 시작합니다
  const [bestsellersLoading, setBestsellersLoading] = useState(true);
  const bestsellersRequestedRef = useRef(false);

  // 온보딩 질문 답변
  const [answers, setAnswers] = useState<OnboardingAnswers>({ q1: 0, q2: 0, q3: 0 });

  // 베스트셀러 로드 (book 단계 진입 시 한 번)
  useEffect(() => {
    if (step !== 'book' || bestsellersRequestedRef.current) return;
    bestsellersRequestedRef.current = true;

    fetch('/api/books/search?type=bestseller')
      .then(res => res.ok ? res.json() : [])
      .then(data => setBestsellers(data))
      .catch(() => {})
      .finally(() => setBestsellersLoading(false));
  }, [step]);

  // 검색 debounce
  const trimmedQuery = searchQuery.trim();
  const searching = trimmedQuery !== '' && trimmedQuery !== resolvedQuery;
  const searchResults = searching || !trimmedQuery ? [] : results;

  useEffect(() => {
    if (!trimmedQuery) return;

    const timer = setTimeout(async () => {
      let next: SearchBook[] = [];
      try {
        const res = await fetch(`/api/books/search?query=${encodeURIComponent(trimmedQuery)}`);
        if (res.ok) next = await res.json();
      } catch {
        // ignore fetch errors
      }
      setResults(next);
      setResolvedQuery(trimmedQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [trimmedQuery]);

  const displayBooks = searchQuery.trim() ? searchResults : bestsellers;

  // 프로그레스바 3단계: 질문+결과=1, 책=2, 밑줄=3
  const stepNumber =
    step === 'welcome' || step === 'q1' || step === 'q2' || step === 'q3' || step === 'resultCard'
      ? 1
      : step === 'book'
        ? 2
        : 3;

  const handleFinish = async () => {
    if (!selectedBook || !sentence.trim() || !reason.trim()) return;
    setSaving(true);
    await completeGate0(selectedBook, sentence.trim(), reason.trim(), context.trim());
    setSaving(false);
  };

  const handleQ3Next = async () => {
    await saveOnboardingAnswers(answers);
    setStep('resultCard');
  };

  const updateAnswer = (key: 'q1' | 'q2' | 'q3', delta: number) => {
    setAnswers(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta),
    }));
  };

  const handleBookSelect = (book: SearchBook) => {
    const { publisher: _, ...bookData } = book;
    setSelectedBook(bookData);
    setStep('highlight');
  };

  // 질문 화면 렌더링
  const renderQuestionStep = (qKey: 'q1' | 'q2' | 'q3') => {
    const qIndex = qKey === 'q1' ? 0 : qKey === 'q2' ? 1 : 2;
    const question = ONBOARDING_QUESTIONS[qIndex];
    const prevStep: Step = qKey === 'q1' ? 'welcome' : qKey === 'q2' ? 'q1' : 'q2';
    const nextStep: Step | 'save' = qKey === 'q1' ? 'q2' : qKey === 'q2' ? 'q3' : 'save';

    return (
      <div className="flex-1 flex flex-col">
        <div className="px-5 pt-[58px] pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(prevStep)}
              className="press-scale w-[34px] h-[34px] rounded-full bg-canvas flex items-center justify-center"
            >
              <span className="text-[18px]">&#8249;</span>
            </button>
            <h1 className="text-[17px] font-semibold text-ink">독서 관계 질문</h1>
          </div>
          <div className="flex items-center gap-2 mt-3">
            {[1, 2, 3].map(n => (
              <div key={n} className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
                n <= stepNumber ? 'bg-action' : 'bg-border'
              }`} />
            ))}
          </div>
          <p className="text-[12px] text-sub mt-1.5">
            {qIndex + 1}/3
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <p className="text-[18px] font-semibold text-ink text-center leading-[1.6] mb-3" style={{ letterSpacing: '-0.3px' }}>
            {question.question}
          </p>
          <p className="text-[13px] text-sub text-center mb-10">
            {question.description}
          </p>

          {/* 숫자 입력 */}
          <div className="flex items-center gap-5 mb-12">
            <button
              onClick={() => updateAnswer(qKey, -1)}
              className="press-scale w-[48px] h-[48px] rounded-full bg-canvas border border-border flex items-center justify-center text-[22px] text-ink font-medium"
            >
              -
            </button>
            <span className="text-[36px] font-bold text-ink min-w-[60px] text-center">
              {answers[qKey]}
            </span>
            <button
              onClick={() => updateAnswer(qKey, 1)}
              className="press-scale w-[48px] h-[48px] rounded-full bg-canvas border border-border flex items-center justify-center text-[22px] text-ink font-medium"
            >
              +
            </button>
          </div>

          <div className="w-full max-w-sm">
            <Button onClick={() => nextStep === 'save' ? handleQ3Next() : setStep(nextStep)}>
              다음
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-dvh bg-surface">
      {/* Step: Welcome */}
      {step === 'welcome' && (
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-[80px] h-[80px] rounded-[18px] bg-canvas flex items-center justify-center mb-8 animate-pop">
            {/* 밝은 박스 안이라 배경 없는 컬러 마크를 씁니다 */}
            <img
              src="/logo/withbook-mark-color-512.png"
              alt="위드북"
              width={38}
              height={38}
              className="w-[38px] h-[38px]"
            />
          </div>

          <h1
            className="text-[24px] font-semibold text-ink text-center mb-3 animate-fade"
            style={{ letterSpacing: '-0.5px' }}
          >
            {profile.name ? `${profile.name}님, 반갑습니다` : '반갑습니다'}
          </h1>

          <p className="text-sub text-[15px] text-center leading-[1.7] mb-4 animate-fade">
            여기서는 프로필보다 밑줄이 먼저입니다.
          </p>

          <p className="text-sub/70 text-[13px] text-center leading-[1.6] mb-12 max-w-[280px] animate-fade">
            시작하기 전에, 최근 읽은 책 한 권과{'\n'}
            마음에 남은 문장 하나를 남겨주세요.{'\n'}
            그것이 위드북에서의 첫 인사입니다.
          </p>

          <div className="w-full max-w-sm">
            <Button onClick={() => setStep('q1')}>
              시작하기
            </Button>
          </div>
        </div>
      )}

      {/* Step: q1, q2, q3 */}
      {step === 'q1' && renderQuestionStep('q1')}
      {step === 'q2' && renderQuestionStep('q2')}
      {step === 'q3' && renderQuestionStep('q3')}

      {/* Step: resultCard */}
      {step === 'resultCard' && (
        <div className="flex-1 flex flex-col">
          <div className="px-5 pt-[58px] pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('q3')}
                className="press-scale w-[34px] h-[34px] rounded-full bg-canvas flex items-center justify-center"
              >
                <span className="text-[18px]">&#8249;</span>
              </button>
              <h1 className="text-[17px] font-semibold text-ink">독서 관계 지도</h1>
            </div>
            <div className="flex items-center gap-2 mt-3">
              {[1, 2, 3].map(n => (
                <div key={n} className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
                  n <= stepNumber ? 'bg-action' : 'bg-border'
                }`} />
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <h2 className="text-[20px] font-semibold text-ink text-center mb-8" style={{ letterSpacing: '-0.3px' }}>
              당신의 독서 관계 지도
            </h2>

            <div className="w-full max-w-sm space-y-4 mb-8">
              <div className="bg-canvas rounded-[14px] p-4 flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-sub">책 이야기를 나눈 사람</p>
                  <p className="text-[12px] text-sub/60 mt-0.5">{ONBOARDING_QUESTIONS[0].description}</p>
                </div>
                <span className="text-[24px] font-bold text-ink">{answers.q1}명</span>
              </div>
              <div className="bg-canvas rounded-[14px] p-4 flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-sub">같은 책을 읽고 대화한 사람</p>
                  <p className="text-[12px] text-sub/60 mt-0.5">{ONBOARDING_QUESTIONS[1].description}</p>
                </div>
                <span className="text-[24px] font-bold text-ink">{answers.q2}명</span>
              </div>
              <div className="bg-canvas rounded-[14px] p-4 flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-sub">밑줄 치며 읽은 책</p>
                  <p className="text-[12px] text-sub/60 mt-0.5">{ONBOARDING_QUESTIONS[2].description}</p>
                </div>
                <span className="text-[24px] font-bold text-ink">{answers.q3}권</span>
              </div>
            </div>

            <p className="text-[14px] text-sub text-center leading-[1.7] mb-10 max-w-[280px]">
              위드북은 이 숫자를{'\n'}천천히 늘려가는 곳입니다.
            </p>

            <div className="w-full max-w-sm">
              <Button onClick={() => setStep('book')}>
                첫 밑줄 남기기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step: Book selection */}
      {step === 'book' && (
        <>
          <div className="px-5 pt-[58px] pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('resultCard')}
                className="press-scale w-[34px] h-[34px] rounded-full bg-canvas flex items-center justify-center"
              >
                <span className="text-[18px]">&#8249;</span>
              </button>
              <h1 className="text-[17px] font-semibold text-ink">최근 읽은 책</h1>
            </div>
            {/* Step indicator */}
            <div className="flex items-center gap-2 mt-3">
              {[1, 2, 3].map(n => (
                <div key={n} className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
                  n <= stepNumber ? 'bg-action' : 'bg-border'
                }`} />
              ))}
            </div>
            <p className="text-[12px] text-sub mt-1.5">
              최근 완독한 책을 하나 골라주세요
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-5 pt-4 pb-3">
              <Input type="search" value={searchQuery} onChange={setSearchQuery} placeholder="책 제목으로 검색" />
            </div>
            <div>
              {/* 검색어 있고 검색 중 */}
              {searchQuery.trim() && searching && (
                <div className="flex flex-col items-center justify-center py-16 text-sub">
                  <div className="w-6 h-6 border-2 border-action border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-[14px]">검색 중...</p>
                </div>
              )}

              {/* 검색어 있고 결과 없음 */}
              {searchQuery.trim() && !searching && searchResults.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-sub">
                  <span className="text-[28px] mb-3">🔍</span>
                  <p className="text-[14px]">검색 결과가 없어요</p>
                </div>
              )}

              {/* 검색어 없고 베스트셀러 로딩 중 */}
              {!searchQuery.trim() && bestsellersLoading && (
                <div className="flex flex-col items-center justify-center py-16 text-sub">
                  <div className="w-6 h-6 border-2 border-action border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-[14px]">인기 도서를 불러오는 중...</p>
                </div>
              )}

              {/* 검색어 없을 때 베스트셀러 라벨 */}
              {!searchQuery.trim() && !bestsellersLoading && bestsellers.length > 0 && (
                <p className="px-5 pb-2 text-[12px] text-sub">지금 많이 읽는 책</p>
              )}

              {/* 목록 표시 (검색 중이 아닐 때) */}
              {!(searchQuery.trim() && searching) && displayBooks.map(book => (
                <button
                  key={book.isbn}
                  onClick={() => handleBookSelect(book)}
                  className={`press-scale w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                    selectedBook?.isbn === book.isbn ? 'bg-action/5 border-l-2 border-action' : ''
                  }`}
                >
                  <div className="w-[38px] h-[52px] rounded-[4px] overflow-hidden flex-shrink-0">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: PLACEHOLDER_COLORS[0] }}
                      >
                        <span className="text-white text-[8px]">{book.title[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-ink truncate">{book.title}</p>
                    <p className="text-[12px] text-sub truncate">{book.author}</p>
                    {book.publisher && (
                      <p className="text-[11px] text-inactive truncate">{book.publisher}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Step: Sentence + Reason + Context */}
      {step === 'highlight' && (
        <>
          <div className="px-5 pt-[58px] pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('book')}
                className="press-scale w-[34px] h-[34px] rounded-full bg-canvas flex items-center justify-center"
              >
                <span className="text-[18px]">&#8249;</span>
              </button>
              <h1 className="text-[17px] font-semibold text-ink">첫 번째 밑줄</h1>
            </div>
            <div className="flex items-center gap-2 mt-3">
              {[1, 2, 3].map(n => (
                <div key={n} className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
                  n <= stepNumber ? 'bg-action' : 'bg-border'
                }`} />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pt-5 pb-28">
            {/* Selected book */}
            {selectedBook && (
              <div className="flex items-center gap-3 mb-6 p-3 bg-canvas rounded-[11px]">
                <div className="w-[42px] h-[58px] rounded-[6px] overflow-hidden flex-shrink-0">
                  {selectedBook.coverUrl ? (
                    <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: PLACEHOLDER_COLORS[0] }}
                    >
                      <span className="text-white text-[9px]">{selectedBook.title[0]}</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-ink">{'\u300A'}{selectedBook.title}{'\u300B'}</p>
                  <p className="text-[12px] text-sub">{selectedBook.author}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Sentence */}
              <div>
                <label className="text-[14px] font-semibold text-ink mb-1 block">
                  마음에 남은 문장
                </label>
                <p className="text-[12px] text-sub mb-3">
                  읽다가 멈춰 섰던 문장을 적어주세요.
                </p>
                <Input
                  value={sentence}
                  onChange={setSentence}
                  placeholder="책에서 발견한 문장을 그대로 적어주세요"
                  multiline
                  rows={4}
                />
              </div>

              {/* Reason */}
              <div>
                <label className="text-[14px] font-semibold text-ink mb-1 block">
                  왜 이 문장이 남았나요?
                </label>
                <p className="text-[12px] text-sub mb-3">
                  이 문장 앞에서 무슨 생각이 들었는지 자유롭게 적어주세요.
                </p>
                <Input
                  value={reason}
                  onChange={setReason}
                  placeholder="세 줄 정도면 충분해요"
                  multiline
                  rows={4}
                />
              </div>

              {/* Context */}
              <div>
                <label className="text-[14px] font-semibold text-ink mb-1 block">
                  그때 나는 어떤 상황이었나요?
                </label>
                <p className="text-[12px] text-sub mb-3">
                  선택이지만, 적어두면 나중에 다시 볼 때 더 의미 있어요.
                </p>
                <Input
                  value={context}
                  onChange={setContext}
                  placeholder="예: 이직 준비 중이던 겨울, 퇴근길 버스에서"
                  multiline
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-surface/95 backdrop-blur-sm border-t border-border safe-bottom">
            <Button
              onClick={handleFinish}
              disabled={!sentence.trim() || !reason.trim() || saving}
            >
              {saving ? '저장 중...' : '위드북 시작하기'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
