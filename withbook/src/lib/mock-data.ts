import { Book, Post, StoryUser, SameBookGroup, UserStory, BookClub, EventType, OfflineEvent, ChatMessage, BookTopic, Highlight, HighlightReactionType, CityCommunity, Seojae, HighlightPair, Chaekbang, ShellMetrics, CoAttendance, CoAttendanceDetail, MeetingPromise, HighlightSentiment, MeetingRetrospective, RemainingSentenceCard, EventFee, FeePayment, Expense } from './types';

export const BOOKS: Book[] = [
  { isbn: '1', title: '싯다르타', author: '헤르만 헤세', coverUrl: '/assets/cover-siddhartha.png' },
  { isbn: '2', title: '프로젝트 헤일메리', author: '앤디 위어', coverUrl: '/assets/cover-hailmary.png' },
  { isbn: '3', title: '모순', author: '양귀자', coverUrl: '/assets/cover-mosoon.png' },
  { isbn: '4', title: '이기적 유전자', author: '리처드 도킨스', coverUrl: '/assets/cover-selfishgene.png' },
  { isbn: '5', title: '나미야 잡화점의 기적', author: '히가시노 게이고', coverUrl: '' },
  { isbn: '6', title: '미움받을 용기', author: '기시미 이치로', coverUrl: '' },
  { isbn: '7', title: '소년이 온다', author: '한강', coverUrl: '' },
  { isbn: '8', title: '데미안', author: '헤르만 헤세', coverUrl: '' },
  { isbn: '9', title: '코스모스', author: '칼 세이건', coverUrl: '' },
  { isbn: '10', title: '1984', author: '조지 오웰', coverUrl: '' },
  { isbn: '11', title: '아몬드', author: '손원평', coverUrl: '' },
  { isbn: '12', title: '불편한 편의점', author: '김호연', coverUrl: '' },
];

export const GENRES = [
  '소설', '에세이', '인문학', '과학', '자기계발', '시/시집',
  '역사', '철학', '심리학', '경영/경제', 'SF', '판타지',
];

export const AUTHORS = [
  '헤르만 헤세', '무라카미 하루키', '한강', '김영하', '파울로 코엘료',
  '칼 세이건', '앤디 위어', '베르나르 베르베르', '히가시노 게이고',
  '조지 오웰', '양귀자', '정유정', '김초엽', '손원평',
];

export const READING_BADGES = [
  '🔖 밑줄 마니아',
  '📚 한 달에 2권',
  '🌙 새벽 독서파',
  '📖 종이책 집착',
  '🎧 오디오북 러버',
  '☕ 카페 독서러',
  '🏠 집순이 독서',
  '📝 독서 노트파',
];

export const STORY_USERS: StoryUser[] = [
  { id: 'u1', name: '서연', avatarUrl: '/assets/avatar-seoyeon.png', hasNew: true },
  { id: 'u2', name: '도윤', avatarUrl: '/assets/avatar-doyoon.png', hasNew: true },
  { id: 'u3', name: '소율', avatarUrl: '/assets/avatar-soyul.png', hasNew: false },
  { id: 'u4', name: '지환', avatarUrl: '/assets/avatar-jihwan.png', hasNew: true },
];

export const SAME_BOOK_GROUPS: SameBookGroup[] = [
  { book: BOOKS[0], readerCount: 12 },
  { book: BOOKS[1], readerCount: 8 },
  { book: BOOKS[2], readerCount: 5 },
  { book: BOOKS[3], readerCount: 7 },
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    userId: 'u1',
    userName: '이서연',
    userAvatar: '/assets/avatar-seoyeon.png',
    book: BOOKS[0],
    quote: '"강물은 어디서나 동시에 존재한다. 발원지에서도, 하구에서도, 폭포에서도, 여울에서도, 바다에서도, 산에서도. 강물에게는 오직 현재만이 존재할 뿐, 미래라는 그림자는 없다."',
    comment: '시간에 대한 시선이 완전히 바뀌는 문장이었어요.',
    likes: 24,
    liked: false,
    createdAt: '2시간 전',
  },
  {
    id: 'p2',
    userId: 'u2',
    userName: '박도윤',
    userAvatar: '/assets/avatar-doyoon.png',
    book: BOOKS[1],
    quote: '"나는 혼자가 아니었다. 우주 어딘가에서 누군가가 같은 하늘을 보며 같은 생각을 하고 있었다."',
    comment: '우주에서의 고독과 연결에 대해 생각하게 된 책.',
    likes: 18,
    liked: false,
    createdAt: '5시간 전',
  },
  {
    id: 'p3',
    userId: 'u3',
    userName: '한소율',
    userAvatar: '/assets/avatar-soyul.png',
    book: BOOKS[2],
    quote: '"모순이 없는 삶은 없다. 다만 그 모순을 어떻게 껴안느냐가 삶의 질을 결정한다."',
    comment: '한 문장 한 문장이 마음에 새겨지는 책이에요.',
    likes: 31,
    liked: false,
    createdAt: '어제',
  },
  {
    id: 'p4',
    userId: 'u4',
    userName: '오지환',
    userAvatar: '/assets/avatar-jihwan.png',
    book: BOOKS[3],
    quote: '"우리는 생존 기계다. 유전자라는 이기적인 분자를 보존하기 위해 눈멀게 프로그램된 로봇 운반자다."',
    comment: '과학 교양서 중 최고. 인간을 바라보는 관점이 완전히 달라집니다.',
    likes: 15,
    liked: false,
    createdAt: '2일 전',
  },
];

export const MOCK_STORIES: UserStory[] = [
  {
    userId: 'u1',
    userName: '이서연',
    userAvatar: '/assets/avatar-seoyeon.png',
    cards: [
      {
        book: BOOKS[0],
        quote: '"강물은 어디서나 동시에 존재한다. 발원지에서도, 하구에서도, 폭포에서도. 강물에게는 오직 현재만이 존재할 뿐, 미래라는 그림자는 없다."',
      },
      {
        book: BOOKS[7],
        quote: '"새는 알에서 나오려고 투쟁한다. 알은 세계이다. 태어나려는 자는 하나의 세계를 깨뜨려야 한다."',
      },
    ],
  },
  {
    userId: 'u2',
    userName: '박도윤',
    userAvatar: '/assets/avatar-doyoon.png',
    cards: [
      {
        book: BOOKS[1],
        quote: '"나는 혼자가 아니었다. 우주 어딘가에서 누군가가 같은 하늘을 보며 같은 생각을 하고 있었다."',
      },
      {
        book: BOOKS[8],
        quote: '"우리는 별의 먼지로 만들어진 존재다. 우주가 스스로를 인식하는 방법, 그것이 바로 우리다."',
      },
      {
        book: BOOKS[9],
        quote: '"자유란 2 더하기 2는 4라고 말할 수 있는 자유이다. 그것이 보장된다면 나머지는 자연히 따라온다."',
      },
    ],
  },
  {
    userId: 'u4',
    userName: '오지환',
    userAvatar: '/assets/avatar-jihwan.png',
    cards: [
      {
        book: BOOKS[3],
        quote: '"우리는 생존 기계다. 유전자라는 이기적인 분자를 보존하기 위해 눈멀게 프로그램된 로봇 운반자다."',
      },
    ],
  },
];

export const MOCK_BOOK_CLUBS: BookClub[] = [
  {
    id: 'club1',
    name: '싯다르타 함께 읽기',
    description: '헤르만 헤세의 《싯다르타》를 2주에 걸쳐 함께 읽고 생각을 나눕니다. 매주 일요일 저녁, 정해진 분량을 읽고 온라인으로 모여 이야기해요.',
    book: BOOKS[0],
    memberCount: 8,
    maxMembers: 12,
    nextMeetingDate: '9월 13일 (일)',
    nextMeetingTime: '오후 8:00',
    members: [
      { id: 'u1', name: '이서연', avatarUrl: '/assets/avatar-seoyeon.png' },
      { id: 'u2', name: '박도윤', avatarUrl: '/assets/avatar-doyoon.png' },
      { id: 'u3', name: '한소율', avatarUrl: '/assets/avatar-soyul.png' },
      { id: 'u4', name: '오지환', avatarUrl: '/assets/avatar-jihwan.png' },
    ],
  },
  {
    id: 'club2',
    name: 'SF 소설 탐험대',
    description: '매달 SF 소설 한 권을 선정해 읽고 토론합니다. 이번 달은 앤디 위어의 《프로젝트 헤일메리》! 과학적 상상력과 인간의 의지에 대해 이야기해요.',
    book: BOOKS[1],
    memberCount: 6,
    maxMembers: 10,
    nextMeetingDate: '9월 15일 (화)',
    nextMeetingTime: '오후 9:00',
    members: [
      { id: 'u2', name: '박도윤', avatarUrl: '/assets/avatar-doyoon.png' },
      { id: 'u4', name: '오지환', avatarUrl: '/assets/avatar-jihwan.png' },
    ],
  },
  {
    id: 'club3',
    name: '한국 소설 깊이 읽기',
    description: '한국 현대 소설의 깊이를 함께 탐구하는 모임입니다. 양귀자의 《모순》을 통해 삶의 이면을 들여다봅니다.',
    book: BOOKS[2],
    memberCount: 10,
    maxMembers: 10,
    nextMeetingDate: '9월 12일 (토)',
    nextMeetingTime: '오후 3:00',
    members: [
      { id: 'u1', name: '이서연', avatarUrl: '/assets/avatar-seoyeon.png' },
      { id: 'u3', name: '한소율', avatarUrl: '/assets/avatar-soyul.png' },
    ],
  },
  {
    id: 'club4',
    name: '과학 교양 독서회',
    description: '과학 교양서를 함께 읽으며 세상을 보는 새로운 눈을 키워요. 이번 책은 리처드 도킨스의 《이기적 유전자》입니다.',
    book: BOOKS[3],
    memberCount: 4,
    maxMembers: 8,
    nextMeetingDate: '9월 19일 (토)',
    nextMeetingTime: '오후 7:00',
    members: [
      { id: 'u4', name: '오지환', avatarUrl: '/assets/avatar-jihwan.png' },
    ],
  },
];

