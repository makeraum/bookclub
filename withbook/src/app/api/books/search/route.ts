import { NextRequest, NextResponse } from 'next/server';

interface AladinItem {
  title: string;
  author: string;
  isbn13: string;
  cover: string;
  publisher: string;
}

function mapItems(items: AladinItem[]) {
  return items.map((item) => ({
    isbn: item.isbn13,
    title: item.title,
    author: item.author.replace(/\s*\(지은이\)|\s*\(옮긴이\)|\s*\(그림\)|\s*\(원작\)/g, ''),
    coverUrl: item.cover,
    publisher: item.publisher,
  }));
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query');
  const type = request.nextUrl.searchParams.get('type'); // 'bestseller' or null

  const ttbKey = process.env.ALADIN_TTB_KEY;
  if (!ttbKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  let url: string;

  if (type === 'bestseller') {
    const params = new URLSearchParams({
      TTBKey: ttbKey,
      QueryType: 'Bestseller',
      SearchTarget: 'Book',
      MaxResults: '10',
      start: '1',
      output: 'js',
      Version: '20131101',
      Cover: 'Big',
    });
    url = `https://www.aladin.co.kr/ttb/api/ItemList.aspx?${params}`;
  } else if (type === 'author') {
    if (!query || !query.trim()) {
      return NextResponse.json([]);
    }
    const params = new URLSearchParams({
      TTBKey: ttbKey,
      Query: query,
      QueryType: 'Author',
      SearchTarget: 'Book',
      MaxResults: '20',
      output: 'js',
      Version: '20131101',
    });
    url = `https://www.aladin.co.kr/ttb/api/ItemSearch.aspx?${params}`;
  } else {
    if (!query || !query.trim()) {
      return NextResponse.json([]);
    }
    const params = new URLSearchParams({
      TTBKey: ttbKey,
      Query: query,
      QueryType: 'Title',
      SearchTarget: 'Book',
      MaxResults: '10',
      output: 'js',
      Version: '20131101',
      Cover: 'Big',
    });
    url = `https://www.aladin.co.kr/ttb/api/ItemSearch.aspx?${params}`;
  }

  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.error('[Aladin API] status:', res.status, res.statusText);
      return NextResponse.json({ error: 'Aladin API error' }, { status: 502 });
    }

    // 알라딘 API는 Content-Type을 잘못 보내는 경우가 있어 텍스트로 받아 파싱
    const text = await res.text();
    const data = JSON.parse(text);
    const items: AladinItem[] = data.item ?? [];

    // 저자 검색: 저자 이름만 추출하여 중복 제거 후 반환
    if (type === 'author') {
      const cleanAuthor = (raw: string) =>
        raw.replace(/\s*\(지은이\)|\s*\(옮긴이\)|\s*\(그림\)|\s*\(원작\)|\s*\(엮은이\)|\s*\(해설\)/g, '');
      const seen = new Set<string>();
      const authors: string[] = [];
      for (const item of items) {
        // 여러 저자가 쉼표로 구분됨
        const parts = item.author.split(',').map(s => cleanAuthor(s.trim())).filter(Boolean);
        for (const name of parts) {
          if (!seen.has(name)) {
            seen.add(name);
            authors.push(name);
          }
        }
      }
      return NextResponse.json(authors);
    }

    return NextResponse.json(mapItems(items));
  } catch (err) {
    console.error('[Aladin API] fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch from Aladin' }, { status: 502 });
  }
}
