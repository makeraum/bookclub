import { Book, Post, StoryUser, SameBookGroup, UserStory, BookClub, EventType, Region, OfflineEvent, ChatMessage, BookTopic, Highlight, HighlightReactionType, CityCommunity, Seojae, HighlightPair, Chaekbang } from './types';

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
    nextMeetingDate: '7월 13일 (일)',
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
    nextMeetingDate: '7월 15일 (화)',
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
    nextMeetingDate: '7월 12일 (토)',
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
    nextMeetingDate: '7월 19일 (토)',
    nextMeetingTime: '오후 7:00',
    members: [
      { id: 'u4', name: '오지환', avatarUrl: '/assets/avatar-jihwan.png' },
    ],
  },
];

export const PLACEHOLDER_COLORS = ['#C96A22', '#4F6D5A', '#B0522F', '#8A6D46', '#6E5849', '#D9C08A'];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  rotation: '로테이션 소개팅',
  bookclub: '독서모임',
  gathering: '소모임',
  quarterly: '책방 분기모임',
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  rotation: '#FF6B6B',
  bookclub: '#0066cc',
  gathering: '#34C759',
  quarterly: '#9B59B6',
};

export const REGIONS: Region[] = ['천안', '대전', '세종', '청주'];

export const MOCK_OFFLINE_EVENTS: OfflineEvent[] = [
  {
    id: 'ev1',
    type: 'rotation',
    title: '7월 대전 로테이션 소개팅',
    description: '책을 매개로 새로운 사람을 만나는 로테이션 소개팅! 참가자들이 각자 좋아하는 책 한 권을 가져와 돌아가며 소개하고, 짧은 대화를 나눕니다. 편안한 분위기에서 독서 취향이 맞는 사람을 만나보세요.',
    date: '2025-07-12',
    time: '오후 3:00',
    region: '대전',
    venue: '대전 유성구 카페 북앤톡',
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
    date: '2025-07-13',
    time: '오후 2:00',
    region: '천안',
    venue: '천안 서북구 독립서점 책방길',
    maxParticipants: 8,
    currentParticipants: 8,
    fee: 5000,
    book: BOOKS[0],
    host: '이서연',
  },
  {
    id: 'ev3',
    type: 'gathering',
    title: 'SF 덕후 번개모임',
    description: '과학 소설을 사랑하는 사람들의 자유로운 번개모임입니다. 최근 읽은 SF 소설에 대해 이야기하고, 서로 추천작을 공유해요. 부담 없이 오세요!',
    date: '2025-07-19',
    time: '오후 5:00',
    region: '세종',
    venue: '세종시 보람동 커뮤니티카페 모여',
    maxParticipants: 15,
    currentParticipants: 6,
    fee: 0,
    host: '박도윤',
  },
  {
    id: 'ev4',
    type: 'rotation',
    title: '7월 청주 로테이션 소개팅',
    description: '청주에서 열리는 두 번째 로테이션 소개팅! 책을 매개로 자연스럽게 대화를 나누며 새로운 인연을 만들어보세요. 음료와 간단한 다과가 제공됩니다.',
    date: '2025-07-20',
    time: '오후 2:00',
    region: '청주',
    venue: '청주 상당구 라운지 리딩룸',
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
    date: '2025-07-26',
    time: '오후 3:00',
    region: '대전',
    venue: '대전 중구 북카페 사이',
    maxParticipants: 10,
    currentParticipants: 5,
    fee: 5000,
    book: BOOKS[2],
    host: '한소율',
  },
  {
    id: 'ev6',
    type: 'gathering',
    title: '에세이 좋아하는 사람 모여라',
    description: '에세이를 즐겨 읽는 사람들의 가벼운 모임입니다. 각자 좋아하는 에세이 한 권을 가져와서 소개하고, 좋아하는 구절을 낭독해요. 따뜻한 대화가 기다리고 있습니다.',
    date: '2025-07-27',
    time: '오후 4:00',
    region: '천안',
    venue: '천안 동남구 카페 오후의 서재',
    maxParticipants: 12,
    currentParticipants: 9,
    fee: 3000,
    host: '오지환',
  },
  {
    id: 'ev7',
    type: 'quarterly',
    title: '대전 인문 책방 분기모임',
    description: '대전 인문 책방 소속 서재들이 한자리에 모이는 분기 모임입니다. 각 서재에서 이번 분기에 읽은 책을 소개하고, 인상 깊었던 밑줄을 공유합니다.',
    date: '2025-09-20',
    time: '오후 2:00',
    region: '대전',
    venue: '대전 유성구 북카페 사이',
    maxParticipants: 40,
    currentParticipants: 18,
    fee: 5000,
    host: '대전 인문 책방',
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
    { id: 'e1m1', roomId: 'ev1', senderId: 'u2', senderName: '박도윤', senderAvatar: '/assets/avatar-doyoon.png', type: 'message', text: '대전 로테이션 참가하시는 분들 어떤 책 가져오시나요?', createdAt: '오후 1:00' },
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
    { id: 'e7m1', roomId: 'ev7', senderId: 'u1', senderName: '이서연', senderAvatar: '/assets/avatar-seoyeon.png', type: 'message', text: '분기모임 때 각 서재에서 이번에 읽은 책 발표 준비해 오시나요?', createdAt: '오후 3:00' },
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
  { id: 'city-daejeon', region: '대전', name: '대전 위드북', description: '대전 독서 커뮤니티', maxMembers: 150, memberCount: 87 },
  { id: 'city-cheonan', region: '천안', name: '천안 위드북', description: '천안 독서 커뮤니티', maxMembers: 150, memberCount: 62 },
  { id: 'city-sejong', region: '세종', name: '세종 위드북', description: '세종 독서 커뮤니티', maxMembers: 150, memberCount: 45 },
  { id: 'city-cheongju', region: '청주', name: '청주 위드북', description: '청주 독서 커뮤니티', maxMembers: 150, memberCount: 53 },
];

export const MOCK_SEOJAE: Seojae[] = [
  {
    id: 'sj1',
    communityId: 'city-daejeon',
    name: '헤세를 좋아하는 서재',
    description: '헤르만 헤세의 작품을 함께 읽고 이야기 나누는 서재입니다. 매달 한 권씩 헤세 작품을 선정해 읽어요.',
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
    communityId: 'city-daejeon',
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
    communityId: 'city-cheonan',
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
    periodStart: '2025-06-20',
    isActive: true,
  },
];

export const MOCK_CHAEKBANG: Chaekbang[] = [
  {
    id: 'cb1',
    communityId: 'city-daejeon',
    name: '대전 인문 책방',
    description: '대전의 인문학 서재들이 모인 책방입니다.',
    quarterlyMeetingInfo: '9월 셋째 주 토요일 대전 유성구 북카페',
    seojaeIds: ['sj1', 'sj2'],
    seojaeCount: 2,
  },
];

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
  },
];