export const PLACEHOLDER_COLORS = ['#C96A22', '#4F6D5A', '#B0522F', '#8A6D46', '#6E5849', '#D9C08A'];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  bookclub: '독서모임',
  rotation: '북 라운지',
  gathering: '소모임',
  quarterly: '책방 분기모임',
};

export const EVENT_TYPE_COLORS: Record<EventType, { bg: string; text: string }> = {
  bookclub: { bg: '#f5f5f7', text: '#1d1d1f' },
  rotation: { bg: '#0066cc', text: '#ffffff' },
  gathering: { bg: '#f5f5f7', text: '#1d1d1f' },
  quarterly: { bg: '#f5f5f7', text: '#1d1d1f' },
};

export const MOCK_OFFLINE_EVENTS: OfflineEvent[] = [
  {
    id: 'ev1',
    type: 'rotation',
    title: '9월 강남 북 라운지',
    description: '책 취향이 닿는 사람들과 돌아가며 이야기하는 자리입니다. 참가자들이 각자 좋아하는 책 한 권을 가져와 돌아가며 소개하고, 짧은 대화를 나눕니다. 얼굴이나 프로필이 아니라 밑줄과 문장을 먼저 나누는 자리입니다.',
    date: '2026-09-12',
    time: '오후 3:00',
    region: '강남·서초',
    venue: '강남 역삼동 독립서점 북티크',
    maxParticipants: 12,
    currentParticipants: 8,
    fee: 15000,
    host: '위드북 운영팀',
  },
  {
    id: 'ev2',
    type: 'bookclub',
    title: '《싯다르타》 깊이 읽기 모임',
    description: '헤르만 헤세의 《싯다르타》를 함께 읽고 깊이 있는 토론을 나눕니다. 참가 전 완독을 권장하며, 인상 깊은 구절이나 질문을 준비해 오시면 더욱 풍성한 시간이 됩니다.',
    date: '2026-09-13',
    time: '오후 2:00',
    region: '천안 서북구',
    venue: '천안 서북구 독립서점 책방길',
    maxParticipants: 8,
    currentParticipants: 8,
    fee: 5000,
    book: BOOKS[0],
    host: '이서연',
    hostId: 'u1',
  },
  {
    id: 'ev3',
    type: 'gathering',
    title: 'SF 덕후 번개모임',
    description: '과학 소설을 사랑하는 사람들의 자유로운 번개모임입니다. 최근 읽은 SF 소설에 대해 이야기하고, 서로 추천작을 공유해요. 부담 없이 오세요!',
    date: '2026-09-19',
    time: '오후 5:00',
    region: '수원',
    venue: '수원 행궁동 카페 문장의 숲',
    maxParticipants: 15,
    currentParticipants: 6,
    fee: 0,
    host: '박도윤',
    hostId: 'u2',
  },
  {
    id: 'ev4',
    type: 'rotation',
    title: '9월 분당 북 라운지',
    description: '분당에서 열리는 북 라운지입니다. 책을 매개로 자연스럽게 대화를 나누며 독서 취향이 맞는 사람을 만나보세요. 얼굴이나 프로필이 아니라 밑줄과 문장을 먼저 나누는 자리입니다. 음료와 간단한 다과가 제공됩니다.',
    date: '2026-09-20',
    time: '오후 2:00',
    region: '성남·분당',
    venue: '분당 정자동 카페 페이지터너',
    maxParticipants: 10,
    currentParticipants: 3,
    fee: 15000,
    host: '위드북 운영팀',
  },
  {
    id: 'ev5',
    type: 'bookclub',
    title: '《모순》 독서 토론회',
    description: '양귀자 작가의 《모순》을 함께 읽고 토론합니다. 삶의 모순과 아이러니에 대해 깊이 생각해보는 시간입니다. 완독 후 참여를 권장합니다.',
    date: '2026-09-26',
    time: '오후 3:00',
    region: '용인',
    venue: '용인 수지구 카페 오후의 서재',
    maxParticipants: 10,
    currentParticipants: 5,
    fee: 5000,
    book: BOOKS[2],
    host: '한소율',
    hostId: 'u3',
  },
  {
    id: 'ev6',
    type: 'gathering',
    title: '에세이 좋아하는 사람 모여라',
    description: '에세이를 즐겨 읽는 사람들의 가벼운 모임입니다. 각자 좋아하는 에세이 한 권을 가져와서 소개하고, 좋아하는 구절을 낭독해요. 따뜻한 대화가 기다리고 있습니다.',
    date: '2026-09-27',
    time: '오후 4:00',
    region: '천안 동남구',
    venue: '천안 동남구 카페 오후의 서재',
    maxParticipants: 12,
    currentParticipants: 9,
    fee: 3000,
    host: '오지환',
    hostId: 'u4',
  },
  {
    id: 'ev7',
    type: 'quarterly',
    title: '성남 인문 책방 분기모임',
    description: '성남 인문 책방 소속 서재들이 한자리에 모이는 분기 모임입니다. 각 서재에서 이번 분기에 읽은 책을 소개하고, 인상 깊었던 밑줄을 공유합니다.',
    date: '2026-10-17',
    time: '오후 2:00',
    region: '성남·분당',
    venue: '분당 서현역 북카페 달빛책방',
    maxParticipants: 40,
    currentParticipants: 18,
    fee: 5000,
    host: '성남 인문 책방',
  },
];

export const MOCK_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  club1: [
    { id: 'c1m1', roomId: 'club1', senderId: 'u1', senderName: '이서연', senderAvatar: '/assets/avatar-seoyeon.png', type: 'message', text: '오늘 싯다르타 3장까지 읽었는데 강물 비유가 정말 인상적이었어요', createdAt: '오후 2:30' },
    { id: 'c1m2', roomId: 'club1', senderId: 'u2', senderName: '박도윤', senderAvatar: '/assets/avatar-doyoon.png', type: 'message', text: '저도요! 시간에 대한 관점이 완전히 달라지는 느낌이었어요', createdAt: '오후 2:35' },
    { id: 'c1m3', roomId: 'club1', senderId: 'u3', senderName: '한소율', senderAvatar: '/assets/avatar-soyul.png', type: 'message', text: '다음 모임 때 그 부분 집중적으로 이야기해봐요 😊', createdAt: '오후 3:10' },
  ],
  club2: [
    { id: 'c2m1', roomId: 'club2', senderId: 'u2', senderName: '박도윤', senderAvatar: '/assets/avatar-doyoon.png', type: 'message', text: '프로젝트 헤일메리 절반 왔는데 진짜 손에서 못 놓겠어요', createdAt: '오후 7:00' },
    { id: 'c2m2', roomId: 'club2', senderId: 'u4', senderName: '오지환', senderAvatar: '/assets/avatar-jihwan.png', type: 'message', text: '록키 나오는 부분부터 가속 붙습니다 ㅋㅋ', createdAt: '오후 7:15' },
  ],
  club3: [
    { id: 'c3m1', roomId: 'club3', senderId: 'u1', senderName: '이서연', senderAvatar: '/assets/avatar-seoyeon.png', type: 'message', text: '모순 완독했어요. 마지막 장이 여운이 길더라고요', createdAt: '오전 10:00' },
    { id: 'c3m2', roomId: 'club3', senderId: 'u3', senderName: '한소율', senderAvatar: '/assets/avatar-soyul.png', type: 'message', text: '양귀자 작가 문체가 참 좋아요. 다음 책도 기대됩니다', createdAt: '오전 11:20' },
  ],
  club4: [
    { id: 'c4m1', roomId: 'club4', senderId: 'u4', senderName: '오지환', senderAvatar: '/assets/avatar-jihwan.png', type: 'message', text: '이기적 유전자 5장 밈 개념 부분이 가장 흥미로웠어요', createdAt: '오후 9:00' },
  ],
  ev1: [
    { id: 'e1m1', roomId: 'ev1', senderId: 'u2', senderName: '박도윤', senderAvatar: '/assets/avatar-doyoon.png', type: 'message', text: '강남 북 라운지 참가하시는 분들 어떤 책 가져오시나요?', createdAt: '오후 1:00' },
    { id: 'e1m2', roomId: 'ev1', senderId: 'u1', senderName: '이서연', senderAvatar: '/assets/avatar-seoyeon.png', type: 'message', text: '저는 좋아하는 에세이 한 권 들고 갈 예정이에요!', createdAt: '오후 1:30' },
  ],
  ev2: [
    { id: 'e2m1', roomId: 'ev2', senderId: 'u1', senderName: '이서연', senderAvatar: '/assets/avatar-seoyeon.png', type: 'message', text: '싯다르타 완독하고 오시는 거 맞죠?', createdAt: '오전 9:00' },
    { id: 'e2m2', roomId: 'ev2', senderId: 'u3', senderName: '한소율', senderAvatar: '/assets/avatar-soyul.png', type: 'message', text: '네! 인상 깊은 구절도 메모해갈게요', createdAt: '오전 9:30' },
  ],
  ev3: [
    { id: 'e3m1', roomId: 'ev3', senderId: 'u4', senderName: '오지환', senderAvatar: '/assets/avatar-jihwan.png', type: 'message', text: 'SF 번개 기대되네요! 최근 읽은 책 추천 준비해올게요', createdAt: '오후 4:00' },
  ],
  ev5: [
    { id: 'e5m1', roomId: 'ev5', senderId: 'u3', senderName: '한소율', senderAvatar: '/assets/avatar-soyul.png', type: 'message', text: '모순 토론회 준비 잘 되고 있나요?', createdAt: '오후 5:00' },
    { id: 'e5m2', roomId: 'ev5', senderId: 'u1', senderName: '이서연', senderAvatar: '/assets/avatar-seoyeon.png', type: 'message', text: '토론 주제 미리 공유해주시면 좋겠어요', createdAt: '오후 5:30' },
  ],
  ev6: [
    { id: 'e6m1', roomId: 'ev6', senderId: 'u4', senderName: '오지환', senderAvatar: '/assets/avatar-jihwan.png', type: 'message', text: '에세이 모임 장소가 카페 오후의 서재 맞나요?', createdAt: '오후 6:00' },
  ],
  ev7: [
    { id: 'e7m1', roomId: 'ev7', senderId: 'u1', senderName: '이서연', senderAvatar: '/assets/avatar-seoyeon.png', type: 'message', text: '성남 분기모임 때 각 서재에서 이번에 읽은 책 발표 준비해 오시나요?', createdAt: '오후 3:00' },
  ],
  'sj1-chat': [
    { id: 'sj1m1', roomId: 'sj1-chat', senderId: 'u1', senderName: '이서연', senderAvatar: '/assets/avatar-seoyeon.png', type: 'message', text: '이번 달 책 싯다르타 다들 잘 읽고 계신가요?', createdAt: '오후 2:00' },
    { id: 'sj1m2', roomId: 'sj1-chat', senderId: 'u2', senderName: '박도윤', senderAvatar: '/assets/avatar-doyoon.png', type: 'message', text: '절반 정도 읽었어요! 강물 장면이 너무 좋아요', createdAt: '오후 2:15' },
  ],
};

