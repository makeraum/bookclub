const KOREAN_COUNTS = ['한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];

export function toKoreanCount(n: number): string {
  if (n >= 1 && n <= 10) return KOREAN_COUNTS[n - 1];
  return String(n);
}
