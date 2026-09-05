import { supabase } from './supabase';
import type { Book, Post, UserProfile, ChatMessage, ChatMember, Highlight, HighlightReactionType, UserGates, HighlightStats, Seojae, HighlightPair, CityCommunity, OnboardingAnswers, ShellMetrics, LibrarianInvitation } from './types';
import { POLICY_VERSIONS, type ConsentDraft, type ConsentRecord, type ConsentType } from './consent';
import type { PaymentMethod as PaymentMethodType } from './payment';
import type { FeeAccount as FeeAccountRow } from './types';

// ── Auth ──

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ── Profile ──

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!user) return null;

  const { data: books } = await supabase
    .from('user_books')
    .select('*')
    .eq('user_id', userId)
    .order('slot_order');

  const favoriteBooks: (Book | null)[] = [null, null, null];
  (books || []).forEach((b: { isbn: string; title: string; author: string; cover_url: string; slot_order: number }) => {
    if (b.slot_order >= 0 && b.slot_order <= 2) {
      favoriteBooks[b.slot_order] = {
        isbn: b.isbn,
        title: b.title,
        author: b.author,
        coverUrl: b.cover_url,
      };
    }
  });

  return {
    id: user.id,
    name: user.name || '',
    avatarUrl: user.avatar_url || '/assets/avatar-me.png',
    quote: user.quote || '',
    favoriteAuthors: user.favorite_authors || [],
    genres: user.genres || [],
    readingBadges: user.reading_badges || [],
    favoriteBooks,
  };
}