export const MOCK_BOOK_TOPICS: Record<string, BookTopic> = {
  club1: { question: '싯다르타가 강에서 깨달은 "시간은 존재하지 않는다"는 말, 어떻게 이해하셨나요?', bookTitle: '싯다르타', bookAuthor: '헤르만 헤세' },
  club2: { question: '그레이스가 록키와 처음 소통하는 장면에서 느낀 감정은?', bookTitle: '프로젝트 헤일메리', bookAuthor: '앤디 위어' },
  club3: { question: '"모순이 없는 삶은 없다"는 문장에 공감하시나요?', bookTitle: '모순', bookAuthor: '양귀자' },
  club4: { question: '밈(meme) 개념이 현대 인터넷 문화에도 적용될 수 있을까요?', bookTitle: '이기적 유전자', bookAuthor: '리처드 도킨스' },
  ev1: { question: '처음 만나는 사람에게 책으로 자신을 소개한다면 어떤 책을 고르시겠어요?', bookTitle: '자유 주제', bookAuthor: '참가자 선택' },
  ev2: { question: '싯다르타의 여정에서 가장 공감한 순간은 언제인가요?', bookTitle: '싯다르타', bookAuthor: '헤르만 헤세' },
  ev3: { question: '최근 읽은 SF 중 가장 과학적으로 흥미로운 설정은?', bookTitle: '자유 주제', bookAuthor: 'SF 장르' },
  ev5: { question: '양귀자 작가가 말하는 "모순을 껴안는 법"이란 무엇일까요?', bookTitle: '모순', bookAuthor: '양귀자' },
  ev6: { question: '당신의 인생 에세이 한 권을 꼽는다면?', bookTitle: '자유 주제', bookAuthor: '에세이' },
  ev7: { question: '이번 분기, 서재에서 가장 인상 깊었던 책은?', bookTitle: '자유 주제', bookAuthor: '책방 분기모임' },
  'sj1-chat': { question: '싯다르타에서 강물이 상징하는 것은 무엇일까요?', bookTitle: '싯다르타', bookAuthor: '헤르만 헤세' },
};

// ── 데모 채팅 데이터 ──
// 실제 유저가 생기면 이 데모 데이터는 제거하고 DB 데이터로 자연스럽게 교체됩니다.

export interface DemoChatRoom {
  id: string;
  name: string;
  type: 'highlight_pair' | 'seojae' | 'event';
  iconAvatar?: string;         // highlight_pair: 상대 아바타
  memberCount?: number;        // 단톡방 인원
  unreadCount: number;
}

export const DEMO_CHAT_ROOMS: DemoChatRoom[] = [
  // ── 밑줄 짝 (3개) ──
  {
    id: 'demo-pair-1',
    name: '박도윤과의 밑줄 짝',
    type: 'highlight_pair',
    iconAvatar: '/assets/avatar-doyoon.png',
    unreadCount: 2,
  },
  {
    id: 'demo-pair-2',
    name: '한소율과의 밑줄 짝',
    type: 'highlight_pair',
    iconAvatar: '/assets/avatar-soyul.png',
    unreadCount: 1,
  },
  {
    id: 'demo-pair-3',
    name: '오지환과의 밑줄 짝',
    type: 'highlight_pair',
    iconAvatar: '/assets/avatar-jihwan.png',
    unreadCount: 0,
  },
  // ── 단톡방: 서재 (2개) ──
  {
    id: 'demo-seojae-1',
    name: '강남 화요 서재',
    type: 'seojae',
    memberCount: 12,
    unreadCount: 5,
  },
  {
    id: 'demo-seojae-2',
    name: '분당 목요 저녁 서재',
    type: 'seojae',
    memberCount: 10,
    unreadCount: 3,
  },
  // ── 단톡방: 북 라운지 (1개) ──
  {
    id: 'demo-lounge',
    name: '9월 강남 북 라운지',
    type: 'event',
    memberCount: 8,
    unreadCount: 0,
  },
];

