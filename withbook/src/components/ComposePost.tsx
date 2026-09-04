'use client';

import { useState, useEffect } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import { useApp } from '../context/AppContext';
import { PLACEHOLDER_COLORS } from '../lib/mock-data';
import type { Book } from '../lib/types';
import FullScreenSheet from './ui/Overlay';

interface SearchBook extends Book {
  publisher?: string;
}

type Step = 'search' | 'sentence' | 'reason';

export default function ComposePost() {
  const { setSubView, addHighlight, showToast } = useApp();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [sentence, setSentence] = useState('');
  const [reason, setReason] = useState('');
  const [context, setContext] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [step, setStep] = useState<Step>('search');
  const [publishing, setPublishing] = useState(false);
  // 검색 상태는 "입력된 검색어"와 "결과가 도착한 검색어"의 차이에서 파생합니다.
  // (이펙트 안에서 동기 setState를 하면 렌더가 연쇄됩니다 — react-hooks/set-state-in-effect)
  const [results, setResults] = useState<SearchBook[]>([]);
  const [resolvedQuery, setResolvedQuery] = useState('');

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

  const handleSelectBook = (book: SearchBook) => {
    const { publisher: _, ...bookData } = book;
    setSelectedBook(bookData);
    setStep('sentence');
  };

  const handleSentenceNext = () => {
    if (!sentence.trim()) return;
    setStep('reason');
  };

  const handlePublish = async () => {
    if (!selectedBook || !sentence.trim()) return;
    setPublishing(true);
    await addHighlight(selectedBook, sentence.trim(), reason.trim(), context.trim());
    setPublishing(false);
    showToast('밑줄을 남겼어요');
    setSubView(null);
  };

  /** 단계가 남아 있으면 한 단계 뒤로, 첫 단계면 오버레이를 닫습니다 */
  const handleBack = (): boolean => {
    if (step === 'reason') { setStep('sentence'); return true; }
    if (step === 'sentence') { setStep('search'); return true; }
    return false;
  };

  const stepLabel = step === 'search' ? '책 선택' : step === 'sentence' ? '문장 입력' : '이유 기록';
  const stepNumber = step === 'search' ? 1 : step === 'sentence' ? 2 : 3;

  // 입력을 시작했으면 그냥 닫히지 않게 합니다
  const dirty = !!selectedBook || !!sentence.trim() || !!reason.trim() || !!context.trim();

  const footer =
    step === 'sentence' ? (
      <Button onClick={handleSentenceNext} disabled={!sentence.trim()}>
        다음
      </Button>
    ) : step === 'reason' ? (
      <Button onClick={handlePublish} disabled={!reason.trim() || publishing}>
        {publishing ? '저장 중...' : '밑줄 남기기'}
      </Button>
    ) : undefined;

  return (
    <FullScreenSheet
      title="밑줄 남기기"
      background="surface"
      onClose={() => setSubView(null)}
      onBack={handleBack}
      dirty={dirty}
      confirmTitle="밑줄을 남기지 않고 나갈까요?"
      confirmBody="입력한 문장과 이유는 저장되지 않습니다."
      footer={footer}
      headerExtra={
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(n => (
              <div key={n} className="flex items-center gap-2 flex-1">
                <div className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
                  n <= stepNumber ? 'bg-action' : 'bg-border'
                }`} />
              </div>
            ))}
          </div>
          <p className="text-[11.5px] text-sub mt-1.5">
            {stepNumber}/3 · {stepLabel}
          </p>
        </div>
      }
    >

      {/* Step 1: Book search */}
      {step === 'search' && (
        <div>
          <div className="px-5 pt-4 pb-3">
            <Input type="search" value={searchQuery} onChange={setSearchQuery} placeholder="책 제목으로 검색" />
          </div>
          <div>
            {!searchQuery.trim() && (
              <div className="flex flex-col items-center justify-center py-16 text-sub">
                <span className="text-[28px] mb-3">📚</span>
                <p className="text-[14px]">책 제목을 입력하세요</p>
              </div>
            )}

            {searchQuery.trim() && searching && (
              <div className="flex flex-col items-center justify-center py-16 text-sub">
                <div className="w-6 h-6 border-2 border-action border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-[14px]">검색 중...</p>
              </div>
            )}

            {searchQuery.trim() && !searching && searchResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-sub">
                <span className="text-[28px] mb-3">🔍</span>
                <p className="text-[14px]">검색 결과가 없어요</p>
              </div>
            )}

            {!searching && searchResults.map(book => (
              <button
                key={book.isbn}
                onClick={() => handleSelectBook(book)}
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
                {selectedBook?.isbn === book.isbn && (
                  <div className="w-5 h-5 rounded-full bg-action text-white text-[11px] flex items-center justify-center flex-shrink-0">✓</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Sentence input */}
      {step === 'sentence' && (
        <div className="px-5 pt-6 pb-24">
          {/* Selected book display */}
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
                <p className="text-[14px] font-semibold text-ink">《{selectedBook.title}》</p>
                <p className="text-[12px] text-sub">{selectedBook.author}</p>
              </div>
            </div>
          )}

          <div>
            <label className="text-[14px] font-semibold text-ink mb-1 block">
              마음에 남은 문장
            </label>
            <p className="text-[12px] text-sub mb-3">
              읽다가 멈춰 섰던 문장, 밑줄을 그은 문장을 적어주세요.
            </p>
            <Input
              value={sentence}
              onChange={setSentence}
              placeholder="책에서 발견한 문장을 그대로 적어주세요"
              multiline
              rows={5}
            />
          </div>
        </div>
      )}

      {/* Step 3: Reason + Context */}
      {step === 'reason' && (
        <div className="px-5 pt-6 pb-24">
          {/* Preview of the sentence */}
          <div className="mb-6 border-l-[3px] border-action/70 pl-4 py-1">
            <p className="text-[13px] text-ink leading-[1.65] font-medium italic">
              &ldquo;{sentence}&rdquo;
            </p>
            <p className="text-[11px] text-sub mt-1">
              《{selectedBook?.title}》 · {selectedBook?.author}
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[14px] font-semibold text-ink mb-1 block">
                왜 이 문장이 남았나요?
              </label>
              <p className="text-[12px] text-sub mb-3">
                이 문장 앞에서 무슨 생각이 들었는지, 왜 멈췄는지 자유롭게 적어주세요.
              </p>
              <Input
                value={reason}
                onChange={setReason}
                placeholder="이 문장이 나에게 남은 이유를 세 줄 정도로 적어주세요"
                multiline
                rows={4}
              />
            </div>
            <div>
              <label className="text-[14px] font-semibold text-ink mb-1 block">
                그때 나는 어떤 상황이었나요?
              </label>
              <p className="text-[12px] text-sub mb-3">
                이 문장을 읽던 시기, 장소, 기분 — 무엇이든 괜찮아요.
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
      )}
    </FullScreenSheet>
  );
}
