'use client';

import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import type { Route, Tab, SubView, Post, UserProfile, Highlight, HighlightReactionType, Book, UserGates, GateLevel, HighlightStats, Seojae, HighlightPair, Region, OnboardingAnswers, ShellMetrics } from '../lib/types';
import { MOCK_POSTS, MOCK_OFFLINE_EVENTS, MOCK_HIGHLIGHTS, MOCK_SEOJAE, MOCK_HIGHLIGHT_PAIRS, MOCK_SHELL_METRICS } from '../lib/mock-data';
import { supabase } from '../lib/supabase';
import * as db from '../lib/database';

const isTestMode = process.env.NEXT_PUBLIC_TEST_MODE === 'true';

const DEFAULT_GATES: UserGates = { gate0At: null, gate1At: null, gate2At: null };
const DEFAULT_STATS: HighlightStats = { totalCount: 0, bookCount: 0 };
const DEFAULT_SHELL_METRICS: ShellMetrics = { readingFollows: 0, togetherDays: 0, discussionCredits: 0, mentorSticks: 0, seasonBadges: 0 };
const GATE1_HIGHLIGHT_THRESHOLD = 30;
const GATE1_BOOK_THRESHOLD = 3;

interface AppState {
  route: Route;
  tab: Tab;
  subView: SubView;
  profile: UserProfile;
  posts: Post[];
  likedPosts: Set<string>;
  joinedSeojaeIds: Set<string>;
  appliedEvents: Set<string>;
  onboardingComplete: boolean;
  authLoading: boolean;
  authUserId: string | null;
  viewedStoryUsers: Set<string>;
  highlights: Highlight[];
  gates: UserGates;
  highlightStats: HighlightStats;
  gateLevel: GateLevel;
  // 온보딩 답변 + 조개 지표
  onboardingAnswers: OnboardingAnswers | null;
  shellMetrics: ShellMetrics;
  // 던바 구조
  mySeojae: Seojae[];
  myHighlightPairs: HighlightPair[];
  myCityRegion: Region | null;
  selectedSeojaeId: string | null;
  selectedPairId: string | null;
}

interface AppContextType extends AppState {
  setRoute: (route: Route) => void;
  setTab: (tab: Tab) => void;
  setSubView: (subView: SubView) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addPost: (post: Post) => void;
  toggleLike: (postId: string) => void;
  joinSeojae: (seojaeId: string) => Promise<void>;
  leaveSeojae: (seojaeId: string) => Promise<void>;
  applyEvent: (eventId: string) => Promise<void>;
  cancelEvent: (eventId: string) => Promise<void>;
  completeOnboarding: () => void;
  handleSignUp: (email: string, password: string, name: string) => Promise<string | null>;
  handleSignIn: (email: string, password: string) => Promise<string | null>;
  handleGoogleSignIn: () => Promise<string | null>;
  handleSignOut: () => void;
  handleDemoLogin: () => Promise<void>;
  isTestMode: boolean;
  markStoryViewed: (userId: string) => void;
  saveProfileToDb: () => Promise<void>;
  addHighlight: (book: Book, sentence: string, reason: string, context: string) => Promise<void>;
  toggleHighlightReaction: (highlightId: string, reactionType: HighlightReactionType) => void;
  completeGate0: (book: Book, sentence: string, reason: string, context: string) => Promise<void>;
  saveOnboardingAnswers: (answers: OnboardingAnswers) => Promise<void>;
  selectSeojae: (id: string | null) => void;
  selectPair: (id: string | null) => void;
  reactToPairHighlight: (pairId: string, highlightId: string) => Promise<void>;
}