export const DEMO_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  // ── 밑줄 짝 1: 박도윤 × 싯다르타 (오늘) ──
  'demo-pair-1': [
    { id: 'dp1-1', roomId: 'demo-pair-1', senderId: 'u2', senderName: '박도윤', senderAvatar: '/assets/avatar-doyoon.png', type: 'message', text: '어제 올려주신 밑줄 봤어요. "강물은 어디서나 동시에 존재한다" \u2014 그 문장, 저도 접어뒀어요.', createdAt: '어제 오후 9:12' },
    { id: 'dp1-2', roomId: 'demo-pair-1', senderId: 'me', senderName: '나', senderAvatar: '', type: 'message', text: '진짜요? 저는 그 문장 읽고 한참 멍했어요. 시간에 대한 생각이 완전히 바뀌는 느낌이었거든요.', createdAt: '어제 오후 9:18', isMe: true },
    { id: 'dp1-3', roomId: 'demo-pair-1', senderId: 'u2', senderName: '박도윤', senderAvatar: '/assets/avatar-doyoon.png', type: 'message', text: '같은 부분이에요. 저는 출퇴근 지하철에서 읽었는데, 주변이 멈춘 것 같았어요. 읽는 장소에 따라 울림이 다른 것 같아요.', createdAt: '어제 오후 9:25' },
    { id: 'dp1-4', roomId: 'demo-pair-1', senderId: 'me', senderName: '나', senderAvatar: '', type: 'message', text: '맞아요. 저는 새벽에 읽어서 그런지 좀 더 고요하게 와닿았어요. 혹시 5장까지 읽으셨어요?', createdAt: '어제 오후 9:31', isMe: true },
    { id: 'dp1-5', roomId: 'demo-pair-1', senderId: 'u2', senderName: '박도윤', senderAvatar: '/assets/avatar-doyoon.png', type: 'message', text: '아직 4장이요! 오늘 밤에 5장 읽으려고요. 밑줄 그으면 바로 올릴게요.', createdAt: '어제 오후 9:33' },
    { id: 'dp1-6', roomId: 'demo-pair-1', senderId: 'me', senderName: '나', senderAvatar: '', type: 'message', text: '5장에 진짜 좋은 문장이 있어요. 스포 안 할게요 ㅎㅎ 기대하세요.', createdAt: '어제 오후 9:40', isMe: true },
    { id: 'dp1-7', roomId: 'demo-pair-1', senderId: 'u2', senderName: '박도윤', senderAvatar: '/assets/avatar-doyoon.png', type: 'message', text: '기대할게요! 같은 책 읽는 사람이 있으니까 페이스가 유지돼서 좋네요.', createdAt: '오늘 오전 8:15' },
    { id: 'dp1-8', roomId: 'demo-pair-1', senderId: 'u2', senderName: '박도윤', senderAvatar: '/assets/avatar-doyoon.png', type: 'message', text: '아 그리고 어제 밑줄에 남겨주신 이유, "앞만 보고 달려온 시간이 헛되지 않았다는 위로" \u2014 그게 도윤이에게도 위로가 됐어요. 고마워요.', createdAt: '오늘 오전 8:17' },
  ],

  // ── 밑줄 짝 2: 한소율 × 모순 (어제) ──
  'demo-pair-2': [
    { id: 'dp2-1', roomId: 'demo-pair-2', senderId: 'u3', senderName: '한소율', senderAvatar: '/assets/avatar-soyul.png', type: 'message', text: '《모순》 3장까지 읽었는데, "모순이 없는 삶은 없다"는 문장에서 한참 멈췄어요.', createdAt: '그저께 오후 7:00' },
    { id: 'dp2-2', roomId: 'demo-pair-2', senderId: 'me', senderName: '나', senderAvatar: '', type: 'message', text: '저도요! 좋아하는 일과 안정 사이에서 갈등할 때 그 문장이 "둘 다 맞다"고 말해주는 것 같았어요.', createdAt: '그저께 오후 7:15', isMe: true },
    { id: 'dp2-3', roomId: 'demo-pair-2', senderId: 'u3', senderName: '한소율', senderAvatar: '/assets/avatar-soyul.png', type: 'message', text: '완전 공감해요. 양귀자 작가 문체가 참 좋은 게, 무겁지 않게 깊은 이야기를 하거든요. 다음 장도 기대됩니다.', createdAt: '그저께 오후 7:30' },
    { id: 'dp2-4', roomId: 'demo-pair-2', senderId: 'me', senderName: '나', senderAvatar: '', type: 'message', text: '소율님은 어떤 순간에 모순을 가장 크게 느끼셨어요?', createdAt: '어제 오후 8:10', isMe: true },
    { id: 'dp2-5', roomId: 'demo-pair-2', senderId: 'u3', senderName: '한소율', senderAvatar: '/assets/avatar-soyul.png', type: 'message', text: '회사를 다니면서 글쓰기 수업을 듣기 시작했을 때요. 양립할 수 없는 것 같은데, 둘 다 포기하고 싶지 않았거든요. 그래서 이 책이 더 와닿아요.', createdAt: '어제 오후 8:25' },
  ],

  // ── 밑줄 짝 3: 오지환 × 코스모스 (3일 전) ──
  'demo-pair-3': [
    { id: 'dp3-1', roomId: 'demo-pair-3', senderId: 'u4', senderName: '오지환', senderAvatar: '/assets/avatar-jihwan.png', type: 'message', text: '코스모스 읽기 시작했어요. 칼 세이건 문체가 생각보다 따뜻하네요.', createdAt: '4일 전 오후 6:00' },
    { id: 'dp3-2', roomId: 'demo-pair-3', senderId: 'me', senderName: '나', senderAvatar: '', type: 'message', text: '맞아요! 과학책인데 시적이라는 게 칼 세이건의 매력인 것 같아요. 어디까지 읽으셨어요?', createdAt: '4일 전 오후 6:20', isMe: true },
    { id: 'dp3-3', roomId: 'demo-pair-3', senderId: 'u4', senderName: '오지환', senderAvatar: '/assets/avatar-jihwan.png', type: 'message', text: '2장이요. "우리는 별의 먼지로 만들어진 존재다"라는 문장에 밑줄 그었어요. 이런 문장은 과학이 아니라 철학에 가까운 것 같아요.', createdAt: '4일 전 오후 6:35' },
    { id: 'dp3-4', roomId: 'demo-pair-3', senderId: 'me', senderName: '나', senderAvatar: '', type: 'message', text: '그 문장 좋죠. 저도 그 부분에서 밑줄 남겼어요. 읽으시면서 인상 깊은 문장 공유해주세요!', createdAt: '3일 전 오전 9:00', isMe: true },
    { id: 'dp3-5', roomId: 'demo-pair-3', senderId: 'u4', senderName: '오지환', senderAvatar: '/assets/avatar-jihwan.png', type: 'message', text: '네! 이번 주 안에 5장까지 읽고 올릴게요. 같이 읽으니까 혼자 읽을 때보다 훨씬 집중이 잘 돼요.', createdAt: '3일 전 오전 9:15' },
  ],

  // ── 서재 단톡방 1: 강남 화요 서재 (12명) ──
  'demo-seojae-1': [
    { id: 'ds1-1', roomId: 'demo-seojae-1', senderId: 'u1', senderName: '이서연', senderAvatar: '/assets/avatar-seoyeon.png', type: 'message', text: '다음 주 화요일 모임 책은 《데미안》으로 확정할까요? 지난번에 투표했을 때 1위였어요.', createdAt: '어제 오후 2:10' },
    { id: 'ds1-2', roomId: 'demo-seojae-1', senderId: 'u4', senderName: '오지환', senderAvatar: '/assets/avatar-jihwan.png', type: 'message', text: '좋아요! 데미안이면 싯다르타랑 이어서 헤세 연속이네요. 연결 지어서 읽으면 재밌을 것 같아요.', createdAt: '어제 오후 2:25' },
    { id: 'ds1-3', roomId: 'demo-seojae-1', senderId: 'u3', senderName: '한소율', senderAvatar: '/assets/avatar-soyul.png', type: 'message', text: '저 발제 해볼게요! "새는 알에서 나오려고 투쟁한다" 부분으로 준비하고 싶어요.', createdAt: '어제 오후 3:04' },
    { id: 'ds1-4', roomId: 'demo-seojae-1', senderId: 'u1', senderName: '이서연', senderAvatar: '/assets/avatar-seoyeon.png', type: 'message', text: '소율님 발제 기대돼요! 그 문장이면 각자 "깨뜨려야 했던 알"이 뭐였는지 이야기 나눌 수 있겠다.', createdAt: '어제 오후 3:15' },
    { id: 'ds1-5', roomId: 'demo-seojae-1', senderId: 'u2', senderName: '박도윤', senderAvatar: '/assets/avatar-doyoon.png', type: 'message', text: '장소는 지난번이랑 같은 역삼 북티크 맞나요? 7시 시작?', createdAt: '오늘 오전 10:30' },
    { id: 'ds1-6', roomId: 'demo-seojae-1', senderId: 'u1', senderName: '이서연', senderAvatar: '/assets/avatar-seoyeon.png', type: 'message', text: '네, 북티크 2층 예약해뒀어요. 화요일 저녁 7시! 완독 안 하셔도 괜찮으니 편하게 오세요.', createdAt: '오늘 오전 10:45' },
  ],

  // ── 서재 단톡방 2: 분당 목요 저녁 서재 (10명) ──
  'demo-seojae-2': [
    { id: 'ds2-1', roomId: 'demo-seojae-2', senderId: 'u-rec1', senderName: '김하늘', senderAvatar: '/assets/avatar-seoyeon.png', type: 'message', text: '이번 달 책 《미움받을 용기》 다들 잘 읽고 계신가요? 다음 모임에서 2부 중심으로 이야기해볼게요.', createdAt: '어제 오후 5:30' },
    { id: 'ds2-2', roomId: 'demo-seojae-2', senderId: 'u1', senderName: '이서연', senderAvatar: '/assets/avatar-seoyeon.png', type: 'message', text: '2부 "모든 고민은 대인관계의 고민이다" 부분이 와닿았어요. 발제 때 이야기 나눠요!', createdAt: '어제 오후 6:00' },
    { id: 'ds2-3', roomId: 'demo-seojae-2', senderId: 'u4', senderName: '오지환', senderAvatar: '/assets/avatar-jihwan.png', type: 'message', text: '저는 "과거에 어떤 일이 있었든, 그것이 미래를 결정하지는 않는다"가 좋았어요. 목요일에 뵐게요!', createdAt: '오늘 오전 9:00' },
  ],

  // ── 북 라운지 단톡방 (9월 강남 북 라운지) ──
  'demo-lounge': [
    { id: 'dl1', roomId: 'demo-lounge', senderId: 'system', senderName: '', senderAvatar: '', type: 'system', text: '9월 강남 북 라운지 채팅방이 개설되었습니다.', createdAt: '9월 1일' },
    { id: 'dl2', roomId: 'demo-lounge', senderId: 'u1', senderName: '이서연', senderAvatar: '/assets/avatar-seoyeon.png', type: 'message', text: '안녕하세요! 9월 12일 강남 북 라운지 참가자 여러분 반갑습니다. 당일 각자 좋아하는 책 한 권을 가져와서 돌아가며 소개하는 시간이에요.', createdAt: '9월 1일 오후 1:00' },
    { id: 'dl3', roomId: 'demo-lounge', senderId: 'u4', senderName: '오지환', senderAvatar: '/assets/avatar-jihwan.png', type: 'message', text: '기대되네요! 어떤 책을 가져갈지 고민 중이에요. 과학책 가져가도 괜찮을까요?', createdAt: '9월 1일 오후 2:30' },
    { id: 'dl4', roomId: 'demo-lounge', senderId: 'u1', senderName: '이서연', senderAvatar: '/assets/avatar-seoyeon.png', type: 'message', text: '물론이죠! 장르 제한 없어요. 내가 좋아하는 책이면 다 좋습니다. 장소는 강남 역삼동 독립서점 북티크, 오후 3시 시작이에요.', createdAt: '9월 1일 오후 2:45' },
  ],
};

export const DEMO_BOOK_TOPICS: Record<string, BookTopic> = {
  'demo-pair-1': { question: '싯다르타가 강에서 깨달은 것 \u2014 같은 문장에서 서로 다른 울림이 있었나요?', bookTitle: '싯다르타', bookAuthor: '헤르만 헤세' },
  'demo-pair-2': { question: '"모순을 껴안는다"는 것, 지금 내 삶에서는 어떤 모습일까요?', bookTitle: '모순', bookAuthor: '양귀자' },
  'demo-pair-3': { question: '"우리는 별의 먼지"라는 문장이 주는 위로 \u2014 어떻게 느끼셨나요?', bookTitle: '코스모스', bookAuthor: '칼 세이건' },
  'demo-seojae-1': { question: '"새는 알에서 나오려고 투쟁한다" \u2014 나에게 \u2018알\u2019은 무엇이었나요?', bookTitle: '데미안', bookAuthor: '헤르만 헤세' },
  'demo-seojae-2': { question: '"미움받을 용기"가 정말 필요했던 순간은 언제인가요?', bookTitle: '미움받을 용기', bookAuthor: '기시미 이치로' },
  'demo-lounge': { question: '처음 만나는 사람에게 책 한 권으로 나를 소개한다면?', bookTitle: '자유 주제', bookAuthor: '참가자 선택' },
};

