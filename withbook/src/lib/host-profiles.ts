import type { HostProfile } from './types';

// ── 주최자 소개문 생성 (템플릿 기반) ──
//
// 현재는 사전 작성된 소개문을 반환합니다.
//
// TODO [LLM 연동 지점]: 실제 서비스에서는 이 함수를 LLM API 호출로 교체합니다.
// 입력: 주최자의 밑줄 목록, 읽은 책 목록, 인생책, 좋아하는 작가
// 출력: "이 사람이 어떤 독자인지" 서술하는 3~4문장
// 제약: AI 3원칙 준수
//   ① 점수·등급·순위·퍼센트 절대 금지
//   ② 사실만 재구성 — 없는 경력·실력을 꾸며내거나 과장하지 않는다
//   ③ 밑줄은 사람이 쓴 것만 인정한다
//
export function generateHostIntro(profile: HostProfile): string {
  if (!profile.hasEnoughRecords) {
    return '아직 기록이 쌓이는 중입니다.';
  }
  return profile.intro;
}

export function getBookConnection(profile: HostProfile, bookIsbn?: string): string | null {
  if (!bookIsbn) return null;
  const bookData = profile.bookHighlights[bookIsbn];
  if (!bookData || bookData.highlightCount === 0) return null;
  return `이 책에 이미 밑줄 ${bookData.highlightCount}개를 남겼습니다`;
}

// ── 데모 주최자 프로필 (5명) ──

