import type { HighlightSentiment } from './types';

const CONTRARY_KEYWORDS = [
  '불쾌', '동의하지', '반대', '아니라고', '불편', '의문',
  '틀렸다고', '반박', '저항감', '도피', '외면', '순응',
  '환원', '부조리',
];

const RESERVED_KEYWORDS = [
  '모르겠', '갈등', '복잡', '양면', '아직은', '확신이 없',
  '유보', '반은 맞고', '반은 공감', '두렵', '미루는',
];

const POSITIVE_KEYWORDS = [
  '위로', '감동', '공감', '깨달', '좋았', '울었',
  '자유로', '변화', '인정', '배웠', '대단', '허락',
  '탄생',
];

/**
 * 키워드 규칙 기반 감성 분류.
 * contrary > reserved > positive 우선순위로 판정한다.
 */
export function analyzeSentiment(reason: string): HighlightSentiment {
  const text = reason.toLowerCase();

  if (CONTRARY_KEYWORDS.some(kw => text.includes(kw))) return 'contrary';
  if (RESERVED_KEYWORDS.some(kw => text.includes(kw))) return 'reserved';
  if (POSITIVE_KEYWORDS.some(kw => text.includes(kw))) return 'positive';

  return 'positive'; // 기본값
}

// TODO: LLM 연동 시 이 함수를 API 호출로 교체
// async function analyzeSentimentWithLLM(reason: string): Promise<HighlightSentiment> {
//   const response = await fetch('/api/analyze-sentiment', {
//     method: 'POST',
//     body: JSON.stringify({ reason }),
//   });
//   const data = await response.json();
//   return data.sentiment;
// }