// ── 밑줄 목업 데이터 ──

export const REACTION_LABELS: Record<HighlightReactionType, string> = {
  felt_same: '나도 그랬어요',
  want_to_read: '이 책 읽어볼게요',
  stays_long: '오래 남네요',
};

export const REACTION_ICONS: Record<HighlightReactionType, string> = {
  felt_same: '🤝',
  want_to_read: '📖',
  stays_long: '✨',
};

// ── 던바 구조 목업 데이터 ──

export const MOCK_CITY_COMMUNITIES: CityCommunity[] = [
  { id: 'city-seoul', region: '서울', name: '서울 위드북', description: '서울 독서 커뮤니티', maxMembers: 150, memberCount: 98 },
  { id: 'city-seongnam', region: '성남·분당', name: '성남 위드북', description: '성남·분당 독서 커뮤니티', maxMembers: 150, memberCount: 87 },
  { id: 'city-suwon', region: '수원', name: '수원 위드북', description: '수원 독서 커뮤니티', maxMembers: 150, memberCount: 62 },
  { id: 'city-yongin', region: '용인', name: '용인 위드북', description: '용인 독서 커뮤니티', maxMembers: 150, memberCount: 45 },
  { id: 'city-anyang', region: '안양·평촌', name: '안양 위드북', description: '안양·평촌 독서 커뮤니티', maxMembers: 150, memberCount: 38 },
  { id: 'city-goyang', region: '고양·일산', name: '고양 위드북', description: '고양·일산 독서 커뮤니티', maxMembers: 150, memberCount: 53 },
  { id: 'city-cheonan', region: '천안 서북구', name: '천안 위드북', description: '천안 독서 커뮤니티', maxMembers: 150, memberCount: 62 },
];

export const MOCK_SEOJAE: Seojae[] = [
  {
    id: 'sj1',
    communityId: 'city-seoul',
    name: '강남 화요 서재',
    description: '화요일 저녁, 강남에서 책 한 권으로 하루를 마무리하는 서재입니다. 매달 한 권씩 함께 읽어요.',
    ownerId: 'u1',
    ownerName: '이서연',
    ownerAvatar: '/assets/avatar-seoyeon.png',
    chatRoomId: 'sj1-chat',
    maxMembers: 15,
    memberCount: 11,
    members: [
      { userId: 'u1', userName: '이서연', userAvatar: '/assets/avatar-seoyeon.png', role: 'owner', joinedAt: '2025-03-01' },
      { userId: 'u2', userName: '박도윤', userAvatar: '/assets/avatar-doyoon.png', role: 'member', joinedAt: '2025-03-05' },
      { userId: 'u3', userName: '한소율', userAvatar: '/assets/avatar-soyul.png', role: 'member', joinedAt: '2025-03-10' },
      { userId: 'u4', userName: '오지환', userAvatar: '/assets/avatar-jihwan.png', role: 'member', joinedAt: '2025-04-01' },
    ],
    monthlyOfflineDay: '매월 둘째 토요일 오후 3시',
    isActive: true,
  },
  {
    id: 'sj2',
    communityId: 'city-suwon',
    name: '과학 산책 서재',
    description: '과학 교양서를 함께 읽으며 세상을 보는 새로운 눈을 키워요. 부담 없이 참여하세요!',
    ownerId: 'u4',
    ownerName: '오지환',
    ownerAvatar: '/assets/avatar-jihwan.png',
    chatRoomId: 'sj2-chat',
    maxMembers: 12,
    memberCount: 8,
    members: [
      { userId: 'u4', userName: '오지환', userAvatar: '/assets/avatar-jihwan.png', role: 'owner', joinedAt: '2025-04-01' },
      { userId: 'u2', userName: '박도윤', userAvatar: '/assets/avatar-doyoon.png', role: 'member', joinedAt: '2025-04-05' },
    ],
    monthlyOfflineDay: '매월 넷째 일요일 오후 2시',
    isActive: true,
  },
  {
    id: 'sj3',
    communityId: 'city-seongnam',
    name: '한국 소설 깊이 읽기',
    description: '한국 현대 소설의 깊이를 함께 탐구하는 서재입니다. 매달 한국 작가의 소설 한 권을 선정합니다.',
    ownerId: 'u3',
    ownerName: '한소율',
    ownerAvatar: '/assets/avatar-soyul.png',
    chatRoomId: 'sj3-chat',
    maxMembers: 15,
    memberCount: 14,
    members: [
      { userId: 'u3', userName: '한소율', userAvatar: '/assets/avatar-soyul.png', role: 'owner', joinedAt: '2025-02-01' },
      { userId: 'u1', userName: '이서연', userAvatar: '/assets/avatar-seoyeon.png', role: 'member', joinedAt: '2025-02-10' },
    ],
    monthlyOfflineDay: '매월 셋째 토요일 오후 4시',
    isActive: true,
  },
  // ── 추천 서재 (비공개 테스트용 데모 데이터) ──
  {
    id: 'sj4',
    communityId: 'city-seongnam',
    name: '분당 목요 저녁 서재',
    description: '퇴근 후 목요일 저녁, 책 한 권으로 일상을 환기하는 서재입니다. 장르 제한 없이 매달 한 권을 정해 함께 읽어요.',
    ownerId: 'u-rec1',
    ownerName: '김하늘',
    ownerAvatar: '/assets/avatar-seoyeon.png',
    chatRoomId: 'sj4-chat',
    maxMembers: 12,
    memberCount: 9,
    members: [
      { userId: 'u-rec1', userName: '김하늘', userAvatar: '/assets/avatar-seoyeon.png', role: 'owner', joinedAt: '2025-03-01' },
    ],
    monthlyOfflineDay: '매월 둘째·넷째 목요일 저녁 7시 30분',
    isActive: true,
    currentBook: { isbn: '6', title: '미움받을 용기', author: '기시미 이치로', coverUrl: '' },
  },
  {
    id: 'sj5',
    communityId: 'city-suwon',
    name: '수원 과학책 서재',
    description: '우주, 생물, 물리, 뇌과학\u2026 과학 교양서를 함께 읽으며 질문을 나누는 서재입니다. 비전공자 환영!',
    ownerId: 'u-rec2',
    ownerName: '정우진',
    ownerAvatar: '/assets/avatar-jihwan.png',
    chatRoomId: 'sj5-chat',
    maxMembers: 15,
    memberCount: 11,
    members: [
      { userId: 'u-rec2', userName: '정우진', userAvatar: '/assets/avatar-jihwan.png', role: 'owner', joinedAt: '2025-02-15' },
    ],
    monthlyOfflineDay: '매월 첫째·셋째 토요일 오후 2시',
    isActive: true,
    currentBook: { isbn: '9', title: '코스모스', author: '칼 세이건', coverUrl: '' },
  },
  {
    id: 'sj6',
    communityId: 'city-yongin',
    name: '용인 에세이 서재',
    description: '에세이를 좋아하는 사람들이 모여 각자의 문장을 나누는 서재입니다. 한 달에 한 권, 느긋하게 읽어요.',
    ownerId: 'u-rec3',
    ownerName: '박지은',
    ownerAvatar: '/assets/avatar-soyul.png',
    chatRoomId: 'sj6-chat',
    maxMembers: 12,
    memberCount: 7,
    members: [
      { userId: 'u-rec3', userName: '박지은', userAvatar: '/assets/avatar-soyul.png', role: 'owner', joinedAt: '2025-04-01' },
    ],
    monthlyOfflineDay: '매월 셋째 일요일 오후 3시',
    isActive: true,
    currentBook: { isbn: 'e1', title: '걷는 사람, 하정우', author: '하정우', coverUrl: '' },
  },
  {
    id: 'sj7',
    communityId: 'city-goyang',
    name: '일산 주말 아침 서재',
    description: '토요일 아침, 커피 한 잔과 함께 시작하는 독서 모임입니다. 아침형 독서인을 위한 서재!',
    ownerId: 'u-rec4',
    ownerName: '이준혁',
    ownerAvatar: '/assets/avatar-doyoon.png',
    chatRoomId: 'sj7-chat',
    maxMembers: 10,
    memberCount: 6,
    members: [
      { userId: 'u-rec4', userName: '이준혁', userAvatar: '/assets/avatar-doyoon.png', role: 'owner', joinedAt: '2025-05-01' },
    ],
    monthlyOfflineDay: '매주 토요일 오전 8시',
    isActive: true,
    currentBook: { isbn: '8', title: '데미안', author: '헤르만 헤세', coverUrl: '' },
  },
  {
    id: 'sj8',
    communityId: 'city-cheonan',
    name: '천안 30대 전환기 서재',
    description: '커리어 전환, 관계 변화, 삶의 방향\u2026 30대의 질문을 책에서 찾는 서재입니다. 자기계발서부터 문학까지 폭넓게.',
    ownerId: 'u-rec5',
    ownerName: '최민서',
    ownerAvatar: '/assets/avatar-seoyeon.png',
    chatRoomId: 'sj8-chat',
    maxMembers: 15,
    memberCount: 13,
    members: [
      { userId: 'u-rec5', userName: '최민서', userAvatar: '/assets/avatar-seoyeon.png', role: 'owner', joinedAt: '2025-01-15' },
    ],
    monthlyOfflineDay: '매월 둘째 토요일 오후 4시',
    isActive: true,
    currentBook: { isbn: '11', title: '아몬드', author: '손원평', coverUrl: '' },
  },
];

