export type Route = 'splash' | 'login' | 'onboarding' | 'booksetup' | 'main';
export type Tab = 'home' | 'seojae' | 'participate' | 'chat' | 'my';
export type SubView = 'compose' | 'bookEdit' | 'clubDetail' | 'gate1Celebration' | 'seojaeDetail' | 'highlightPairView' | 'resourceLibrary' | 'librarianConsole' | 'coAttendeeProfile' | null;

export type DunbarLayer = 'L1' | 'L2' | 'L3' | 'L4';

export interface Book {
  isbn: string;
  title: string;
  author: string;
  coverUrl: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string;
  favoriteBooks: (Book | null)[];
  quote: string;
  favoriteAuthors: string[];
  genres: string[];
  readingBadges: string[];
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  book: Book;
  quote: string;
  comment: string;
  likes: number;
  liked: boolean;
  createdAt: string;
}

export interface StoryUser {
  id: string;
  name: string;
  avatarUrl: string;
  hasNew: boolean;
}

export interface SameBookGroup {
  book: Book;
  readerCount: number;
}

export interface StoryCard {
  book: Book;
  quote: string;
}

export interface UserStory {
  userId: string;
  userName: string;
  userAvatar: string;
  cards: StoryCard[];
}

export interface ClubMember {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface BookClub {
  id: string;
  name: string;
  description: string;
  book: Book;
  memberCount: number;
  maxMembers: number;
  nextMeetingDate: string;
  nextMeetingTime: string;
  members: ClubMember[];
}

export type EventType = 'rotation' | 'bookclub' | 'gathering' | 'quarterly';
export type Region = '서울' | '성남·분당' | '수원' | '용인' | '안양·평촌' | '화성·동탄' | '천안';

export interface OfflineEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  date: string;
  time: string;
  region: Region;
  venue: string;
  maxParticipants: number;
  currentParticipants: number;
  fee: number;
  book?: Book;
  host: string;
  hostId?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: 'message' | 'system';
  text: string;
  createdAt: string;
  isMe?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'club' | 'event' | 'seojae' | 'highlight_pair';
  createdAt: string;
}

export interface ChatMember {
  roomId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  joinedAt: string;
}

export interface BookTopic {
  question: string;
  bookTitle: string;
  bookAuthor: string;
}

// ── 게이트 시스템 ──

export type GateLevel = 'reader' | 'recorder' | 'librarian'; // 독자 / 기록자 / 서재지기

export interface UserGates {
  gate0At: string | null; // 가입 게이트 통과 일시
  gate1At: string | null; // 기록자 게이트 통과 일시
  gate2At: string | null; // 라운지 게이트 통과 일시
}

export interface HighlightStats {
  totalCount: number; // 내 밑줄 총 개수
  bookCount: number;  // 밑줄을 남긴 책 수
}

// ── 밑줄 시스템 ──

export type HighlightReactionType = 'felt_same' | 'want_to_read' | 'stays_long';

export interface ReactionCounts {
  felt_same: number;
  want_to_read: number;
  stays_long: number;
  myReactions: Set<HighlightReactionType>;
}

export interface Highlight {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  book: Book;
  sentence: string;
  reason: string;
  context: string;
  reactions: ReactionCounts;
  createdAt: string;
}

// ── 던바 구조 (L1~L4) ──

export interface CityCommunity {
  id: string;
  region: Region;
  name: string;
  description: string;
  maxMembers: number;
  memberCount: number;
}

export interface CityCohort {
  id: string;
  communityId: string;
  label: string;
  startDate: string;
}

export interface SeojaeMember {
  userId: string;
  userName: string;
  userAvatar: string;
  role: 'member' | 'owner';
  joinedAt: string;
}

export interface Seojae {
  id: string;
  communityId: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  chatRoomId: string | null;
  maxMembers: number;
  memberCount: number;
  members: SeojaeMember[];
  monthlyOfflineDay: string;
  isActive: boolean;
  currentBook?: Book;
}

export interface Chaekbang {
  id: string;
  communityId: string;
  name: string;
  description: string;
  quarterlyMeetingInfo: string;
  seojaeIds: string[];
  seojaeCount: number;
}

// ── 온보딩 답변 ──

export interface OnboardingAnswers {
  q1: number;
  q2: number;
  q3: number;
}

// ── 조개 지표 ──

export interface ShellMetrics {
  readingFollows: number;      // 이어읽기
  togetherDays: number;        // 함께 읽은 날
  discussionCredits: number;   // 발제 크레딧
  mentorSticks: number;        // 붙듦
  seasonBadges: number;        // 계절 배지
}

// ── 주최자 프로필 ──

export interface HostHighlight {
  sentence: string;
  reason: string;
}

export interface HostBookData {
  highlightCount: number;
  bookTitle: string;
  featured: HostHighlight[];
}

export interface HostProfile {
  id: string;
  name: string;
  avatar: string;
  title: '기록자' | '서재지기';
  intro: string;
  metrics: {
    highlightCount: number;
    completedBooks: number;
    hostedMeetings: number;
    discussionCredits: number;
    mentorSticks: number;
  };
  bookHighlights: Record<string, HostBookData>;
  hasEnoughRecords: boolean;
  introVisible: boolean;
}

// ── 서재지기 초대 ──

export interface LibrarianInvitation {
  id: string;
  inviteeId: string;
  inviterId: string;
  inviterName: string;
  seojaeId: string | null;
  seojaeName: string | null;
  status: 'pending' | 'accepted' | 'declined';
  message: string;
  createdAt: string;
}

// ── 서재지기 콘솔 ──

export interface AttendanceRecord {
  userId: string;
  userName: string;
  userAvatar: string;
  attended: boolean;
}

export interface MeetingSession {
  seojaeId: string;
  meetingDate: string;
  attendances: AttendanceRecord[];
}

export interface DiscussionQuestion {
  id: string;
  order: number;
  text: string;
  isUsed: boolean;
}

export interface SessionNote {
  seojaeId: string;
  meetingDate: string;
  content: string;
}

export interface QuietMember {
  userId: string;
  userName: string;
  userAvatar: string;
  weeksSilent: number;
}

export interface NoShowMember {
  userId: string;
  userName: string;
  userAvatar: string;
  missedCount: number;
}

// ── 동석 기록 ──

export interface CoAttendance {
  userId: string;
  userName: string;
  userAvatar: string;
  count: number;
}

export interface SharedMeeting {
  seojaeId: string;
  seojaeName: string;
  book: Book;
  date: string;
}

export interface SharedHighlight {
  sentence: string;
  book: Book;
  myReason: string;
  partnerReason: string;
}

export interface CoAttendanceDetail extends CoAttendance {
  sharedMeetings: SharedMeeting[];
  sharedHighlight?: SharedHighlight;
}

// ── 모임 약속 ──

export interface MeetingPromise {
  id: string;
  text: string;
}

export interface HighlightPair {
  id: string;
  seojaeId: string;
  partnerUserId: string;
  partnerName: string;
  partnerAvatar: string;
  book: Book;
  chatRoomId: string | null;
  streakCount: number;
  lastInteractionDate: string | null;
  periodStart: string;
  isActive: boolean;
}