const defaultProfile: UserProfile = {
  id: 'me',
  name: '',
  avatarUrl: '/assets/avatar-me.png',
  favoriteBooks: [null, null, null],
  quote: '',
  favoriteAuthors: [],
  genres: [],
  readingBadges: [],
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>('splash');
  const [tab, setTab] = useState<Tab>('home');
  const [subView, setSubView] = useState<SubView>(null);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [joinedSeojaeIds, setJoinedSeojaeIds] = useState<Set<string>>(new Set());
  const [appliedEvents, setAppliedEvents] = useState<Set<string>>(new Set());
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [viewedStoryUsers, setViewedStoryUsers] = useState<Set<string>>(new Set());
  const [highlights, setHighlights] = useState<Highlight[]>(MOCK_HIGHLIGHTS);
  const [gates, setGates] = useState<UserGates>(DEFAULT_GATES);
  const [highlightStats, setHighlightStats] = useState<HighlightStats>(DEFAULT_STATS);

  // 온보딩 답변 + 조개 지표
  const [onboardingAnswers, setOnboardingAnswers] = useState<OnboardingAnswers | null>(null);
  const [shellMetrics, setShellMetrics] = useState<ShellMetrics>(DEFAULT_SHELL_METRICS);

  // 던바 구조 상태
  const [mySeojae, setMySeojae] = useState<Seojae[]>(MOCK_SEOJAE.slice(0, 2));
  const [myHighlightPairs, setMyHighlightPairs] = useState<HighlightPair[]>(MOCK_HIGHLIGHT_PAIRS);
  const [myCityRegion, setMyCityRegion] = useState<Region | null>('대전');
  const [selectedSeojaeId, setSelectedSeojaeId] = useState<string | null>(null);
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);

  // ── 게이트 레벨 계산 ──
  const gateLevel: GateLevel = useMemo(() => {
    if (isTestMode) return 'librarian';
    if (gates.gate2At) return 'librarian';
    if (gates.gate1At) return 'recorder';
    return 'reader';
  }, [gates]);

  // ── 앱 시작 시 세션 확인 ──
  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthUserId(session.user.id);
      } else {
        setAuthUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkSession() {
    try {
      const session = await db.getSession();
      if (session?.user) {
        setAuthUserId(session.user.id);
        const p = await db.fetchProfile(session.user.id);
        if (p) {
          const meta = session.user.user_metadata;
          if (!p.name && meta) {
            const oauthName = meta.full_name || meta.name || '';
            const oauthAvatar = meta.avatar_url || meta.picture || '';
            if (oauthName) {
              p.name = oauthName;
              if (oauthAvatar) p.avatarUrl = oauthAvatar;
              await supabase.from('users').update({
                name: oauthName,
                avatar_url: oauthAvatar || '',
              }).eq('id', session.user.id);
            }
          }

          setProfile(p);

          // 게이트 상태 로드
          const userGates = await db.fetchUserGates(session.user.id);
          setGates(userGates);
          const stats = await db.fetchHighlightStats(session.user.id);
          setHighlightStats(stats);

          // 조개 지표 + 온보딩 답변 로드
          try {
            const metrics = await db.fetchShellMetrics(session.user.id);
            setShellMetrics(metrics);
          } catch {
            setShellMetrics(MOCK_SHELL_METRICS);
          }
          try {
            const answers = await db.fetchOnboardingAnswers(session.user.id);
            setOnboardingAnswers(answers);
          } catch {
            // 답변 없으면 null 유지
          }

          // Gate 0 통과 여부로 라우팅 결정
          if (userGates.gate0At) {
            setOnboardingComplete(true);
            setRoute('main');
          } else {
            // Gate 0 미통과: 기존 favoriteBooks 체크도 폴백으로 유지
            const hasBooks = p.favoriteBooks.some(b => b !== null);
            if (hasBooks) {
              setOnboardingComplete(true);
              setRoute('main');
            } else {
              setRoute('onboarding');
            }
          }
        } else {
          setRoute('onboarding');
        }
        await loadPosts();
        await loadHighlights();
      }
    } catch {
      // Supabase 연결 실패 시 로컬 모드로 동작
    } finally {
      setAuthLoading(false);
    }
  }

  async function loadPosts() {
    try {
      const realPosts = await db.fetchPosts();
      const realIds = new Set(realPosts.map(p => p.id));
      const mockOnly = MOCK_POSTS.filter(p => !realIds.has(p.id));
      setPosts([...realPosts, ...mockOnly]);
    } catch {
      // 실패 시 목업 유지
    }
  }

  async function loadHighlights() {
    try {
      const realHighlights = await db.fetchHighlights();
      const realIds = new Set(realHighlights.map(h => h.id));
      const mockOnly = MOCK_HIGHLIGHTS.filter(h => !realIds.has(h.id));
      setHighlights([...realHighlights, ...mockOnly]);
    } catch {
      // 실패 시 목업 유지
    }
  }

  // ── 인증 ──
  const handleSignUp = useCallback(async (email: string, password: string, name: string): Promise<string | null> => {
    try {
      const data = await db.signUp(email, password, name);
      if (data.user) {
        setAuthUserId(data.user.id);
        setProfile(prev => ({ ...prev, id: data.user!.id, name }));
        setRoute('onboarding');
      }
      return null;
    } catch (err: unknown) {
      return err instanceof Error ? err.message : '회원가입에 실패했어요';
    }
  }, []);

  const handleSignIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      const data = await db.signIn(email, password);
      if (data.user) {
        setAuthUserId(data.user.id);
        const p = await db.fetchProfile(data.user.id);
        if (p) {
          setProfile(p);
        }

        // 게이트 상태 로드
        const userGates = await db.fetchUserGates(data.user.id);
        setGates(userGates);
        const stats = await db.fetchHighlightStats(data.user.id);
        setHighlightStats(stats);

        if (userGates.gate0At) {
          setOnboardingComplete(true);
          setRoute('main');
        } else {
          const hasBooks = p?.favoriteBooks.some(b => b !== null);
          if (hasBooks) {
            setOnboardingComplete(true);
            setRoute('main');
          } else {
            setRoute('onboarding');
          }
        }

        await loadPosts();
        await loadHighlights();
      }
      return null;
    } catch (err: unknown) {
      return err instanceof Error ? err.message : '로그인에 실패했어요';
    }
  }, []);

  const handleGoogleSignIn = useCallback(async (): Promise<string | null> => {
    try {
      await db.signInWithGoogle();
      return null;
    } catch (err: unknown) {
      return err instanceof Error ? err.message : '구글 로그인에 실패했어요';
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await db.signOut();
    setAuthUserId(null);
    setProfile(defaultProfile);
    setPosts(MOCK_POSTS);
    setHighlights(MOCK_HIGHLIGHTS);
    setGates(DEFAULT_GATES);
    setHighlightStats(DEFAULT_STATS);
    setOnboardingComplete(false);
    setOnboardingAnswers(null);
    setShellMetrics(DEFAULT_SHELL_METRICS);
    setJoinedSeojaeIds(new Set());
    setAppliedEvents(new Set());
    setMySeojae(MOCK_SEOJAE.slice(0, 2));
    setMyHighlightPairs(MOCK_HIGHLIGHT_PAIRS);
    setRoute('splash');
    setTab('home');
    setSubView(null);
  }, []);

  // ── 체험 계정 로그인 ──
  const handleDemoLogin = useCallback(async () => {
    const testEmail = process.env.NEXT_PUBLIC_TEST_EMAIL || 'test@withbook.kr';
    const testPassword = process.env.NEXT_PUBLIC_TEST_PASSWORD || 'test1234';
    const now = new Date().toISOString();

    const applyDemoState = () => {
      setProfile(prev => ({ ...prev, name: prev.name || '체험 사용자' }));
      setGates({ gate0At: now, gate1At: now, gate2At: now });
      setHighlightStats({ totalCount: 35, bookCount: 5 });
      setMySeojae(MOCK_SEOJAE.slice(0, 3));
      setJoinedSeojaeIds(new Set(['sj1', 'sj2', 'sj3']));
      setOnboardingComplete(true);
      setRoute('main');
    };

    try {
      // 기존 계정으로 로그인 시도
      const signInResult = await db.signIn(testEmail, testPassword);
      if (signInResult.user) {
        setAuthUserId(signInResult.user.id);
        const p = await db.fetchProfile(signInResult.user.id);
        if (p) setProfile(p);
        applyDemoState();
        return;
      }
    } catch {
      // 로그인 실패 → 가입 시도
      try {
        const signUpResult = await db.signUp(testEmail, testPassword, '체험 사용자');
        if (signUpResult.user) {
          // 가입 후 로그인 재시도
          try {
            const retryResult = await db.signIn(testEmail, testPassword);
            if (retryResult.user) {
              setAuthUserId(retryResult.user.id);
            }
          } catch {
            setAuthUserId(signUpResult.user.id);
          }
          applyDemoState();
          return;
        }
      } catch {
        // Supabase 연결 실패 → 로컬 데모 모드로 진입
      }
    }

    // 폴백: Supabase 연결 실패 시에도 로컬 데모 상태로 진입
    applyDemoState();
  }, []);

  // ── 프로필 ──
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const saveProfileToDb = useCallback(async () => {
    if (!authUserId) return;
    try {
      await db.saveProfile(authUserId, profile);
    } catch { /* 로컬에는 저장됨 */ }
  }, [authUserId, profile]);

  // ── 게시물 ──
  const addPost = useCallback(async (post: Post) => {
    setPosts(prev => [post, ...prev]);
    if (authUserId) {
      try {
        const created = await db.createPost(authUserId, post.book, post.quote, post.comment);
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, id: created.id } : p));
      } catch { /* DB 실패해도 로컬 표시 */ }
    }
  }, [authUserId]);

  const toggleLike = useCallback(async (postId: string) => {
    const isCurrentlyLiked = likedPosts.has(postId);
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (isCurrentlyLiked) { next.delete(postId); } else { next.add(postId); }
      return next;
    });
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
    if (authUserId && !postId.startsWith('p')) {
      try {
        if (isCurrentlyLiked) { await db.removeLike(authUserId, postId); }
        else { await db.addLike(authUserId, postId); }
      } catch { /* ignore */ }
    }
  }, [authUserId, likedPosts]);

  // ── 서재 참여 ──
  const joinSeojaeAction = useCallback(async (seojaeId: string) => {
    setJoinedSeojaeIds(prev => new Set(prev).add(seojaeId));

    // 로컬 상태 업데이트: mock에서 서재 정보를 찾아 mySeojae에 추가
    const targetSeojae = MOCK_SEOJAE.find(s => s.id === seojaeId);
    if (targetSeojae && !mySeojae.some(s => s.id === seojaeId)) {
      setMySeojae(prev => [...prev, { ...targetSeojae, memberCount: targetSeojae.memberCount + 1 }]);
    }

    if (authUserId && profile.name) {
      try {
        const seojae = MOCK_SEOJAE.find(s => s.id === seojaeId);
        const roomName = seojae?.name || seojaeId;
        const chatRoomId = seojae?.chatRoomId || `${seojaeId}-chat`;
        await db.ensureChatRoom(chatRoomId, roomName, 'seojae');
        await db.joinChatRoom(chatRoomId, authUserId, profile.name);
        await db.joinSeojae(seojaeId, authUserId);
      } catch { /* 채팅 실패해도 참여는 유지 */ }
    }
  }, [authUserId, profile.name, mySeojae]);

  const leaveSeojaeAction = useCallback(async (seojaeId: string) => {
    if (authUserId && profile.name) {
      try {
        const seojae = MOCK_SEOJAE.find(s => s.id === seojaeId);
        const chatRoomId = seojae?.chatRoomId || `${seojaeId}-chat`;
        await db.leaveChatRoom(chatRoomId, authUserId, profile.name);
        await db.leaveSeojae(seojaeId, authUserId);
      } catch { /* ignore */ }
    }
    setJoinedSeojaeIds(prev => {
      const next = new Set(prev);
      next.delete(seojaeId);
      return next;
    });
    setMySeojae(prev => prev.filter(s => s.id !== seojaeId));
  }, [authUserId, profile.name]);

  // ── 오프라인 행사 신청 ──
  const applyEvent = useCallback(async (eventId: string) => {
    setAppliedEvents(prev => new Set(prev).add(eventId));
    if (authUserId && profile.name) {
      try {
        const event = MOCK_OFFLINE_EVENTS.find(e => e.id === eventId);
        const roomName = event?.title || eventId;
        await db.ensureChatRoom(eventId, roomName, 'event');
        await db.joinChatRoom(eventId, authUserId, profile.name);
      } catch { /* 채팅 실패해도 신청은 유지 */ }
    }
  }, [authUserId, profile.name]);

  const cancelEvent = useCallback(async (eventId: string) => {
    if (authUserId && profile.name) {
      try {
        await db.leaveChatRoom(eventId, authUserId, profile.name);
      } catch { /* ignore */ }
    }
    setAppliedEvents(prev => {
      const next = new Set(prev);
      next.delete(eventId);
      return next;
    });
  }, [authUserId, profile.name]);

  const completeOnboarding = useCallback(() => {
    setOnboardingComplete(true);
  }, []);

  // ── 밑줄 ──
  const addHighlight = useCallback(async (book: Book, sentence: string, reason: string, context: string) => {
    const newHighlight: Highlight = {
      id: `local-${Date.now()}`,
      userId: authUserId || profile.id,
      userName: profile.name || '나',
      userAvatar: profile.avatarUrl,
      book,
      sentence,
      reason,
      context,
      reactions: { felt_same: 0, want_to_read: 0, stays_long: 0, myReactions: new Set() },
      createdAt: '방금 전',
    };
    setHighlights(prev => [newHighlight, ...prev]);

    // 로컬 통계 업데이트
    setHighlightStats(prev => {
      const myHighlights = highlights.filter(h => h.userId === (authUserId || profile.id));
      const existingBooks = new Set(myHighlights.map(h => h.book.isbn));
      existingBooks.add(book.isbn);
      return {
        totalCount: prev.totalCount + 1,
        bookCount: existingBooks.size,
      };
    });

    if (authUserId) {
      try {
        const created = await db.createHighlight(authUserId, book, sentence, reason, context);
        setHighlights(prev => prev.map(h => h.id === newHighlight.id ? { ...h, id: created.id } : h));
      } catch { /* DB 실패해도 로컬 표시 */ }

      // Gate 1 자동 체크
      const newTotal = highlightStats.totalCount + 1;
      const myHighlights = highlights.filter(h => h.userId === authUserId);
      const bookSet = new Set(myHighlights.map(h => h.book.isbn));
      bookSet.add(book.isbn);
      const newBookCount = bookSet.size;

      if (!gates.gate1At && newTotal >= GATE1_HIGHLIGHT_THRESHOLD && newBookCount >= GATE1_BOOK_THRESHOLD) {
        try {
          await db.passGate(authUserId, 'gate_1');
          setGates(prev => ({ ...prev, gate1At: new Date().toISOString() }));
          // 축하 화면 표시
          setSubView('gate1Celebration');
        } catch { /* ignore */ }
      }
    }
  }, [authUserId, profile, highlights, highlightStats, gates.gate1At]);

  // ── Gate 0 완료 (온보딩에서 호출) ──
  const completeGate0 = useCallback(async (book: Book, sentence: string, reason: string, context: string) => {
    // 밑줄 저장
    const newHighlight: Highlight = {
      id: `local-${Date.now()}`,
      userId: authUserId || profile.id,
      userName: profile.name || '나',
      userAvatar: profile.avatarUrl,
      book,
      sentence,
      reason,
      context,
      reactions: { felt_same: 0, want_to_read: 0, stays_long: 0, myReactions: new Set() },
      createdAt: '방금 전',
    };
    setHighlights(prev => [newHighlight, ...prev]);
    setHighlightStats({ totalCount: 1, bookCount: 1 });

    if (authUserId) {
      try {
        const created = await db.createHighlight(authUserId, book, sentence, reason, context);
        setHighlights(prev => prev.map(h => h.id === newHighlight.id ? { ...h, id: created.id } : h));
        await db.passGate(authUserId, 'gate_0');
      } catch { /* ignore */ }
    }

    setGates(prev => ({ ...prev, gate0At: new Date().toISOString() }));
    setOnboardingComplete(true);
    setRoute('main');
  }, [authUserId, profile]);

  const toggleHighlightReaction = useCallback((highlightId: string, reactionType: HighlightReactionType) => {
    setHighlights(prev => prev.map(h => {
      if (h.id !== highlightId) return h;
      const myReactions = new Set(h.reactions.myReactions);
      const isActive = myReactions.has(reactionType);
      if (isActive) {
        myReactions.delete(reactionType);
      } else {
        myReactions.add(reactionType);
      }
      return {
        ...h,
        reactions: {
          ...h.reactions,
          [reactionType]: h.reactions[reactionType] + (isActive ? -1 : 1),
          myReactions,
        },
      };
    }));
    if (authUserId && !highlightId.startsWith('h')) {
      try {
        const h = highlights.find(h => h.id === highlightId);
        const isActive = h?.reactions.myReactions.has(reactionType);
        if (isActive) {
          db.removeHighlightReaction(authUserId, highlightId, reactionType);
        } else {
          db.addHighlightReaction(authUserId, highlightId, reactionType);
        }
      } catch { /* ignore */ }
    }
  }, [authUserId, highlights]);

  // ── 온보딩 답변 저장 ──
  const saveOnboardingAnswersAction = useCallback(async (answers: OnboardingAnswers) => {
    setOnboardingAnswers(answers);
    if (authUserId) {
      try {
        await db.saveOnboardingAnswers(authUserId, answers);
      } catch { /* DB 실패해도 로컬에는 저장됨 */ }
    }
  }, [authUserId]);

  // ── 스토리 ──
  const markStoryViewed = useCallback((userId: string) => {
    setViewedStoryUsers(prev => new Set(prev).add(userId));
  }, []);

  // ── 던바 구조 ──
  const selectSeojae = useCallback((id: string | null) => {
    setSelectedSeojaeId(id);
    if (id) {
      setSubView('seojaeDetail');
    } else {
      setSubView(null);
    }
  }, []);

  const selectPair = useCallback((id: string | null) => {
    setSelectedPairId(id);
    if (id) {
      setSubView('highlightPairView');
    } else {
      setSubView(null);
    }
  }, []);

  const reactToPairHighlight = useCallback(async (pairId: string, highlightId: string) => {
    // 로컬: 스트릭 +1
    setMyHighlightPairs(prev => prev.map(p =>
      p.id === pairId
        ? { ...p, streakCount: p.streakCount + 1, lastInteractionDate: new Date().toISOString().split('T')[0] }
        : p
    ));

    if (authUserId) {
      try {
        await db.reactToPairHighlight(pairId, authUserId, highlightId);
      } catch { /* ignore */ }
    }
  }, [authUserId]);

  return (
    <AppContext.Provider
      value={{
        route, setRoute,
        tab, setTab,
        subView, setSubView,
        profile, updateProfile, saveProfileToDb,
        posts, addPost,
        likedPosts, toggleLike,
        joinedSeojaeIds, joinSeojae: joinSeojaeAction, leaveSeojae: leaveSeojaeAction,
        appliedEvents, applyEvent, cancelEvent,
        onboardingComplete, completeOnboarding,
        authLoading, authUserId,
        handleSignUp, handleSignIn, handleGoogleSignIn, handleSignOut, handleDemoLogin,
        isTestMode,
        viewedStoryUsers, markStoryViewed,
        highlights, addHighlight, toggleHighlightReaction,
        gates, highlightStats, gateLevel,
        completeGate0,
        // 온보딩 답변 + 조개 지표
        onboardingAnswers, shellMetrics,
        saveOnboardingAnswers: saveOnboardingAnswersAction,
        // 던바 구조
        mySeojae, myHighlightPairs, myCityRegion,
        selectedSeojaeId, selectedPairId,
        selectSeojae, selectPair, reactToPairHighlight,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