export const MOCK_HIGHLIGHT_PAIRS: HighlightPair[] = [
  {
    id: 'pair1',
    seojaeId: 'sj1',
    partnerUserId: 'u2',
    partnerName: '박도윤',
    partnerAvatar: '/assets/avatar-doyoon.png',
    book: BOOKS[0], // 싯다르타
    chatRoomId: 'pair1-chat',
    streakCount: 12,
    lastInteractionDate: new Date().toISOString().split('T')[0],
    periodStart: '2026-08-20',
    isActive: true,
  },
  {
    id: 'pair2',
    seojaeId: 'sj3',
    partnerUserId: 'u3',
    partnerName: '한소율',
    partnerAvatar: '/assets/avatar-soyul.png',
    book: BOOKS[2], // 모순
    chatRoomId: 'pair2-chat',
    streakCount: 7,
    lastInteractionDate: (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]; })(),
    periodStart: '2026-09-01',
    isActive: true,
  },
  {
    id: 'pair3',
    seojaeId: 'sj2',
    partnerUserId: 'u4',
    partnerName: '오지환',
    partnerAvatar: '/assets/avatar-jihwan.png',
    book: BOOKS[8], // 코스모스
    chatRoomId: 'pair3-chat',
    streakCount: 3,
    lastInteractionDate: (() => { const d = new Date(); d.setDate(d.getDate() - 3); return d.toISOString().split('T')[0]; })(),
    periodStart: '2026-09-10',
    isActive: true,
  },
];

export const MOCK_CHAEKBANG: Chaekbang[] = [
  {
    id: 'cb1',
    communityId: 'city-seongnam',
    name: '성남 인문 책방',
    description: '성남·분당의 인문학 서재들이 모인 책방입니다.',
    quarterlyMeetingInfo: '9월 셋째 주 토요일 분당 서현역 북카페',
    seojaeIds: ['sj3', 'sj4'],
    seojaeCount: 2,
  },
];

// ── 조개 지표 목업 ──

export const MOCK_SHELL_METRICS: ShellMetrics = {
  readingFollows: 7,
  togetherDays: 12,
  discussionCredits: 3,
  mentorSticks: 2,
  seasonBadges: 1,
};

export const SHELL_METRIC_LABELS: { key: keyof ShellMetrics; label: string; icon: string; description: string }[] = [
  { key: 'readingFollows', label: '이어읽기', icon: '📎', description: '다른 사람의 밑줄에서 시작된 읽기' },
  { key: 'togetherDays', label: '함께 읽은 날', icon: '📅', description: '밑줄 짝과 같은 날 밑줄을 남긴 횟수' },
  { key: 'discussionCredits', label: '발제 크레딧', icon: '💬', description: '서재에서 대화를 시작한 질문 수' },
  { key: 'mentorSticks', label: '붙듦', icon: '🌱', description: '새 멤버의 첫 기록자 달성을 함께한 횟수' },
  { key: 'seasonBadges', label: '계절 배지', icon: '🍂', description: '한 서재에서 한 계절을 함께 보낸 기록' },
];

// ── 온보딩 질문 ──

export const ONBOARDING_QUESTIONS: { id: 'q1' | 'q2' | 'q3'; question: string; description: string }[] = [
  {
    id: 'q1',
    question: '지난 1년간 책 이야기를 나눈 사람은 몇 명인가요?',
    description: '가족, 친구, 동료 모두 포함해서 떠올려 보세요.',
  },
  {
    id: 'q2',
    question: '그중 같은 책을 읽고 이야기한 사람은요?',
    description: '같은 책을 읽었거나, 추천해서 읽게 된 경우도 포함해요.',
  },
  {
    id: 'q3',
    question: '밑줄 치며 읽은 책은 몇 권인가요?',
    description: '형광펜, 연필, 메모 앱 등 어떤 방식이든 괜찮아요.',
  },
];

// ── 동석 기록 목업 데이터 ──

export const MOCK_CO_ATTENDANCES: CoAttendance[] = [
  { userId: 'u2', userName: '박도윤', userAvatar: '/assets/avatar-doyoon.png', count: 5 },
  { userId: 'u3', userName: '한소율', userAvatar: '/assets/avatar-soyul.png', count: 3 },
  { userId: 'u4', userName: '오지환', userAvatar: '/assets/avatar-jihwan.png', count: 2 },
  { userId: 'u1', userName: '이서연', userAvatar: '/assets/avatar-seoyeon.png', count: 1 },
];

export const MOCK_CO_ATTENDANCE_DETAILS: Record<string, CoAttendanceDetail> = {
  u2: {
    userId: 'u2',
    userName: '박도윤',
    userAvatar: '/assets/avatar-doyoon.png',
    count: 5,
    sharedMeetings: [
      { seojaeId: 'sj1', seojaeName: '강남 화요 서재', book: BOOKS[0], date: '2026-08-10' },
      { seojaeId: 'sj1', seojaeName: '강남 화요 서재', book: BOOKS[7], date: '2026-07-13' },
      { seojaeId: 'sj1', seojaeName: '강남 화요 서재', book: BOOKS[9], date: '2026-06-08' },
      { seojaeId: 'sj2', seojaeName: '과학 산책 서재', book: BOOKS[3], date: '2026-05-25' },
      { seojaeId: 'sj1', seojaeName: '강남 화요 서재', book: BOOKS[8], date: '2026-04-12' },
    ],
    sharedHighlight: {
      sentence: '강물은 어디서나 동시에 존재한다. 발원지에서도, 하구에서도, 폭포에서도.',
      book: BOOKS[0],
      myReason: '시간에 쫓기며 살던 때에 이 문장을 만났어요. 앞만 보고 달려온 시간이 헛되지 않았다는 위로.',
      partnerReason: '출퇴근 지하철에서 읽었는데 주변이 멈춘 것 같았어요. 시간의 흐름이 달라 보였습니다.',
    },
  },
  u3: {
    userId: 'u3',
    userName: '한소율',
    userAvatar: '/assets/avatar-soyul.png',
    count: 3,
    sharedMeetings: [
      { seojaeId: 'sj1', seojaeName: '강남 화요 서재', book: BOOKS[0], date: '2026-08-10' },
      { seojaeId: 'sj3', seojaeName: '한국 소설 깊이 읽기', book: BOOKS[2], date: '2026-07-20' },
      { seojaeId: 'sj1', seojaeName: '강남 화요 서재', book: BOOKS[7], date: '2026-06-14' },
    ],
  },
  u4: {
    userId: 'u4',
    userName: '오지환',
    userAvatar: '/assets/avatar-jihwan.png',
    count: 2,
    sharedMeetings: [
      { seojaeId: 'sj1', seojaeName: '강남 화요 서재', book: BOOKS[0], date: '2026-08-10' },
      { seojaeId: 'sj2', seojaeName: '과학 산책 서재', book: BOOKS[3], date: '2026-07-27' },
    ],
  },
  'u-diff1': {
    userId: 'u-diff1',
    userName: '윤채린',
    userAvatar: '/assets/avatar-soyul.png',
    count: 1,
    sharedMeetings: [
      { seojaeId: 'sj1', seojaeName: '강남 화요 서재', book: BOOKS[0], date: '2026-08-10' },
    ],
    sharedHighlight: {
      sentence: '강물은 어디서나 동시에 존재한다. 발원지에서도, 하구에서도, 폭포에서도.',
      book: BOOKS[0],
      myReason: '앞만 보고 달려온 시간이 헛되지 않았다는 위로처럼 느껴졌어요.',
      partnerReason: '고통 한복판에 있는 사람에게 "현재만 존재한다"는 말은 위로가 아니라 외면인 것 같아요.',
    },
  },
  u1: {
    userId: 'u1',
    userName: '이서연',
    userAvatar: '/assets/avatar-seoyeon.png',
    count: 1,
    sharedMeetings: [
      { seojaeId: 'sj3', seojaeName: '한국 소설 깊이 읽기', book: BOOKS[2], date: '2026-08-17' },
    ],
    sharedHighlight: {
      sentence: '모순이 없는 삶은 없다. 다만 그 모순을 어떻게 껴안느냐가 삶의 질을 결정한다.',
      book: BOOKS[2],
      myReason: '좋아하는 일과 돈 버는 일 사이 갈등이 이 한 문장으로 풀렸어요.',
      partnerReason: '안정적인 직장을 그만둘까 고민하던 시기에, 두 마음이 다 맞다는 허락처럼 느껴졌어요.',
    },
  },
};