export async function saveProfile(userId: string, profile: Partial<UserProfile>) {
  // Update users table
  const { error: userErr } = await supabase
    .from('users')
    .update({
      name: profile.name,
      quote: profile.quote,
      favorite_authors: profile.favoriteAuthors,
      genres: profile.genres,
      reading_badges: profile.readingBadges,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (userErr) throw userErr;

  // Update user_books — delete then re-insert
  if (profile.favoriteBooks) {
    await supabase.from('user_books').delete().eq('user_id', userId);

    const booksToInsert = profile.favoriteBooks
      .map((book, i) => book ? {
        user_id: userId,
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        cover_url: book.coverUrl,
        slot_order: i,
      } : null)
      .filter((b): b is NonNullable<typeof b> => b !== null);

    if (booksToInsert.length > 0) {
      const { error: bookErr } = await supabase.from('user_books').insert(booksToInsert);
      if (bookErr) throw bookErr;
    }
  }
}

// ── Posts ──

export async function fetchPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      users:user_id ( name, avatar_url ),
      like_count:likes ( count )
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  const { data: { session } } = await supabase.auth.getSession();
  const myId = session?.user?.id;

  let myLikedPostIds = new Set<string>();
  if (myId) {
    const { data: myLikes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', myId);
    myLikedPostIds = new Set((myLikes || []).map((l: { post_id: string }) => l.post_id));
  }

  return (data || []).map((p: Record<string, unknown>) => {
    const users = p.users as { name: string; avatar_url: string } | null;
    const likeArr = p.like_count as { count: number }[] | null;
    return {
      id: p.id as string,
      userId: p.user_id as string,
      userName: users?.name || '익명',
      userAvatar: users?.avatar_url || '/assets/avatar-me.png',
      book: {
        isbn: p.book_isbn as string,
        title: p.book_title as string,
        author: p.book_author as string,
        coverUrl: (p.book_cover_url as string) || '',
      },
      quote: p.quote as string,
      comment: (p.comment as string) || '',
      likes: likeArr?.[0]?.count ?? 0,
      liked: myLikedPostIds.has(p.id as string),
      createdAt: formatTimeAgo(p.created_at as string),
      isReal: true,
    };
  });
}

export async function createPost(userId: string, book: Book, quote: string, comment: string) {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      book_isbn: book.isbn,
      book_title: book.title,
      book_author: book.author,
      book_cover_url: book.coverUrl,
      quote,
      comment,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Likes ──

export async function addLike(userId: string, postId: string) {
  await supabase.from('likes').upsert({ user_id: userId, post_id: postId });
}

export async function removeLike(userId: string, postId: string) {
  await supabase.from('likes').delete().eq('user_id', userId).eq('post_id', postId);
}

// ── Match Waitlist ──

export async function checkWaitlist(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('match_waitlist')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  return !!data;
}

export async function joinWaitlist(userId: string) {
  const { error } = await supabase
    .from('match_waitlist')
    .upsert({ user_id: userId });
  if (error) throw error;
}

export async function getWaitlistCount(): Promise<number> {
  const { count } = await supabase
    .from('match_waitlist')
    .select('*', { count: 'exact', head: true });
  return count || 0;
}

// ── Chat Rooms ──

// 프로필 이름이 아직 없는 계정을 가리키는 표시.
// '알 수 없음'은 오류처럼 읽혀서 채팅 경로에서는 쓰지 않습니다.
export const UNNAMED_READER = '독자';

// 방 이름의 출처는 DB가 우선입니다. 멤버가 아니면 RLS로 0행이 오므로 maybeSingle을 씁니다.
export async function fetchChatRoom(
  roomId: string
): Promise<{ id: string; name: string; type: string } | null> {
  const { data, error } = await supabase
    .from('chat_rooms')
    .select('id, name, type')
    .eq('id', roomId)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export async function ensureChatRoom(roomId: string, name: string, type: 'club' | 'event' | 'seojae' | 'highlight_pair') {
  const { error } = await supabase
    .from('chat_rooms')
    .upsert({ id: roomId, name, type }, { onConflict: 'id' });
  if (error) throw error;
}

export async function joinChatRoom(roomId: string, userId: string, userName: string) {
  const { error } = await supabase
    .from('chat_members')
    .upsert({ room_id: roomId, user_id: userId }, { onConflict: 'room_id,user_id' });
  if (error) throw error;

  // 시스템 메시지: 입장
  await supabase.from('chat_messages').insert({
    room_id: roomId,
    sender_id: userId,
    type: 'system',
    text: `${userName}님이 입장했습니다.`,
  });
}

export async function leaveChatRoom(roomId: string, userId: string, userName: string) {
  // 시스템 메시지: 퇴장 (멤버 삭제 전에 전송 — RLS 통과)
  await supabase.from('chat_messages').insert({
    room_id: roomId,
    sender_id: userId,
    type: 'system',
    text: `${userName}님이 퇴장했습니다.`,
  });

  const { error } = await supabase
    .from('chat_members')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function fetchMyChatRooms(userId: string) {
  const { data, error } = await supabase
    .from('chat_members')
    .select('room_id, chat_rooms!inner(id, name, type)')
    .eq('user_id', userId);

  if (error) throw error;

  return (data || []).map((row: Record<string, unknown>) => {
    const room = row.chat_rooms as { id: string; name: string; type: string };
    return {
      id: room.id,
      name: room.name,
      type: room.type as 'club' | 'event',
    };
  });
}

export async function fetchChatMessages(roomId: string, limit = 100): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, room_id, sender_id, type, text, created_at, users:sender_id(name, avatar_url)')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;

  const { data: { session } } = await supabase.auth.getSession();
  const myId = session?.user?.id;

  return (data || []).map((m: Record<string, unknown>) => {
    const user = m.users as { name: string; avatar_url: string } | null;
    return {
      id: m.id as string,
      roomId: m.room_id as string,
      senderId: (m.sender_id as string) || '',
      senderName: user?.name?.trim() || UNNAMED_READER,
      senderAvatar: user?.avatar_url || '/assets/avatar-me.png',
      type: m.type as 'message' | 'system',
      text: m.text as string,
      createdAt: formatChatTime(m.created_at as string),
      isMe: m.sender_id === myId && m.type === 'message',
    };
  });
}

export async function sendChatMessage(roomId: string, senderId: string, text: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      room_id: roomId,
      sender_id: senderId,
      type: 'message',
      text,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchChatMembers(roomId: string): Promise<ChatMember[]> {
  const { data, error } = await supabase
    .from('chat_members')
    .select('room_id, user_id, joined_at, users:user_id(name, avatar_url)')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true });

  if (error) throw error;

  return (data || []).map((row: Record<string, unknown>) => {
    const user = row.users as { name: string; avatar_url: string } | null;
    return {
      roomId: row.room_id as string,
      userId: row.user_id as string,
      userName: user?.name?.trim() || UNNAMED_READER,
      userAvatar: user?.avatar_url || '/assets/avatar-me.png',
      joinedAt: row.joined_at as string,
    };
  });
}

export async function fetchRoomMemberCount(roomId: string): Promise<number> {
  const { count, error } = await supabase
    .from('chat_members')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', roomId);

  if (error) throw error;
  return count || 0;
}

export function formatChatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const time = date.toLocaleTimeString('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) return time;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `어제 ${time}`;

  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) + ` ${time}`;
}

// ── Highlights (밑줄) ──

export async function createHighlight(
  userId: string,
  book: Book,
  sentence: string,
  reason: string,
  context: string,
) {
  const { data, error } = await supabase
    .from('highlights')
    .insert({
      user_id: userId,
      book_isbn: book.isbn,
      book_title: book.title,
      book_author: book.author,
      book_cover_url: book.coverUrl,
      sentence,
      reason,
      context,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchHighlights(): Promise<Highlight[]> {
  const { data, error } = await supabase
    .from('highlights')
    .select(`
      *,
      users:user_id ( name, avatar_url )
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  const { data: { session } } = await supabase.auth.getSession();
  const myId = session?.user?.id;

  // 모든 반응을 한 번에 가져오기
  const highlightIds = (data || []).map((h: Record<string, unknown>) => h.id as string);
  const { data: allReactions } = await supabase
    .from('highlight_reactions')
    .select('highlight_id, reaction_type, user_id')
    .in('highlight_id', highlightIds);

  // highlight_id별로 반응 집계
  const reactionMap = new Map<string, { felt_same: number; want_to_read: number; stays_long: number; myReactions: Set<HighlightReactionType> }>();
  for (const r of (allReactions || [])) {
    const hId = r.highlight_id as string;
    if (!reactionMap.has(hId)) {
      reactionMap.set(hId, { felt_same: 0, want_to_read: 0, stays_long: 0, myReactions: new Set() });
    }
    const entry = reactionMap.get(hId)!;
    const rType = r.reaction_type as HighlightReactionType;
    entry[rType]++;
    if (r.user_id === myId) {
      entry.myReactions.add(rType);
    }
  }

  return (data || []).map((h: Record<string, unknown>) => {
    const users = h.users as { name: string; avatar_url: string } | null;
    const hId = h.id as string;
    const reactions = reactionMap.get(hId) || { felt_same: 0, want_to_read: 0, stays_long: 0, myReactions: new Set<HighlightReactionType>() };
    return {
      id: hId,
      userId: h.user_id as string,
      userName: users?.name || '익명',
      userAvatar: users?.avatar_url || '/assets/avatar-me.png',
      book: {
        isbn: h.book_isbn as string,
        title: h.book_title as string,
        author: h.book_author as string,
        coverUrl: (h.book_cover_url as string) || '',
      },
      sentence: h.sentence as string,
      reason: (h.reason as string) || '',
      context: (h.context as string) || '',
      reactions,
      createdAt: formatTimeAgo(h.created_at as string),
    };
  });
}

export async function addHighlightReaction(userId: string, highlightId: string, reactionType: HighlightReactionType) {
  await supabase.from('highlight_reactions').upsert({
    user_id: userId,
    highlight_id: highlightId,
    reaction_type: reactionType,
  });
}

export async function removeHighlightReaction(userId: string, highlightId: string, reactionType: HighlightReactionType) {
  await supabase
    .from('highlight_reactions')
    .delete()
    .eq('user_id', userId)
    .eq('highlight_id', highlightId)
    .eq('reaction_type', reactionType);
}

// ── Gates (게이트) ──

export async function fetchUserGates(userId: string): Promise<UserGates> {
  const { data } = await supabase
    .from('user_gates')
    .select('gate_0_at, gate_1_at, gate_2_at')
    .eq('user_id', userId)
    .maybeSingle();

  return {
    gate0At: data?.gate_0_at || null,
    gate1At: data?.gate_1_at || null,
    gate2At: data?.gate_2_at || null,
  };
}

export async function passGate(userId: string, gate: 'gate_0' | 'gate_1' | 'gate_2') {
  const column = `${gate}_at`;
  // upsert: 없으면 삽입, 있으면 업데이트
  const { error } = await supabase
    .from('user_gates')
    .upsert(
      { user_id: userId, [column]: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  if (error) throw error;
}

export async function fetchHighlightStats(userId: string): Promise<HighlightStats> {
  const { data, error } = await supabase
    .from('user_highlight_stats')
    .select('total_count, book_count')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    // 뷰가 없거나 데이터 없을 경우 로컬 폴백
    return { totalCount: 0, bookCount: 0 };
  }

  return {
    totalCount: data?.total_count || 0,
    bookCount: data?.book_count || 0,
  };
}

// ── 던바 구조 (서재 / 밑줄 짝 / 도시 커뮤니티) ──

export async function fetchAllSeojae(communityId: string): Promise<Seojae[]> {
  const { data, error } = await supabase
    .from('seojae')
    .select(`
      *,
      owner:owner_id ( name, avatar_url ),
      seojae_members ( user_id, role, joined_at, users:user_id ( name, avatar_url ) )
    `)
    .eq('community_id', communityId)
    .eq('is_active', true);

  if (error) throw error;

  return (data || []).map((s: Record<string, unknown>) => {
    const owner = s.owner as { name: string; avatar_url: string } | null;
    const members = (s.seojae_members as Record<string, unknown>[]) || [];
    return {
      id: s.id as string,
      communityId: s.community_id as string,
      name: s.name as string,
      description: (s.description as string) || '',
      ownerId: s.owner_id as string,
      ownerName: owner?.name || '',
      ownerAvatar: owner?.avatar_url || '/assets/avatar-me.png',
      chatRoomId: (s.chat_room_id as string) || null,
      maxMembers: (s.max_members as number) || 15,
      memberCount: members.length,
      members: members.map((m: Record<string, unknown>) => {
        const u = m.users as { name: string; avatar_url: string } | null;
        return {
          userId: m.user_id as string,
          userName: u?.name || '',
          userAvatar: u?.avatar_url || '/assets/avatar-me.png',
          role: m.role as 'member' | 'owner',
          joinedAt: m.joined_at as string,
        };
      }),
      monthlyOfflineDay: (s.monthly_offline_day as string) || '',
      isActive: s.is_active as boolean,
    };
  });
}

export async function fetchMySeojae(userId: string): Promise<Seojae[]> {
  const { data, error } = await supabase
    .from('seojae_members')
    .select('seojae_id')
    .eq('user_id', userId);

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const seojaeIds = data.map((r: { seojae_id: string }) => r.seojae_id);
  const { data: seojaeData, error: sErr } = await supabase
    .from('seojae')
    .select(`
      *,
      owner:owner_id ( name, avatar_url ),
      seojae_members ( user_id, role, joined_at, users:user_id ( name, avatar_url ) )
    `)
    .in('id', seojaeIds)
    .eq('is_active', true);

  if (sErr) throw sErr;

  return (seojaeData || []).map((s: Record<string, unknown>) => {
    const owner = s.owner as { name: string; avatar_url: string } | null;
    const members = (s.seojae_members as Record<string, unknown>[]) || [];
    return {
      id: s.id as string,
      communityId: s.community_id as string,
      name: s.name as string,
      description: (s.description as string) || '',
      ownerId: s.owner_id as string,
      ownerName: owner?.name || '',
      ownerAvatar: owner?.avatar_url || '/assets/avatar-me.png',
      chatRoomId: (s.chat_room_id as string) || null,
      maxMembers: (s.max_members as number) || 15,
      memberCount: members.length,
      members: members.map((m: Record<string, unknown>) => {
        const u = m.users as { name: string; avatar_url: string } | null;
        return {
          userId: m.user_id as string,
          userName: u?.name || '',
          userAvatar: u?.avatar_url || '/assets/avatar-me.png',
          role: m.role as 'member' | 'owner',
          joinedAt: m.joined_at as string,
        };
      }),
      monthlyOfflineDay: (s.monthly_offline_day as string) || '',
      isActive: s.is_active as boolean,
    };
  });
}

export async function joinSeojae(seojaeId: string, userId: string) {
  // 정원 확인
  const { count } = await supabase
    .from('seojae_members')
    .select('*', { count: 'exact', head: true })
    .eq('seojae_id', seojaeId);

  const { data: seojae } = await supabase
    .from('seojae')
    .select('max_members')
    .eq('id', seojaeId)
    .single();

  if (seojae && count !== null && count >= (seojae.max_members || 15)) {
    throw new Error('정원이 초과되었습니다.');
  }

  const { error } = await supabase
    .from('seojae_members')
    .upsert({ seojae_id: seojaeId, user_id: userId, role: 'member' }, { onConflict: 'seojae_id,user_id' });
  if (error) throw error;
}

export async function leaveSeojae(seojaeId: string, userId: string) {
  const { error } = await supabase
    .from('seojae_members')
    .delete()
    .eq('seojae_id', seojaeId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function fetchMyPairs(userId: string): Promise<HighlightPair[]> {
  const { data, error } = await supabase
    .from('highlight_pairs')
    .select('*')
    .eq('is_active', true)
    .or(`user_a.eq.${userId},user_b.eq.${userId}`);

  if (error) throw error;

  const pairs: HighlightPair[] = [];
  for (const p of (data || [])) {
    const partnerId = p.user_a === userId ? p.user_b : p.user_a;
    const { data: partner } = await supabase
      .from('users')
      .select('name, avatar_url')
      .eq('id', partnerId)
      .single();

    pairs.push({
      id: p.id,
      seojaeId: p.seojae_id,
      partnerUserId: partnerId,
      partnerName: partner?.name || '알 수 없음',
      partnerAvatar: partner?.avatar_url || '/assets/avatar-me.png',
      book: { isbn: p.book_isbn, title: p.book_title, author: '', coverUrl: '' },
      chatRoomId: p.chat_room_id || null,
      streakCount: p.streak_count || 0,
      lastInteractionDate: p.last_interaction_date || null,
      periodStart: p.period_start,
      isActive: p.is_active,
    });
  }
  return pairs;
}

export async function reactToPairHighlight(pairId: string, reactorId: string, highlightId: string) {
  const { error } = await supabase
    .from('pair_daily_reactions')
    .upsert({
      pair_id: pairId,
      reactor_id: reactorId,
      highlight_id: highlightId,
      reacted_date: new Date().toISOString().split('T')[0],
    }, { onConflict: 'pair_id,reactor_id,reacted_date' });
  if (error) throw error;
}

export async function checkTodayReacted(pairId: string, userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('pair_daily_reactions')
    .select('id')
    .eq('pair_id', pairId)
    .eq('reactor_id', userId)
    .eq('reacted_date', today)
    .maybeSingle();
  return !!data;
}

export async function fetchCityCommunity(region: string): Promise<CityCommunity | null> {
  const { data } = await supabase
    .from('city_communities')
    .select('*')
    .eq('region', region)
    .single();

  if (!data) return null;

  const { count } = await supabase
    .from('city_community_members')
    .select('*', { count: 'exact', head: true })
    .eq('community_id', data.id);

  return {
    id: data.id,
    region: data.region,
    name: data.name,
    description: data.description || '',
    maxMembers: data.max_members || 150,
    memberCount: count || 0,
  };
}

// ── 온보딩 답변 ──

export async function saveOnboardingAnswers(userId: string, answers: OnboardingAnswers) {
  const { error } = await supabase
    .from('onboarding_answers')
    .upsert({
      user_id: userId,
      q1_answer: answers.q1,
      q2_answer: answers.q2,
      q3_answer: answers.q3,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function fetchOnboardingAnswers(userId: string): Promise<OnboardingAnswers | null> {
  const { data } = await supabase
    .from('onboarding_answers')
    .select('q1_answer, q2_answer, q3_answer')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) return null;
  return { q1: data.q1_answer, q2: data.q2_answer, q3: data.q3_answer };
}

// ── 조개 지표 ──

export async function fetchShellMetrics(userId: string): Promise<ShellMetrics> {
  const [followsRes, creditsRes, mentorRes, seasonRes] = await Promise.all([
    supabase
      .from('reading_follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', userId),
    supabase
      .from('discussion_credits')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', userId),
    supabase
      .from('mentor_links')
      .select('id', { count: 'exact', head: true })
      .eq('mentor_id', userId),
    supabase
      .from('season_completions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
  ]);

  return {
    readingFollows: followsRes.count || 0,
    togetherDays: 0, // 라이브 계산은 클라이언트에서
    discussionCredits: creditsRes.count || 0,
    mentorSticks: mentorRes.count || 0,
    seasonBadges: seasonRes.count || 0,
  };
}

// ── 서재지기 초대 ──

export async function fetchMyLibrarianInvitations(userId: string): Promise<LibrarianInvitation[]> {
  const { data, error } = await supabase
    .from('librarian_invitations')
    .select('*, inviter:inviter_id(name), seojae:seojae_id(name)')
    .eq('invitee_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((row: Record<string, unknown>) => {
    const inviter = row.inviter as { name: string } | null;
    const seojae = row.seojae as { name: string } | null;
    return {
      id: row.id as string,
      inviteeId: row.invitee_id as string,
      inviterId: row.inviter_id as string,
      inviterName: inviter?.name || '알 수 없음',
      seojaeId: (row.seojae_id as string) || null,
      seojaeName: seojae?.name || null,
      status: row.status as 'pending' | 'accepted' | 'declined',
      message: (row.message as string) || '',
      createdAt: row.created_at as string,
    };
  });
}

export async function acceptLibrarianInvitation(userId: string, invitationId: string) {
  const { error: updateErr } = await supabase
    .from('librarian_invitations')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', invitationId)
    .eq('invitee_id', userId);

  if (updateErr) throw updateErr;

  // gate_2 통과
  await passGate(userId, 'gate_2');
}

// ── Feedback ──

export async function submitFeedback(
  screenName: string,
  message: string,
  userId?: string,
) {
  const { error } = await supabase.from('feedback').insert({
    user_id: userId || null,
    screen_name: screenName,
    message,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
  });
  if (error) throw error;
}

// ── 동석 기록 (Co-Attendances) ──

export async function fetchMyCoAttendances(_userId: string) {
  // TODO: co_attendances 테이블에서 user_id 기준 조회
  // 현재는 목업 데이터 사용, DB 연동 시 구현 예정
  return [];
}

// ── 개인정보 동의 (user_consents) ──

/** 동의 시점의 접속 IP — 실패해도 동의 저장을 막지 않습니다 */
async function fetchClientIp(): Promise<string | null> {
  try {
    const res = await fetch('/api/client-ip');
    if (!res.ok) return null;
    const json = await res.json();
    return typeof json.ip === 'string' ? json.ip : null;
  } catch {
    return null;
  }
}

/**
 * 동의 상태를 기록합니다. 이력은 append-only로 쌓이며 기존 행은 수정하지 않습니다.
 * 동의도 철회도 모두 새 행으로 남습니다.
 */
export async function saveConsents(userId: string, draft: ConsentDraft): Promise<void> {
  const ip = await fetchClientIp();
  const agreedAt = new Date().toISOString();
  const rows = (Object.keys(draft) as ConsentType[]).map(type => ({
    user_id: userId,
    consent_type: type,
    agreed: draft[type],
    policy_version: POLICY_VERSIONS[type],
    agreed_at: agreedAt,
    ip_address: ip,
  }));
  const { error } = await supabase.from('user_consents').insert(rows);
  if (error) throw error;
}

/** 선택 항목 하나만 동의·철회 (새 행으로 기록) */
export async function recordConsent(
  userId: string,
  type: ConsentType,
  agreed: boolean,
): Promise<void> {
  const ip = await fetchClientIp();
  const { error } = await supabase.from('user_consents').insert({
    user_id: userId,
    consent_type: type,
    agreed,
    policy_version: POLICY_VERSIONS[type],
    agreed_at: new Date().toISOString(),
    ip_address: ip,
  });
  if (error) throw error;
}

export async function fetchConsents(userId: string): Promise<ConsentRecord[]> {
  const { data, error } = await supabase
    .from('user_consents')
    .select('consent_type, agreed, policy_version, agreed_at')
    .eq('user_id', userId)
    .order('agreed_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(row => ({
    consentType: row.consent_type as ConsentType,
    agreed: row.agreed,
    policyVersion: row.policy_version,
    agreedAt: row.agreed_at,
  }));
}

// ── 내 데이터 내려받기 / 회원 탈퇴 ──

/** 내 밑줄·회고·프로필·동의 이력을 한 덩어리로 모읍니다 */
export async function exportMyData(userId: string) {
  const [highlights, retrospectives, cards, posts, consents] = await Promise.all([
    supabase.from('highlights').select('*').eq('user_id', userId),
    supabase.from('meeting_retrospectives').select('*').eq('user_id', userId),
    supabase.from('remaining_sentence_cards').select('*').eq('user_id', userId),
    supabase.from('posts').select('*').eq('user_id', userId),
    supabase.from('user_consents').select('*').eq('user_id', userId),
  ]);

  const { data: profile } = await supabase.from('users').select('*').eq('id', userId).single();

  return {
    exportedAt: new Date().toISOString(),
    profile: profile ?? null,
    highlights: highlights.data ?? [],
    retrospectives: retrospectives.data ?? [],
    remainingCards: cards.data ?? [],
    posts: posts.data ?? [],
    consents: consents.data ?? [],
  };
}

/** 회원 탈퇴 — supabase-privacy.sql의 delete_my_account() 호출 */
export async function deleteMyAccount(): Promise<void> {
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw error;
}

// ── 회비 · 회계 ──
// 데모 모드에서는 앱 상태가 진짜이고, 아래 함수들은 best-effort로 DB에 반영합니다.
// 테이블이 아직 없거나 권한이 없으면 조용히 실패하고 화면은 그대로 동작합니다.

/**
 * 서재지기의 입금 계좌·회비 설정 저장.
 * fees 테이블은 서재지기와 해당 모임 참가자만 읽을 수 있습니다 (supabase-fee-accounts.sql).
 */
export async function upsertFeeAccount(hostId: string, account: FeeAccountRow): Promise<void> {
  const { error } = await supabase.from('fees').upsert(
    {
      event_id: account.eventId,
      host_id: hostId,
      amount: account.amount,
      due_date: account.dueDate || null,
      bank_name: account.bankName,
      account_number: account.accountNumber,
      account_holder: account.accountHolder,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'event_id' },
  );
  if (error) throw error;
}

export async function fetchFeeAccount(eventId: string) {
  const { data, error } = await supabase
    .from('fees')
    .select('event_id, amount, due_date, bank_name, account_number, account_holder, updated_at')
    .eq('event_id', eventId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    eventId: data.event_id as string,
    amount: (data.amount as number) ?? 0,
    dueDate: (data.due_date as string) ?? '',
    bankName: (data.bank_name as string) ?? '',
    accountNumber: (data.account_number as string) ?? '',
    accountHolder: (data.account_holder as string) ?? '',
    updatedAt: (data.updated_at as string) ?? '',
  };
}

/** 참가자가 "이체 완료했어요"를 눌렀을 때 — status를 pending으로 */
export async function reportFeeTransfer(
  eventId: string,
  userId: string,
  amount: number,
  method: PaymentMethodType,
): Promise<void> {
  const { error } = await supabase.from('fee_payments').upsert(
    {
      event_id: eventId,
      user_id: userId,
      amount,
      status: 'pending',
      method,
      reported_at: new Date().toISOString(),
    },
    { onConflict: 'event_id,user_id' },
  );
  if (error) throw error;
}

/** 서재지기가 입금을 확인했을 때 — status를 paid로 */
export async function confirmFeePayment(
  eventId: string,
  userId: string,
  confirmedBy: string,
): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('fee_payments')
    .update({ status: 'paid', paid_at: now, confirmed_by: confirmedBy, confirmed_at: now })
    .eq('event_id', eventId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function insertExpense(
  eventId: string,
  title: string,
  amount: number,
  createdBy: string,
): Promise<void> {
  const { error } = await supabase.from('expenses').insert({
    event_id: eventId,
    title,
    amount,
    created_by: createdBy,
  });
  if (error) throw error;
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

export async function insertFeeReminder(
  eventId: string,
  sentBy: string,
  recipientIds: string[],
  message: string,
): Promise<void> {
  const { error } = await supabase.from('fee_reminders').insert({
    event_id: eventId,
    sent_by: sentBy,
    recipient_ids: recipientIds,
    message,
  });
  if (error) throw error;
}

export async function setSettlementPublic(eventId: string, isPublic: boolean): Promise<void> {
  const { error } = await supabase
    .from('fees')
    .update({ settlement_public: isPublic, updated_at: new Date().toISOString() })
    .eq('event_id', eventId);
  if (error) throw error;
}

// ── Utils ──

function formatTimeAgo(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(isoString).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}
