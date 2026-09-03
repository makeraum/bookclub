'use client';

import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import type { Route, Tab, SubView, Post, UserProfile, Highlight, HighlightReactionType, Book, UserGates, GateLevel, HighlightStats, Seojae, HighlightPair, Region, OnboardingAnswers, ShellMetrics, CoAttendance, MeetingRetrospective, RemainingSentenceCard, BookRating, OpinionDivergence, ReturnIntent, FeePayment, Expense, FeeReminder, FeeAccount } from '../lib/types';
import { needsReconsent, isConsentActive, type ConsentDraft, type ConsentRecord, type ConsentType } from '../lib/consent';
import type { PaymentMethod } from '../lib/payment';
import { MOCK_POSTS, MOCK_OFFLINE_EVENTS, MOCK_HIGHLIGHTS, MOCK_SEOJAE, MOCK_HIGHLIGHT_PAIRS, MOCK_SHELL_METRICS, MOCK_CO_ATTENDANCES, DEMO_REMAINING_CARDS, DEMO_RETROSPECTIVE_EVENT_ID, DEMO_FEE_PAYMENTS, DEMO_EXPENSES, FEE_REMINDER_MESSAGE } from '../lib/mock-data';
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
  /** 내가 남긴 밑줄 — 마이 탭의 숫자와 목록이 같은 자료를 보게 하는 단일 출처 */
  myHighlights: Highlight[];
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
  // 동석 기록
  myCoAttendances: CoAttendance[];
  selectedCoAttendeeId: string | null;
  coAttendanceVisible: boolean;
  // 30초 회고
  retrospectives: MeetingRetrospective[];
  remainingCards: RemainingSentenceCard[];
  pendingRetrospectiveEventId: string | null;
  notificationOptIn: boolean;
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
  handleSignUp: (email: string, password: string, name: string, consents: ConsentDraft) => Promise<string | null>;
  // 토스트 알림
  toast: string | null;
  showToast: (message: string) => void;

  // 회비 · 회계
  feeAccounts: FeeAccount[];
  getFeeAccount: (eventId: string) => FeeAccount | null;
  saveFeeAccount: (account: Omit<FeeAccount, 'updatedAt'>) => void;
  feePayments: FeePayment[];
  expenses: Expense[];
  feeReminders: FeeReminder[];
  settlementPublicEvents: Set<string>;
  myFeePayment: (eventId: string) => FeePayment | null;
  reportFeeTransfer: (eventId: string, amount: number, method: PaymentMethod) => void;
  confirmFeePayment: (paymentId: string) => void;
  addExpense: (eventId: string, title: string, amount: number) => void;
  removeExpense: (expenseId: string) => void;
  sendFeeReminder: (eventId: string, recipients: FeePayment[]) => void;
  toggleSettlementPublic: (eventId: string) => void;

  // 개인정보 동의
  consents: ConsentRecord[];
  sensitiveConsentGiven: boolean;
  saveConsents: (draft: ConsentDraft) => Promise<string | null>;
  updateConsent: (type: ConsentType, agreed: boolean) => Promise<string | null>;
  deleteMyAccount: () => Promise<string | null>;
  exportMyData: () => Promise<Blob | null>;
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
  selectCoAttendee: (id: string | null) => void;
  toggleCoAttendanceVisible: () => void;
  // 30초 회고
  openRetrospective: (eventId: string) => void;
  submitRetrospective: (eventId: string, data: { bookRating: BookRating; opinionDivergence: OpinionDivergence; returnIntent: ReturnIntent; freeText: string }) => void;
  saveCardToLibrary: (cardId: string) => void;
  shareCardToFeed: (cardId: string) => void;
  setNotificationOptIn: (value: boolean) => void;
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
  // 밑줄 통계는 상태로 따로 들고 있지 않고 내 밑줄 목록에서 계산합니다.
  // 예전에는 수동으로 더하다 보니 "밑줄 1/30"인데 목록은 비어 있는 식으로 어긋났습니다.
  const myHighlights = useMemo(
    () => highlights.filter(h => h.userId === (authUserId || profile.id) || h.userId === 'me'),
    [highlights, authUserId, profile.id],
  );

  const highlightStats: HighlightStats = useMemo(() => ({
    totalCount: myHighlights.length,
    bookCount: new Set(myHighlights.map(h => h.book.isbn)).size,
  }), [myHighlights]);

  // 온보딩 답변 + 조개 지표
  const [onboardingAnswers, setOnboardingAnswers] = useState<OnboardingAnswers | null>(null);
  const [shellMetrics, setShellMetrics] = useState<ShellMetrics>(DEFAULT_SHELL_METRICS);

  // 던바 구조 상태
  const [mySeojae, setMySeojae] = useState<Seojae[]>(() =>
    MOCK_SEOJAE.slice(0, 2).map(s => {
      if (s.id === 'sj1') {
        return { ...s, members: s.members.map(m =>
          m.userId === 'u1' ? { ...m, role: 'owner' as const, userId: 'me' } : m
        )};
      }
      return s;
    })
  );
  const [myHighlightPairs, setMyHighlightPairs] = useState<HighlightPair[]>(MOCK_HIGHLIGHT_PAIRS);
  const [myCityRegion, setMyCityRegion] = useState<Region | null>('성남·분당');
  const [selectedSeojaeId, setSelectedSeojaeId] = useState<string | null>(null);
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);

  // 동석 기록 상태
  const [myCoAttendances, setMyCoAttendances] = useState<CoAttendance[]>(MOCK_CO_ATTENDANCES);
  const [selectedCoAttendeeId, setSelectedCoAttendeeId] = useState<string | null>(null);
  const [coAttendanceVisible, setCoAttendanceVisible] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('withbook-coattendance-visible');
      return stored !== null ? stored === 'true' : true;
    }
    return true;
  });

  // 30초 회고 상태
  const [retrospectives, setRetrospectives] = useState<MeetingRetrospective[]>([]);
  const [remainingCards, setRemainingCards] = useState<RemainingSentenceCard[]>(DEMO_REMAINING_CARDS);
  // 사용자가 직접 연 회고 대상 (없으면 아래 자동 계산값을 씀)
  const [openedRetrospectiveEventId, setOpenedRetrospectiveEventId] = useState<string | null>(null);
  const [notificationOptIn, setNotificationOptIn] = useState(false);

  // 개인정보 동의 상태
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  // 토스트 — 저장·완료 알림
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = setTimeout(() => setToast(null), 2200);
  }, []);

  // 회비 · 회계 상태 — 데모 모드에서는 이 상태가 진짜이고, DB 반영은 best-effort입니다
  // 입금 계좌는 서재지기가 직접 등록합니다 — 기본값(하드코딩된 데모 계좌)은 두지 않습니다
  const [feeAccounts, setFeeAccounts] = useState<FeeAccount[]>([]);
  const [feePayments, setFeePayments] = useState<FeePayment[]>(DEMO_FEE_PAYMENTS);
  const [expenses, setExpenses] = useState<Expense[]>(DEMO_EXPENSES);
  const [feeReminders, setFeeReminders] = useState<FeeReminder[]>([]);
  const [settlementPublicEvents, setSettlementPublicEvents] = useState<Set<string>>(new Set());

  const sensitiveConsentGiven = useMemo(
    () => isConsentActive(consents, 'sensitive'),
    [consents],
  );

  // ── 게이트 레벨 계산 ──
  const gateLevel: GateLevel = useMemo(() => {
    if (isTestMode) return 'librarian';
    if (gates.gate2At) return 'librarian';
    if (gates.gate1At) return 'recorder';
    return 'reader';
  }, [gates]);

  // ── 회고 대상 이벤트 계산 ──
  // 비공개 테스트: 참가·종료 모임이 없으면 데모 모임으로 폴백 — 회고 카드는 항상 노출된다
  const pendingRetrospectiveEventId = useMemo(() => {
    if (openedRetrospectiveEventId) return openedRetrospectiveEventId;
    const today = new Date().toISOString().split('T')[0];
    const retroEventIds = new Set(retrospectives.map(r => r.eventId));
    const pending = MOCK_OFFLINE_EVENTS.find(ev =>
      appliedEvents.has(ev.id) && ev.date < today && !retroEventIds.has(ev.id)
    );
    return pending?.id || DEMO_RETROSPECTIVE_EVENT_ID;
  }, [openedRetrospectiveEventId, appliedEvents, retrospectives]);

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

          // 개인정보 동의 이력 로드 — 필수 항목이 없거나 방침 버전이 올라갔으면 재동의
          let consentRecords: ConsentRecord[] = [];
          try {
            consentRecords = await db.fetchConsents(session.user.id);
            setConsents(consentRecords);
            setNotificationOptIn(isConsentActive(consentRecords, 'marketing_email'));
          } catch {
            // 테이블 미생성 등으로 조회에 실패하면 재동의를 강제하지 않습니다
            setConsents([]);
            consentRecords = [];
            setRoute(userGates.gate0At ? 'main' : 'onboarding');
            setOnboardingComplete(!!userGates.gate0At);
            await loadPosts();
            await loadHighlights();
            return;
          }
          if (needsReconsent(consentRecords)) {
            setRoute('consent');
            await loadPosts();
            await loadHighlights();
            return;
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
  const handleSignUp = useCallback(async (
    email: string,
    password: string,
    name: string,
    consentDraft: ConsentDraft,
  ): Promise<string | null> => {
    try {
      const data = await db.signUp(email, password, name);
      if (data.user) {
        setAuthUserId(data.user.id);
        setProfile(prev => ({ ...prev, id: data.user!.id, name }));
        // 계정 생성 직후 동의 이력을 남깁니다. 실패해도 가입은 유지하되
        // 다음 진입 시 재동의를 받도록 consents를 비워 둡니다.
        try {
          await db.saveConsents(data.user.id, consentDraft);
          setConsents(await db.fetchConsents(data.user.id));
          setNotificationOptIn(consentDraft.marketing_email);
        } catch {
          setConsents([]);
        }
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

        // 개인정보 동의 이력 — 방침이 개정됐으면 재동의 화면으로
        try {
          const consentRecords = await db.fetchConsents(data.user.id);
          setConsents(consentRecords);
          setNotificationOptIn(isConsentActive(consentRecords, 'marketing_email'));
          if (needsReconsent(consentRecords)) {
            setRoute('consent');
            await loadPosts();
            await loadHighlights();
            return null;
          }
        } catch {
          setConsents([]);
        }

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
    setConsents([]);
    setFeeAccounts([]);
    setFeePayments(DEMO_FEE_PAYMENTS);
    setExpenses(DEMO_EXPENSES);
    setFeeReminders([]);
    setSettlementPublicEvents(new Set());
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
      // sj1을 체험 사용자 소유로 설정 (서재지기 콘솔 체험용)
      const demoSeojae = MOCK_SEOJAE.slice(0, 3).map(s => {
        if (s.id === 'sj1') {
          return {
            ...s,
            members: s.members.map(m =>
              m.userId === 'u1' ? { ...m, role: 'owner' as const, userId: 'me' } : m
            ),
          };
        }
        return s;
      });
      setMySeojae(demoSeojae);
      setJoinedSeojaeIds(new Set(['sj1', 'sj2', 'sj3']));
      setAppliedEvents(new Set(['ev2']));
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

  // ── 동석 기록 ──
  const selectCoAttendee = useCallback((id: string | null) => {
    setSelectedCoAttendeeId(id);
    if (id) {
      setSubView('coAttendeeProfile');
    } else {
      setSubView(null);
    }
  }, []);

  const toggleCoAttendanceVisible = useCallback(() => {
    setCoAttendanceVisible(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('withbook-coattendance-visible', String(next));
      }
      return next;
    });
  }, []);

  // ── 30초 회고 ──
  const openRetrospective = useCallback((eventId: string) => {
    setOpenedRetrospectiveEventId(eventId);
    setSubView('meetingRetrospective');
  }, []);

  const submitRetrospective = useCallback((
    eventId: string,
    data: { bookRating: BookRating; opinionDivergence: OpinionDivergence; returnIntent: ReturnIntent; freeText: string }
  ) => {
    const retro: MeetingRetrospective = {
      id: `retro-me-${eventId}`,
      eventId,
      userId: 'me',
      ...data,
      createdAt: new Date().toISOString(),
    };
    setRetrospectives(prev => [...prev, retro]);
    // 직접 연 회고는 제출과 함께 해제 — 다음 회고 대상은 다시 자동 계산된다
    setOpenedRetrospectiveEventId(null);

    // "남은 문장" 카드 자동 생성
    const event = MOCK_OFFLINE_EVENTS.find(ev => ev.id === eventId);
    if (event?.book) {
      const bookHighlights = highlights.filter(h => h.book.isbn === event.book!.isbn);
      const sentences = bookHighlights.slice(0, 3).map(h => ({
        sentence: h.sentence.length > 80 ? h.sentence.slice(0, 80) + '…' : h.sentence,
        userName: h.userName,
      }));
      const alreadyHasCard = remainingCards.some(c => c.eventId === eventId);
      if (sentences.length > 0 && !alreadyHasCard) {
        const card: RemainingSentenceCard = {
          id: `rc-me-${eventId}`,
          eventId,
          eventTitle: event.title,
          book: event.book,
          date: event.date,
          sentences,
          participants: ['이서연', '박도윤', '한소율', '오지환'],
          savedToLibrary: false,
          sharedToFeed: false,
        };
        setRemainingCards(prev => [...prev, card]);
      }
    }
    // TODO: Supabase meeting_retrospectives 테이블에 insert
  }, [highlights, remainingCards]);

  // ── 회비 · 회계 ──
  const getFeeAccount = useCallback((eventId: string): FeeAccount | null => {
    return feeAccounts.find(a => a.eventId === eventId) ?? null;
  }, [feeAccounts]);

  /** 서재지기가 입금 계좌·회비를 등록·수정 */
  const saveFeeAccount = useCallback((account: Omit<FeeAccount, 'updatedAt'>) => {
    const saved: FeeAccount = { ...account, updatedAt: new Date().toISOString() };
    setFeeAccounts(prev => {
      const exists = prev.some(a => a.eventId === account.eventId);
      return exists ? prev.map(a => (a.eventId === account.eventId ? saved : a)) : [...prev, saved];
    });
    if (authUserId) {
      db.upsertFeeAccount(authUserId, saved).catch(() => { /* 데모에서는 무시 */ });
    }
  }, [authUserId]);

  const myFeePayment = useCallback((eventId: string): FeePayment | null => {
    return feePayments.find(p => p.eventId === eventId && p.userId === 'me') ?? null;
  }, [feePayments]);

  /** 참가자: "이체 완료했어요" → 확인 중 */
  const reportFeeTransfer = useCallback((eventId: string, amount: number, method: PaymentMethod) => {
    const now = new Date().toISOString();
    setFeePayments(prev => {
      const existing = prev.find(p => p.eventId === eventId && p.userId === 'me');
      if (existing) {
        return prev.map(p =>
          p.id === existing.id
            ? { ...p, status: 'pending' as const, method, reportedAt: now }
            : p,
        );
      }
      return [...prev, {
        id: `fp-me-${eventId}`,
        eventId,
        userId: 'me',
        userName: profile.name || '나',
        userAvatar: profile.avatarUrl,
        amount,
        status: 'pending' as const,
        method,
        paidAt: null,
        reportedAt: now,
        confirmedBy: null,
        confirmedAt: null,
      }];
    });
    if (authUserId) {
      db.reportFeeTransfer(eventId, authUserId, amount, method).catch(() => { /* 데모에서는 무시 */ });
    }
  }, [authUserId, profile.name, profile.avatarUrl]);

  /** 서재지기: 입금 확인 → 납부 완료 */
  const confirmFeePayment = useCallback((paymentId: string) => {
    const target = feePayments.find(p => p.id === paymentId);
    if (!target) return;
    const now = new Date().toISOString();
    setFeePayments(prev => prev.map(p =>
      p.id === paymentId
        ? {
            ...p,
            status: 'paid' as const,
            method: p.method ?? 'transfer',
            paidAt: now,
            confirmedBy: profile.name || '서재지기',
            confirmedAt: now,
          }
        : p,
    ));
    if (authUserId) {
      db.confirmFeePayment(target.eventId, target.userId, authUserId).catch(() => { /* 데모에서는 무시 */ });
    }
  }, [authUserId, profile.name, feePayments]);

  const addExpense = useCallback((eventId: string, title: string, amount: number) => {
    const expense: Expense = {
      id: `ex-${Date.now()}`,
      eventId,
      title,
      amount,
      createdAt: new Date().toISOString(),
    };
    setExpenses(prev => [...prev, expense]);
    if (authUserId) {
      db.insertExpense(eventId, title, amount, authUserId).catch(() => { /* 데모에서는 무시 */ });
    }
  }, [authUserId]);

  const removeExpense = useCallback((expenseId: string) => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    db.deleteExpense(expenseId).catch(() => { /* 데모에서는 무시 */ });
  }, []);

  /** 미납자 리마인드 — 발송 내역이 남습니다 */
  const sendFeeReminder = useCallback((eventId: string, recipients: FeePayment[]) => {
    if (recipients.length === 0) return;
    const reminder: FeeReminder = {
      id: `rm-${Date.now()}`,
      eventId,
      recipientNames: recipients.map(r => r.userName),
      message: FEE_REMINDER_MESSAGE,
      sentAt: new Date().toISOString(),
    };
    setFeeReminders(prev => [reminder, ...prev]);
    if (authUserId) {
      db.insertFeeReminder(eventId, authUserId, recipients.map(r => r.userId), FEE_REMINDER_MESSAGE)
        .catch(() => { /* 데모에서는 무시 */ });
    }
  }, [authUserId]);

  const toggleSettlementPublic = useCallback((eventId: string) => {
    const willPublish = !settlementPublicEvents.has(eventId);
    setSettlementPublicEvents(prev => {
      const next = new Set(prev);
      if (willPublish) next.add(eventId);
      else next.delete(eventId);
      return next;
    });
    db.setSettlementPublic(eventId, willPublish).catch(() => { /* 데모에서는 무시 */ });
  }, [settlementPublicEvents]);

  // ── 개인정보 동의 ──
  const saveConsents = useCallback(async (draft: ConsentDraft): Promise<string | null> => {
    if (!authUserId) return '로그인이 필요합니다';
    try {
      await db.saveConsents(authUserId, draft);
      setConsents(await db.fetchConsents(authUserId));
      return null;
    } catch (err: unknown) {
      return err instanceof Error ? err.message : '동의 저장에 실패했어요';
    }
  }, [authUserId]);

  /** 선택 항목 동의·철회 — 이력은 새 행으로 쌓입니다 */
  const updateConsent = useCallback(async (type: ConsentType, agreed: boolean): Promise<string | null> => {
    if (!authUserId) return '로그인이 필요합니다';
    try {
      await db.recordConsent(authUserId, type, agreed);
      setConsents(await db.fetchConsents(authUserId));
      if (type === 'marketing_email') setNotificationOptIn(agreed);
      return null;
    } catch (err: unknown) {
      return err instanceof Error ? err.message : '변경에 실패했어요';
    }
  }, [authUserId]);

  const exportMyData = useCallback(async (): Promise<Blob | null> => {
    if (!authUserId) return null;
    try {
      const data = await db.exportMyData(authUserId);
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    } catch {
      return null;
    }
  }, [authUserId]);

  const deleteMyAccount = useCallback(async (): Promise<string | null> => {
    try {
      await db.deleteMyAccount();
      await handleSignOut();
      return null;
    } catch (err: unknown) {
      return err instanceof Error ? err.message : '탈퇴 처리에 실패했어요';
    }
  }, [handleSignOut]);

  const saveCardToLibrary = useCallback((cardId: string) => {
    setRemainingCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, savedToLibrary: true } : c
    ));
  }, []);

  const shareCardToFeed = useCallback((cardId: string) => {
    setRemainingCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, sharedToFeed: true } : c
    ));
  }, []);

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
        gates, highlightStats, myHighlights, gateLevel,
        completeGate0,
        // 온보딩 답변 + 조개 지표
        onboardingAnswers, shellMetrics,
        saveOnboardingAnswers: saveOnboardingAnswersAction,
        // 던바 구조
        mySeojae, myHighlightPairs, myCityRegion,
        selectedSeojaeId, selectedPairId,
        selectSeojae, selectPair, reactToPairHighlight,
        // 동석 기록
        myCoAttendances, selectedCoAttendeeId, coAttendanceVisible,
        selectCoAttendee, toggleCoAttendanceVisible,
        // 30초 회고
        toast, showToast,
        feeAccounts, getFeeAccount, saveFeeAccount,
        feePayments, expenses, feeReminders, settlementPublicEvents,
        myFeePayment, reportFeeTransfer, confirmFeePayment,
        addExpense, removeExpense, sendFeeReminder, toggleSettlementPublic,
        consents, sensitiveConsentGiven, saveConsents, updateConsent, deleteMyAccount, exportMyData,
        retrospectives, remainingCards, pendingRetrospectiveEventId, notificationOptIn,
        openRetrospective, submitRetrospective, saveCardToLibrary, shareCardToFeed, setNotificationOptIn,
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