export const MOCK_HIGHLIGHTS: Highlight[] = [
  {
    id: 'h1',
    userId: 'u1',
    userName: '이서연',
    userAvatar: '/assets/avatar-seoyeon.png',
    book: BOOKS[0],
    sentence: '강물은 어디서나 동시에 존재한다. 발원지에서도, 하구에서도, 폭포에서도, 여울에서도, 바다에서도, 산에서도. 강물에게는 오직 현재만이 존재할 뿐, 미래라는 그림자는 없다.',
    reason: '시간에 쫓기며 살던 때에 이 문장을 만났어요. "동시에 존재한다"는 말이 과거의 나와 지금의 나를 한꺼번에 안아주는 것 같았고, 읽는 순간 눈물이 났습니다. 앞만 보고 달려온 시간이 헛되지 않았다는 위로처럼 느껴졌어요.',
    context: '이직 준비를 하면서 퇴근 후 카페에서 읽던 중이었어요. 앞이 안 보이던 시기.',
    reactions: { felt_same: 12, want_to_read: 5, stays_long: 18, myReactions: new Set() },
    createdAt: '2시간 전',
    sentiment: 'positive',
  },
  {
    id: 'h2',
    userId: 'u2',
    userName: '박도윤',
    userAvatar: '/assets/avatar-doyoon.png',
    book: BOOKS[1],
    sentence: '나는 혼자가 아니었다. 우주 어딘가에서 누군가가 같은 하늘을 보며 같은 생각을 하고 있었다.',
    reason: '1인 가구 3년 차에 이 문장을 읽었어요. 혼자 밥 먹고 혼자 출근하는 게 당연해진 줄 알았는데, "같은 생각을 하고 있었다"는 문장 앞에서 외로움을 처음 인정했습니다. 외롭다고 말해도 괜찮다는 허락 같았어요.',
    context: '주말 아침, 침대에 누워서 읽고 있었어요. 밖에 나가기 싫은 날.',
    reactions: { felt_same: 8, want_to_read: 3, stays_long: 11, myReactions: new Set() },
    createdAt: '5시간 전',
    sentiment: 'positive',
  },
  {
    id: 'h3',
    userId: 'u3',
    userName: '한소율',
    userAvatar: '/assets/avatar-soyul.png',
    book: BOOKS[2],
    sentence: '모순이 없는 삶은 없다. 다만 그 모순을 어떻게 껴안느냐가 삶의 질을 결정한다.',
    reason: '좋아하는 일과 돈 버는 일 사이에서 계속 갈등하던 때였어요. 이 문장이 "둘 다 맞다"고 말해주는 것 같았습니다. 양립할 수 없는 것들을 억지로 하나 고르지 않아도 된다는 걸 처음 배운 순간이었어요.',
    context: '회사를 다니면서 글쓰기 수업을 듣기 시작한 직후. 출근길 버스에서.',
    reactions: { felt_same: 21, want_to_read: 7, stays_long: 15, myReactions: new Set() },
    createdAt: '어제',
    sentiment: 'positive',
  },
  {
    id: 'h4',
    userId: 'u4',
    userName: '오지환',
    userAvatar: '/assets/avatar-jihwan.png',
    book: BOOKS[3],
    sentence: '우리는 생존 기계다. 유전자라는 이기적인 분자를 보존하기 위해 눈멀게 프로그램된 로봇 운반자다.',
    reason: '처음엔 불쾌했어요. 내 감정과 선택이 다 유전자 때문이라니. 그런데 두 번 읽으니까 오히려 자유로워졌습니다. 내가 느끼는 질투나 불안이 "나의 결함"이 아니라 "종의 설계"라는 걸 알게 되니까요.',
    context: '연애가 끝난 직후에 서점에서 집어든 책. 혼자 술 마시다가 새벽에 읽었어요.',
    reactions: { felt_same: 6, want_to_read: 9, stays_long: 13, myReactions: new Set() },
    createdAt: '2일 전',
    sentiment: 'reserved',
  },
  {
    id: 'h5',
    userId: 'u1',
    userName: '이서연',
    userAvatar: '/assets/avatar-seoyeon.png',
    book: BOOKS[7],
    sentence: '새는 알에서 나오려고 투쟁한다. 알은 세계이다. 태어나려는 자는 하나의 세계를 깨뜨려야 한다.',
    reason: '안정적인 직장을 그만두고 싶은데 용기가 안 나던 시기에 읽었어요. "알은 세계이다"라는 말이 지금 내 회사가 곧 나의 알이라는 걸 깨닫게 했고, 깨뜨린다는 건 파괴가 아니라 탄생이라는 걸 알게 됐습니다.',
    context: '사직서를 쓸까 말까 고민하던 금요일 밤, 이불 속에서.',
    reactions: { felt_same: 15, want_to_read: 4, stays_long: 22, myReactions: new Set() },
    createdAt: '3일 전',
    sentiment: 'positive',
  },
  // ── 다른 시선 감상 6개 ──
  {
    id: 'h6',
    userId: 'u-diff1',
    userName: '윤채린',
    userAvatar: '/assets/avatar-soyul.png',
    book: BOOKS[0], // 싯다르타
    sentence: '강물은 어디서나 동시에 존재한다. 발원지에서도, 하구에서도, 폭포에서도, 여울에서도, 바다에서도, 산에서도.',
    reason: '강물 비유가 아름답다고들 하는데, 저는 현실 도피처럼 느껴졌어요. 고통 한복판에 있는 사람에게 "현재만 존재한다"는 말은 위로가 아니라 외면인 것 같아요.',
    context: '가족이 아플 때 읽었어요. 현재에 집중하라는 말이 오히려 잔인하게 느껴지던 시기.',
    reactions: { felt_same: 4, want_to_read: 1, stays_long: 7, myReactions: new Set() },
    createdAt: '1일 전',
    sentiment: 'contrary',
  },
  {
    id: 'h7',
    userId: 'u-diff2',
    userName: '임하준',
    userAvatar: '/assets/avatar-doyoon.png',
    book: BOOKS[0], // 싯다르타
    sentence: '강물은 어디서나 동시에 존재한다. 발원지에서도, 하구에서도, 폭포에서도, 여울에서도, 바다에서도, 산에서도.',
    reason: '깨달음을 얻는 과정이 너무 순탄하게 느껴졌어요. 반은 공감하고, 반은 이건 특권적 고민이라는 생각이 들었습니다.',
    context: '생활비 걱정하면서 읽었는데, 싯다르타의 방랑이 부럽기도 하고 비현실적이기도 했어요.',
    reactions: { felt_same: 3, want_to_read: 2, stays_long: 5, myReactions: new Set() },
    createdAt: '1일 전',
    sentiment: 'reserved',
  },
  {
    id: 'h8',
    userId: 'u-diff3',
    userName: '강예은',
    userAvatar: '/assets/avatar-seoyeon.png',
    book: BOOKS[2], // 모순
    sentence: '모순이 없는 삶은 없다. 다만 그 모순을 어떻게 껴안느냐가 삶의 질을 결정한다.',
    reason: '모순을 껴안으라는 메시지가 결국 현실에 순응하라는 말로 들렸어요. 모순이 아니라 부조리를 직시해야 하는 거 아닐까요.',
    context: '부당한 상황을 참고 있던 시기. "껴안으라"는 말이 체념처럼 들렸어요.',
    reactions: { felt_same: 5, want_to_read: 1, stays_long: 6, myReactions: new Set() },
    createdAt: '2일 전',
    sentiment: 'contrary',
  },
  {
    id: 'h9',
    userId: 'u-diff4',
    userName: '조민규',
    userAvatar: '/assets/avatar-jihwan.png',
    book: BOOKS[2], // 모순
    sentence: '모순이 없는 삶은 없다. 다만 그 모순을 어떻게 껴안느냐가 삶의 질을 결정한다.',
    reason: '이 문장이 좋다는 건 알겠는데, 제 상황에 대입하면 "둘 다 맞다"는 게 오히려 결정을 미루는 핑계가 될까 봐 두렵습니다.',
    context: '이직할지 말지 6개월째 고민 중이었어요. 모순을 인정하면 결정을 안 해도 될 것 같아서.',
    reactions: { felt_same: 7, want_to_read: 0, stays_long: 9, myReactions: new Set() },
    createdAt: '3일 전',
    sentiment: 'reserved',
  },
  {
    id: 'h10',
    userId: 'u-diff5',
    userName: '서지우',
    userAvatar: '/assets/avatar-soyul.png',
    book: BOOKS[3], // 이기적 유전자
    sentence: '우리는 생존 기계다. 유전자라는 이기적인 분자를 보존하기 위해 눈멀게 프로그램된 로봇 운반자다.',
    reason: '유전자가 이기적이라는 결론 자체가 인간의 이타적 행동을 너무 쉽게 환원시키는 것 같아요. 과학이 설명하지 못하는 선택도 분명 있습니다.',
    context: '봉사활동 후 읽었는데, 내 행동이 유전자의 계산이라는 설명이 납득이 안 됐어요.',
    reactions: { felt_same: 3, want_to_read: 2, stays_long: 4, myReactions: new Set() },
    createdAt: '4일 전',
    sentiment: 'contrary',
  },
  {
    id: 'h11',
    userId: 'u-diff6',
    userName: '백승민',
    userAvatar: '/assets/avatar-doyoon.png',
    book: BOOKS[3], // 이기적 유전자
    sentence: '우리는 생존 기계다. 유전자라는 이기적인 분자를 보존하기 위해 눈멀게 프로그램된 로봇 운반자다.',
    reason: '이 문장을 읽고 오히려 인간이 대단하다고 느꼈어요. 유전자의 명령을 거스르고 이타적인 선택을 할 수 있다는 게 인간만의 능력이니까요.',
    context: '뇌과학 수업을 듣고 나서 읽었더니 오히려 인간의 자유의지가 더 소중하게 느껴졌어요.',
    reactions: { felt_same: 9, want_to_read: 3, stays_long: 11, myReactions: new Set() },
    createdAt: '4일 전',
    sentiment: 'positive',
  },
];

// ── 모임 약속 기본값 ──

