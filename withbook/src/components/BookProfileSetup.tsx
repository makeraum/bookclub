'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Button from './ui/Button';
import Chip from './ui/Chip';
import Input from './ui/Input';
import { useApp } from '../context/AppContext';
import { GENRES, AUTHORS, READING_BADGES, PLACEHOLDER_COLORS } from '../lib/mock-data';
import * as database from '../lib/database';
import FullScreenSheet from './ui/Overlay';
import type { Book } from '../lib/types';

interface SearchBook extends Book {
  publisher?: string;
}

export default function BookProfileSetup() {
  const { setRoute, setSubView, profile, updateProfile, authUserId, subView, showToast } = useApp();
  const isEdit = subView === 'bookEdit';

  const [slots, setSlots] = useState<(Book | null)[]>(
    profile.favoriteBooks.length === 3 ? [...profile.favoriteBooks] : [null, null, null]
  );
  const [quote, setQuote] = useState(profile.quote);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([...profile.favoriteAuthors]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([...profile.genres]);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([...profile.readingBadges]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchBook[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 작가 직접 추가
  const [authorSearchOpen, setAuthorSearchOpen] = useState(false);
  const [authorQuery, setAuthorQuery] = useState('');
  const [authorSuggestions, setAuthorSuggestions] = useState<string[]>([]);
  const [authorSearching, setAuthorSearching] = useState(false);
  const authorDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 장르 기타 입력
  const [genreInputOpen, setGenreInputOpen] = useState(false);
  const [genreInput, setGenreInput] = useState('');

  // 프리셋에 없는 커스텀 작가/장르 구분
  const presetAuthors = AUTHORS;
  const customAuthors = selectedAuthors.filter(a => !presetAuthors.includes(a));

  const presetGenres = GENRES;
  const customGenres = selectedGenres.filter(g => !presetGenres.includes(g));

  // 책 검색 debounce
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

  // 작가 검색 debounce
  useEffect(() => {
    if (authorDebounceRef.current) clearTimeout(authorDebounceRef.current);

    if (!authorQuery.trim()) {
      setAuthorSuggestions([]);
      setAuthorSearching(false);
      return;
    }

    setAuthorSearching(true);
    authorDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/books/search?type=author&query=${encodeURIComponent(authorQuery.trim())}`);
        if (res.ok) {
          const data: string[] = await res.json();
          setAuthorSuggestions(data);
        }
      } catch {
        // ignore
      } finally {
        setAuthorSearching(false);
      }
    }, 300);

    return () => {
      if (authorDebounceRef.current) clearTimeout(authorDebounceRef.current);
    };
  }, [authorQuery]);

  const handleSlotClick = (index: number) => {
    if (slots[index]) {
      const newSlots = [...slots];
      newSlots[index] = null;
      setSlots(newSlots);
    } else {
      setActiveSlot(index);
      setSearchQuery('');
      setSearchResults([]);
      setSearchOpen(true);
    }
  };

  const handleBookSelect = (book: SearchBook) => {
    const { publisher: _, ...bookData } = book;
    const newSlots = [...slots];
    newSlots[activeSlot] = bookData;
    setSlots(newSlots);
    setSearchOpen(false);
  };

  const toggleAuthor = (author: string) => {
    setSelectedAuthors(prev =>
      prev.includes(author) ? prev.filter(a => a !== author) : prev.length < 5 ? [...prev, author] : prev
    );
  };

  const addAuthor = (author: string) => {
    const trimmed = author.trim();
    if (!trimmed || selectedAuthors.includes(trimmed) || selectedAuthors.length >= 5) return;
    setSelectedAuthors(prev => [...prev, trimmed]);
    setAuthorQuery('');
    setAuthorSuggestions([]);
    setAuthorSearchOpen(false);
  };

  const removeAuthor = (author: string) => {
    setSelectedAuthors(prev => prev.filter(a => a !== author));
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]);
  };

  const addCustomGenre = () => {
    const trimmed = genreInput.trim();
    if (!trimmed || selectedGenres.includes(trimmed)) return;
    setSelectedGenres(prev => [...prev, trimmed]);
    setGenreInput('');
    setGenreInputOpen(false);
  };

  const removeGenre = (genre: string) => {
    setSelectedGenres(prev => prev.filter(g => g !== genre));
  };

  const toggleBadge = (badge: string) => {
    setSelectedBadges(prev => prev.includes(badge) ? prev.filter(b => b !== badge) : [...prev, badge]);
  };

  // 저장 버튼 활성 여부 — 프로필과 달라진 게 있을 때만
  const dirty = useMemo(() => {
    const baseSlots = profile.favoriteBooks.length === 3 ? profile.favoriteBooks : [null, null, null];
    return (
      JSON.stringify(slots) !== JSON.stringify(baseSlots) ||
      quote !== profile.quote ||
      JSON.stringify(selectedAuthors) !== JSON.stringify(profile.favoriteAuthors) ||
      JSON.stringify(selectedGenres) !== JSON.stringify(profile.genres) ||
      JSON.stringify(selectedBadges) !== JSON.stringify(profile.readingBadges)
    );
  }, [slots, quote, selectedAuthors, selectedGenres, selectedBadges, profile]);

  const handleComplete = async () => {
    setSaving(true);
    const updatedProfile = {
      favoriteBooks: slots,
      quote,
      favoriteAuthors: selectedAuthors,
      genres: selectedGenres,
      readingBadges: selectedBadges,
    };
    updateProfile(updatedProfile);

    if (authUserId) {
      try {
        await database.saveProfile(authUserId, { ...profile, ...updatedProfile });
      } catch { /* 로컬에는 저장됨 */ }
    }
    setSaving(false);
    if (isEdit) {
      showToast('저장했어요');
      return true; // FullScreenSheet가 닫아줍니다
    }
    setRoute('main');
    return false;
  };

  // 본문 — 온보딩 페이지와 수정 오버레이가 함께 씁니다
  const sections = (
    <>
        {/* Favorite books */}
        <section className="mb-8">
          <h3 className="text-[15px] font-semibold text-ink mb-1">인생책 3권</h3>
          <p className="text-[12.5px] text-sub mb-4">당신의 인생을 바꾼 책을 골라주세요</p>
          <div className="grid grid-cols-3 gap-3">
            {slots.map((book, i) => (
              <button key={i} onClick={() => handleSlotClick(i)} className="press-scale aspect-[3/4.2] rounded-[11px] overflow-hidden relative">
                {book ? (
                  <>
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-2" style={{ backgroundColor: PLACEHOLDER_COLORS[i] }}>
                        <span className="text-white text-[12px] font-medium text-center leading-tight">{book.title}</span>
                      </div>
                    )}
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-action text-white text-[11px] flex items-center justify-center">✓</div>
                  </>
                ) : (
                  <div className="w-full h-full border-2 border-dashed border-chip-border rounded-[11px] flex flex-col items-center justify-center gap-1">
                    <span className="text-[20px] text-inactive">+</span>
                    <span className="text-[11px] text-inactive">추가</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h3 className="text-[15px] font-semibold text-ink mb-1">인상 깊은 문구</h3>
          <p className="text-[12.5px] text-sub mb-4">가장 마음에 남는 책 속 한 문장</p>
          <Input value={quote} onChange={setQuote} placeholder="책에서 발견한 인상 깊은 문구를 적어주세요" multiline rows={3} />
        </section>

        {/* 좋아하는 작가 */}
        <section className="mb-8">
          <h3 className="text-[15px] font-semibold text-ink mb-1">좋아하는 작가</h3>
          <p className="text-[12.5px] text-sub mb-4">최대 5명까지 선택할 수 있어요</p>
          <div className="flex flex-wrap gap-2">
            {presetAuthors.map(author => (
              <Chip key={author} label={author} selected={selectedAuthors.includes(author)} variant="author" onClick={() => toggleAuthor(author)} />
            ))}
            {/* 커스텀 추가된 작가 칩 (삭제 가능) */}
            {customAuthors.map(author => (
              <button
                key={author}
                onClick={() => removeAuthor(author)}
                className="press-scale flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 border bg-action text-white border-action"
              >
                {author}
                <span className="text-white/70 text-[11px] ml-0.5">×</span>
              </button>
            ))}
            {/* 직접 추가 버튼 */}
            {selectedAuthors.length < 5 && (
              <button
                onClick={() => { setAuthorSearchOpen(true); setAuthorQuery(''); setAuthorSuggestions([]); }}
                className="press-scale flex items-center gap-1 px-4 py-2 rounded-full text-[13px] font-medium border border-dashed border-chip-border text-sub"
              >
                + 직접 추가
              </button>
            )}
          </div>

          {/* 작가 검색 인라인 */}
          {authorSearchOpen && (
            <div className="mt-3 border border-border rounded-[11px] bg-canvas overflow-hidden">
              <div className="flex items-center gap-2 p-3">
                <input
                  type="text"
                  value={authorQuery}
                  onChange={e => setAuthorQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addAuthor(authorQuery); }}
                  placeholder="작가 이름을 검색하세요"
                  autoFocus
                  className="flex-1 text-[14px] text-ink bg-transparent outline-none placeholder:text-inactive"
                />
                <button onClick={() => setAuthorSearchOpen(false)} className="text-[12px] text-sub px-2 py-1">
                  취소
                </button>
              </div>

              {authorQuery.trim() && authorSearching && (
                <div className="flex items-center gap-2 px-3 py-3 border-t border-border">
                  <div className="w-4 h-4 border-2 border-action border-t-transparent rounded-full animate-spin" />
                  <span className="text-[13px] text-sub">검색 중...</span>
                </div>
              )}

              {authorQuery.trim() && !authorSearching && (
                <div className="border-t border-border max-h-[200px] overflow-y-auto">
                  {authorSuggestions
                    .filter(name => !selectedAuthors.includes(name))
                    .map(name => (
                      <button
                        key={name}
                        onClick={() => addAuthor(name)}
                        className="w-full text-left px-3 py-2.5 text-[14px] text-ink hover:bg-surface transition-colors"
                      >
                        {name}
                      </button>
                    ))}
                  {/* 직접 입력 옵션: 입력값이 제안 목록에 없을 때만 표시 */}
                  {authorQuery.trim() && !selectedAuthors.includes(authorQuery.trim()) && !authorSuggestions.includes(authorQuery.trim()) && (
                    <button
                      onClick={() => addAuthor(authorQuery)}
                      className="w-full text-left px-3 py-2.5 text-[14px] text-action font-medium hover:bg-surface transition-colors border-t border-border"
                    >
                      &ldquo;{authorQuery.trim()}&rdquo; 추가
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* 선호 장르 */}
        <section className="mb-8">
          <h3 className="text-[15px] font-semibold text-ink mb-1">선호 장르</h3>
          <p className="text-[12.5px] text-sub mb-4">관심 있는 장르를 모두 선택해주세요</p>
          <div className="flex flex-wrap gap-2">
            {presetGenres.map(genre => (
              <Chip key={genre} label={genre} selected={selectedGenres.includes(genre)} variant="genre" onClick={() => toggleGenre(genre)} />
            ))}
            {/* 커스텀 장르 칩 (삭제 가능) */}
            {customGenres.map(genre => (
              <button
                key={genre}
                onClick={() => removeGenre(genre)}
                className="press-scale flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 border bg-ink text-white border-ink"
              >
                {genre}
                <span className="text-white/70 text-[11px] ml-0.5">×</span>
              </button>
            ))}
            {/* 기타 추가 버튼 */}
            <button
              onClick={() => { setGenreInputOpen(true); setGenreInput(''); }}
              className="press-scale flex items-center gap-1 px-4 py-2 rounded-full text-[13px] font-medium border border-dashed border-chip-border text-sub"
            >
              기타 +
            </button>
          </div>

          {/* 장르 입력 인라인 */}
          {genreInputOpen && (
            <div className="mt-3 flex items-center gap-2 border border-border rounded-[11px] bg-canvas p-3">
              <input
                type="text"
                value={genreInput}
                onChange={e => setGenreInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addCustomGenre(); }}
                placeholder="장르를 입력하세요"
                autoFocus
                className="flex-1 text-[14px] text-ink bg-transparent outline-none placeholder:text-inactive"
              />
              <button
                onClick={addCustomGenre}
                disabled={!genreInput.trim()}
                className="text-[13px] font-medium text-action disabled:text-inactive px-2 py-1"
              >
                추가
              </button>
              <button onClick={() => setGenreInputOpen(false)} className="text-[12px] text-sub px-2 py-1">
                취소
              </button>
            </div>
          )}
        </section>

        <section className="mb-8">
          <h3 className="text-[15px] font-semibold text-ink mb-1">독서 성향 배지</h3>
          <p className="text-[12.5px] text-sub mb-4">나를 표현하는 배지를 골라주세요</p>
          <div className="flex flex-wrap gap-2">
            {READING_BADGES.map(badge => (
              <Chip key={badge} label={badge} selected={selectedBadges.includes(badge)} variant="badge" onClick={() => toggleBadge(badge)} />
            ))}
          </div>
        </section>
    </>
  );

  const searchOverlay = (
    <>
      {/* Book search modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-surface animate-slide-up">
          <div className="px-5 pt-[58px]">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setSearchOpen(false)} className="press-scale w-[34px] h-[34px] rounded-full bg-canvas flex items-center justify-center">
                <span className="text-[18px]">‹</span>
              </button>
              <h2 className="text-[17px] font-semibold text-ink">책 검색</h2>
            </div>
            <Input type="search" value={searchQuery} onChange={setSearchQuery} placeholder="책 제목으로 검색" />
          </div>
          <div className="mt-4 overflow-y-auto" style={{ maxHeight: 'calc(100dvh - 160px)' }}>
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

            {!searching && searchResults.map(book => {
              const isSelected = slots.some(s => s?.isbn === book.isbn);
              return (
                <button key={book.isbn} onClick={() => !isSelected && handleBookSelect(book)} className={`press-scale w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${isSelected ? 'opacity-40' : ''}`}>
                  <div className="w-[38px] h-[52px] rounded-[4px] overflow-hidden flex-shrink-0">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: PLACEHOLDER_COLORS[0] }}>
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
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-action text-white text-[11px] flex items-center justify-center flex-shrink-0">✓</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );

  // 수정 진입 — 화면 전체를 덮는 오버레이
  if (isEdit) {
    return (
      <>
        <FullScreenSheet
          title="책 프로필 수정"
          background="surface"
          onClose={() => setSubView(null)}
          dirty={dirty}
          action={{
            label: saving ? '저장 중' : '저장',
            onTap: handleComplete,
            enabled: dirty && !saving,
          }}
        >
          <div className="px-5 pt-6 pb-10">{sections}</div>
        </FullScreenSheet>
        {searchOverlay}
      </>
    );
  }

  // 온보딩 진입 — 기존 전체 페이지 그대로
  return (
    <div className="flex flex-col min-h-dvh bg-surface animate-slide-up">
      <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm px-5 pt-[58px] pb-3 border-b border-border">
        <h1 className="text-[20px] font-semibold text-ink text-center" style={{ letterSpacing: '-0.3px' }}>
          책 프로필 설정
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-24">
        {sections}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-surface/95 backdrop-blur-sm border-t border-border safe-bottom">
        <Button onClick={handleComplete} disabled={saving}>
          {saving ? '저장 중...' : '완료'}
        </Button>
      </div>

      {searchOverlay}
    </div>
  );
}
