'use client';

import { useState, useEffect, useRef } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import { useApp } from '../context/AppContext';
import { PLACEHOLDER_COLORS } from '../lib/mock-data';
import type { Book } from '../lib/types';

interface SearchBook extends Book {
  publisher?: string;
}

type Step = 'search' | 'sentence' | 'reason';

export default function ComposePost() {
  const { setSubView, addHighlight } = useApp();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [sentence, setSentence] = useState('');
  const [reason, setReason] = useState('');
  const [context, setContext] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [step, setStep] = useState<Step>('search');
  const [publishing, setPublishing] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchBook[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/books/search?query=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch {
        // ignore fetch errors
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

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
    setSubView(null);
  };

  const handleBack = () => {
    if (step === 'reason') setStep('sentence');
    else if (step === 'sentence') setStep('search');
    else setSubView(null);
  };

  const stepLabel = step === 'search' ? '책 선택' : step === 'sentence' ? '문장 입력' : '이유 기록';
  const stepNumber = step === 'search' ? 1 : step === 'sentence' ? 2 : 3;

  return (
    <div className="fixed inset-0 z-40 bg-surface animate-slide-up flex flex-col">
      {/* Header */}
      <div className="px-5 pt-[58px] pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="press-scale w-[34px] h-[34px] rounded-full bg-canvas flex items-center justify-center"
          >
            <span className="text-[18px]">‹</span>
          </button>
          <h1 className="text-[17px] font-semibold text-ink">밑줄 남기기</h1>
        </div>
        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-3">
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

      {/* Step 1: Book search */}
      {step === 'search' && (
        <div className="flex-1 overflow-y-auto">
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
        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-24">
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
        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-24">
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

      {/* Bottom action button */}
      {step === 'sentence' && (
        <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-surface/95 backdrop-blur-sm border-t border-border safe-bottom">
          <Button onClick={handleSentenceNext} disabled={!sentence.trim()}>
            다음
          </Button>
        </div>
      )}

      {step === 'reason' && (
        <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-surface/95 backdrop-blur-sm border-t border-border safe-bottom">
          <Button onClick={handlePublish} disabled={!reason.trim() || publishing}>
            {publishing ? '저장 중...' : '밑줄 남기기'}
          </Button>
        </div>
      )}
    </div>
  );
}