export const DEFAULT_PROMISES: Record<EventType, string[]> = {
  bookclub: [
    '지정 분량을 읽고 옵니다',
    '무단 불참 2회면 다음 모임 참가가 제한됩니다',
    '홍보·영업·포교 목적의 참여는 받지 않습니다',
    '다른 해석을 반박할 수 있고, 반박당할 수 있습니다',
  ],
  rotation: [
    '대화의 중심은 책입니다',
    '연락처 교환은 강요하지 않습니다',
    '홍보·영업·포교 목적의 참여는 받지 않습니다',
    '다른 해석을 반박할 수 있고, 반박당할 수 있습니다',
  ],
  gathering: [
    '주최자가 안내한 준비물을 가져옵니다',
    '무단 불참 2회면 다음 모임 참가가 제한됩니다',
    '홍보·영업·포교 목적의 참여는 받지 않습니다',
  ],
  quarterly: [
    '지정 분량을 읽고 옵니다',
    '홍보·영업·포교 목적의 참여는 받지 않습니다',
    '다른 해석을 반박할 수 있고, 반박당할 수 있습니다',
  ],
};

// ── 30초 회고 데모 데이터 ──

export const DEMO_RETROSPECTIVES: MeetingRetrospective[] = [
  {
    id: 'retro-1',
    eventId: 'ev2',
    userId: 'u1',
    bookRating: 'good',
    opinionDivergence: 'a_lot',
    returnIntent: 'yes',
    freeText: '강물 비유에서 한참 이야기가 갈렸는데, 그게 오히려 좋았어요.',
    createdAt: '2026-09-14T10:00:00Z',
  },
  {
    id: 'retro-2',
    eventId: 'ev2',
    userId: 'u3',
    bookRating: 'good',
    opinionDivergence: 'a_lot',
    returnIntent: 'yes',
    freeText: '다음엔 데미안도 같이 읽어보고 싶어요.',
    createdAt: '2026-09-14T11:30:00Z',
  },
  {
    id: 'retro-3',
    eventId: 'ev2',
    userId: 'u4',
    bookRating: 'okay',
    opinionDivergence: 'some',
    returnIntent: 'yes',
    freeText: '',
    createdAt: '2026-09-14T14:00:00Z',
  },
  {
    id: 'retro-4',
    eventId: 'ev2',
    userId: 'u2',
    bookRating: 'good',
    opinionDivergence: 'a_lot',
    returnIntent: 'undecided',
    freeText: '시간이 부족했어요. 좀 더 이야기하고 싶었습니다.',
    createdAt: '2026-09-14T15:20:00Z',
  },
];

export const DEMO_REMAINING_CARDS: RemainingSentenceCard[] = [
  {
    id: 'rc-1',
    eventId: 'ev2',
    eventTitle: '《싯다르타》 깊이 읽기 모임',
    book: BOOKS[0],
    date: '2026-09-13',
    sentences: [
      { sentence: '강물은 어디서나 동시에 존재한다. 발원지에서도, 하구에서도, 폭포에서도.', userName: '이서연' },
      { sentence: '탐구하는 사람은 목표만 보는 것이 아니라, 언제나 찾는 행위 그 자체에 빠져 있다.', userName: '박도윤' },
      { sentence: '지혜는 전달할 수 없다. 현자가 전달하려 하면 언제나 어리석음처럼 들린다.', userName: '한소율' },
    ],
    participants: ['이서연', '박도윤', '한소율', '오지환'],
    savedToLibrary: false,
    sharedToFeed: false,
  },
];

// ── 비공개 테스트용 데모 상수 ──
// 신규 계정에서도 기능이 보이도록 홈 피드가 이 데이터를 기본값으로 씁니다.

/** 회고 유도 카드의 기본 대상 모임 (실제 참가·종료 모임이 없을 때) */
export const DEMO_RETROSPECTIVE_EVENT_ID = 'ev2';

/** '같은 책, 다르게 읽었어요' 카드의 기본 상대 감상 */
export const DEMO_DIFFERENT_PERSPECTIVE: Highlight =
  MOCK_HIGHLIGHTS.find(h => h.id === 'h6')!;

/** 다른 시선 카드를 붙일 기준 책 — 《싯다르타》 밑줄 카드 다음에 삽입 */
export const DEMO_DIFFERENT_PERSPECTIVE_ISBN = BOOKS[0].isbn;

// ── 회비 · 회계 데모 데이터 ──

/** 데모 입금 계좌 — 실제 운영 시 서재지기가 직접 입력한 값으로 대체됩니다 */
export const DEMO_BANK_ACCOUNT = {
  bankName: '카카오뱅크',
  bankAccount: '3333-01-1234567',
  accountHolder: '위드북',
};

/** 모임 유형별 회비 포함 내역 */
const FEE_INCLUDES_BY_TYPE: Record<EventType, string[]> = {
  rotation: ['공간 대여료', '음료 1잔', '진행 자료'],
  bookclub: ['공간 대여료', '음료 1잔'],
  gathering: ['음료 1잔'],
  quarterly: ['공간 대여료', '음료 1잔', '다과'],
};

/** 납부 기한 — 모임 3일 전 */
function dueDateFor(eventDate: string): string {
  const d = new Date(eventDate);
  d.setDate(d.getDate() - 3);
  return d.toISOString().split('T')[0];
}

/** 모임의 회비 설정. 참가비가 없으면 null */
export function getEventFee(event: OfflineEvent): EventFee | null {
  if (event.fee <= 0) return null;
  return {
    eventId: event.id,
    amount: event.fee,
    includes: FEE_INCLUDES_BY_TYPE[event.type],
    dueDate: dueDateFor(event.date),
    bankName: DEMO_BANK_ACCOUNT.bankName,
    bankAccount: DEMO_BANK_ACCOUNT.bankAccount,
    accountHolder: DEMO_BANK_ACCOUNT.accountHolder,
    targetAmount: event.fee * event.maxParticipants,
  };
}

/**
 * 회계 화면 데모 — ev1(9월 강남 북 라운지, 15,000원) 참가자 8명.
 * 5명 완료 · 1명 확인 중 · 2명 미납(그중 한 명이 '나')으로 채워
 * 테스터가 상태 필터와 입금 확인 흐름을 바로 볼 수 있게 했습니다.
 */
export const DEMO_ACCOUNTING_EVENT_ID = 'ev1';

export const DEMO_FEE_PAYMENTS: FeePayment[] = [
  { id: 'fp1', eventId: 'ev1', userId: 'u1', userName: '이서연', userAvatar: '/assets/avatar-seoyeon.png', amount: 15000, status: 'paid', method: 'transfer', paidAt: '2026-09-05T10:20:00+09:00', reportedAt: '2026-09-05T09:58:00+09:00', confirmedBy: '나', confirmedAt: '2026-09-05T10:20:00+09:00' },
  { id: 'fp2', eventId: 'ev1', userId: 'u2', userName: '박도윤', userAvatar: '/assets/avatar-doyoon.png', amount: 15000, status: 'paid', method: 'transfer', paidAt: '2026-09-05T14:40:00+09:00', reportedAt: '2026-09-05T14:12:00+09:00', confirmedBy: '나', confirmedAt: '2026-09-05T14:40:00+09:00' },
  { id: 'fp3', eventId: 'ev1', userId: 'u3', userName: '한소율', userAvatar: '/assets/avatar-soyul.png', amount: 15000, status: 'paid', method: 'transfer', paidAt: '2026-09-06T09:05:00+09:00', reportedAt: '2026-09-06T08:47:00+09:00', confirmedBy: '나', confirmedAt: '2026-09-06T09:05:00+09:00' },
  { id: 'fp4', eventId: 'ev1', userId: 'u4', userName: '오지환', userAvatar: '/assets/avatar-jihwan.png', amount: 15000, status: 'paid', method: 'transfer', paidAt: '2026-09-06T19:30:00+09:00', reportedAt: '2026-09-06T19:11:00+09:00', confirmedBy: '나', confirmedAt: '2026-09-06T19:30:00+09:00' },
  { id: 'fp5', eventId: 'ev1', userId: 'u-diff1', userName: '윤채린', userAvatar: '/assets/avatar-soyul.png', amount: 15000, status: 'paid', method: 'transfer', paidAt: '2026-09-07T11:15:00+09:00', reportedAt: '2026-09-07T10:52:00+09:00', confirmedBy: '나', confirmedAt: '2026-09-07T11:15:00+09:00' },
  { id: 'fp6', eventId: 'ev1', userId: 'u-diff2', userName: '임하준', userAvatar: '/assets/avatar-doyoon.png', amount: 15000, status: 'pending', method: 'transfer', paidAt: null, reportedAt: '2026-09-08T08:30:00+09:00', confirmedBy: null, confirmedAt: null },
  { id: 'fp7', eventId: 'ev1', userId: 'me', userName: '나', userAvatar: '/assets/avatar-me.png', amount: 15000, status: 'unpaid', method: null, paidAt: null, reportedAt: null, confirmedBy: null, confirmedAt: null },
  { id: 'fp8', eventId: 'ev1', userId: 'u-diff3', userName: '강예은', userAvatar: '/assets/avatar-seoyeon.png', amount: 15000, status: 'unpaid', method: null, paidAt: null, reportedAt: null, confirmedBy: null, confirmedAt: null },
];

export const DEMO_EXPENSES: Expense[] = [
  { id: 'ex1', eventId: 'ev1', title: '공간 대여료 (북티크 3시간)', amount: 45000, createdAt: '2026-09-06T12:00:00+09:00' },
  { id: 'ex2', eventId: 'ev1', title: '음료 8잔', amount: 32000, createdAt: '2026-09-06T12:05:00+09:00' },
];

/** 미납 리마인드 기본 문구 — 압박하지 않는 담백한 안내 */
export const FEE_REMINDER_MESSAGE =
  '모임 회비 안내드립니다. 아직 입금이 확인되지 않았어요. 사정이 있으시면 편하게 말씀 주세요.';