export const MOCK_HOST_PROFILES: Record<string, HostProfile> = {
  'u1': {
    id: 'u1',
    name: '이서연',
    avatar: '/assets/avatar-seoyeon.png',
    title: '서재지기',
    intro: '삶의 전환점에서 문학을 찾는 독자입니다. 헤르만 헤세와 한강의 문장에 자주 밑줄을 그었고, 최근 6개월간 소설과 에세이 14권을 완독했습니다. 길을 잃었을 때 다시 읽게 되는 책이 서재에 많은 사람입니다.',
    metrics: {
      highlightCount: 47,
      completedBooks: 14,
      hostedMeetings: 6,
      discussionCredits: 5,
      mentorSticks: 3,
    },
    bookHighlights: {
      '1': {
        highlightCount: 7,
        bookTitle: '싯다르타',
        featured: [
          {
            sentence: '강물은 어디서나 동시에 존재한다. 발원지에서도, 하구에서도, 폭포에서도. 강물에게는 오직 현재만이 존재할 뿐, 미래라는 그림자는 없다.',
            reason: '시간에 쫓기며 살던 때에 이 문장을 만났어요. 앞만 보고 달려온 시간이 헛되지 않았다는 위로처럼 느껴졌습니다.',
          },
        ],
      },
      '8': {
        highlightCount: 5,
        bookTitle: '데미안',
        featured: [
          {
            sentence: '새는 알에서 나오려고 투쟁한다. 알은 세계이다. 태어나려는 자는 하나의 세계를 깨뜨려야 한다.',
            reason: '안정적인 직장을 그만두고 싶은데 용기가 안 나던 시기에 읽었어요. 깨뜨린다는 건 파괴가 아니라 탄생이라는 걸 알게 됐습니다.',
          },
        ],
      },
    },
    hasEnoughRecords: true,
    introVisible: true,
  },

  'u3': {
    id: 'u3',
    name: '한소율',
    avatar: '/assets/avatar-soyul.png',
    title: '서재지기',
    intro: '삶의 모순을 다루는 한국 소설에 오래 머무는 독자입니다. 양귀자\u00B7김애란의 문장에 자주 밑줄을 그었고, 최근 6개월간 소설 11권을 완독했습니다. 글쓰기와 독서를 함께 이어가고 있습니다.',
    metrics: {
      highlightCount: 38,
      completedBooks: 11,
      hostedMeetings: 4,
      discussionCredits: 4,
      mentorSticks: 2,
    },
    bookHighlights: {
      '3': {
        highlightCount: 5,
        bookTitle: '모순',
        featured: [
          {
            sentence: '모순이 없는 삶은 없다. 다만 그 모순을 어떻게 껴안느냐가 삶의 질을 결정한다.',
            reason: '좋아하는 일과 돈 버는 일 사이에서 계속 갈등하던 때였어요. 이 문장이 "둘 다 맞다"고 말해주는 것 같았습니다.',
          },
        ],
      },
    },
    hasEnoughRecords: true,
    introVisible: true,
  },

  'u4': {
    id: 'u4',
    name: '오지환',
    avatar: '/assets/avatar-jihwan.png',
    title: '서재지기',
    intro: '과학 교양서에서 인간을 이해하려는 독자입니다. 리처드 도킨스와 칼 세이건의 문장에 밑줄을 그으며 읽었고, 최근 6개월간 과학\u00B7SF 9권을 완독했습니다. 불쾌하더라도 사실에 밑줄을 긋는 스타일입니다.',
    metrics: {
      highlightCount: 32,
      completedBooks: 9,
      hostedMeetings: 2,
      discussionCredits: 3,
      mentorSticks: 1,
    },
    bookHighlights: {
      '4': {
        highlightCount: 6,
        bookTitle: '이기적 유전자',
        featured: [
          {
            sentence: '우리는 생존 기계다. 유전자라는 이기적인 분자를 보존하기 위해 눈멀게 프로그램된 로봇 운반자다.',
            reason: '처음엔 불쾌했어요. 그런데 두 번 읽으니까 오히려 자유로워졌습니다. 내가 느끼는 감정이 나의 결함이 아니라 종의 설계라는 걸 알게 되니까요.',
          },
        ],
      },
      '9': {
        highlightCount: 4,
        bookTitle: '코스모스',
        featured: [
          {
            sentence: '우리는 별의 먼지로 만들어진 존재다. 우주가 스스로를 인식하는 방법, 그것이 바로 우리다.',
            reason: '과학책인데 시적이라는 게 칼 세이건의 매력이에요. 이 문장 앞에서 과학과 철학의 경계가 사라졌습니다.',
          },
        ],
      },
    },
    hasEnoughRecords: true,
    introVisible: true,
  },

  'u-rec1': {
    id: 'u-rec1',
    name: '김하늘',
    avatar: '/assets/avatar-seoyeon.png',
    title: '서재지기',
    intro: '철학과 심리학 사이에서 삶의 질문을 따라가는 독자입니다. 기시미 이치로와 알랭 드 보통의 책에 밑줄이 많고, 최근 6개월간 인문\u00B7자기계발 12권을 완독했습니다. 매달 발제를 직접 준비하는 서재지기입니다.',
    metrics: {
      highlightCount: 42,
      completedBooks: 12,
      hostedMeetings: 5,
      discussionCredits: 6,
      mentorSticks: 4,
    },
    bookHighlights: {
      '6': {
        highlightCount: 8,
        bookTitle: '미움받을 용기',
        featured: [
          {
            sentence: '과거에 어떤 일이 있었든, 그것이 미래를 결정하지는 않는다.',
            reason: '커리어를 바꾸려고 고민하던 시기에 읽었어요. 과거의 선택이 나를 가두지 않는다는 걸 이 문장이 알려줬습니다.',
          },
          {
            sentence: '모든 고민은 대인관계의 고민이다.',
            reason: '처음엔 과장이라고 생각했는데, 내 불안을 하나씩 뜯어보니 전부 누군가의 시선과 연결돼 있었어요.',
          },
        ],
      },
    },
    hasEnoughRecords: true,
    introVisible: true,
  },

  'u-rec2': {
    id: 'u-rec2',
    name: '정우진',
    avatar: '/assets/avatar-jihwan.png',
    title: '서재지기',
    intro: '우주와 생명의 원리를 책에서 따라가는 독자입니다. 칼 세이건과 리처드 파인만의 글에 밑줄이 많고, 최근 6개월간 과학 교양서 10권을 완독했습니다. 비전공자도 함께 읽을 수 있는 자리를 만들려 합니다.',
    metrics: {
      highlightCount: 35,
      completedBooks: 10,
      hostedMeetings: 3,
      discussionCredits: 2,
      mentorSticks: 1,
    },
    bookHighlights: {
      '9': {
        highlightCount: 9,
        bookTitle: '코스모스',
        featured: [
          {
            sentence: '우리 모두는 별의 물질로 이루어져 있다. 우리는 우주가 스스로를 알아가는 한 방법이다.',
            reason: '과학이 이렇게 시적일 수 있다는 걸 이 책에서 처음 알았어요. 밤하늘을 올려다보는 시선이 달라졌습니다.',
          },
        ],
      },
    },
    hasEnoughRecords: true,
    introVisible: true,
  },
};
