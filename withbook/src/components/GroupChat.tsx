'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_SEOJAE, MOCK_OFFLINE_EVENTS, MOCK_BOOK_TOPICS, EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '../lib/mock-data';
import { supabase } from '../lib/supabase';
import * as db from '../lib/database';
import type { ChatMessage, ChatMember } from '../lib/types';

export default function GroupChat() {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  if (activeRoomId) {
    return <ChatRoomView roomId={activeRoomId} onBack={() => setActiveRoomId(null)} />;
  }
  return <ChatList onSelectRoom={setActiveRoomId} />;
}

/* ── 채팅 목록 ── */
function ChatList({ onSelectRoom }: { onSelectRoom: (id: string) => void }) {
  const { joinedSeojaeIds, appliedEvents, authUserId, myHighlightPairs } = useApp();
  const [dbRooms, setDbRooms] = useState<{ id: string; name: string; type: 'club' | 'event' | 'seojae' | 'highlight_pair' }[]>([]);

  useEffect(() => {
    if (!authUserId) return;
    db.fetchMyChatRooms(authUserId)
      .then(setDbRooms)
      .catch(() => {});
  }, [authUserId, joinedSeojaeIds, appliedEvents]);

  // mock 데이터로 시각 정보 보강
  const rooms = dbRooms.map(r => {
    const seojae = MOCK_SEOJAE.find(s => s.chatRoomId === r.id);
    const event = MOCK_OFFLINE_EVENTS.find(e => e.id === r.id);
    return {
      ...r,
      seojaeName: seojae?.name,
      eventType: event?.type,
    };
  });

  // DB에 없지만 로컬 상태로 참여 중인 방도 표시 (아직 DB 반영 전)
  const dbIds = new Set(dbRooms.map(r => r.id));
  const localSeojaeRooms = MOCK_SEOJAE
    .filter(s => joinedSeojaeIds.has(s.id) && s.chatRoomId && !dbIds.has(s.chatRoomId!))
    .map(s => ({
      id: s.chatRoomId!,
      name: s.name,
      type: 'seojae' as const,
      seojaeName: s.name,
      eventType: undefined,
    }));
  const localEventRooms = MOCK_OFFLINE_EVENTS
    .filter(e => appliedEvents.has(e.id) && !dbIds.has(e.id))
    .map(e => ({
      id: e.id,
      name: e.title,
      type: 'event' as const,
      seojaeName: undefined,
      eventType: e.type,
    }));
  // 밑줄 짝 채팅방
  const localPairRooms = myHighlightPairs
    .filter(p => p.chatRoomId && !dbIds.has(p.chatRoomId!))
    .map(p => ({
      id: p.chatRoomId!,
      name: `${p.partnerName}과의 밑줄 짝`,
      type: 'highlight_pair' as const,
      seojaeName: undefined,
      eventType: undefined,
      partnerAvatar: p.partnerAvatar,
    }));

  const allRooms = [...rooms, ...localSeojaeRooms, ...localEventRooms, ...localPairRooms];

  return (
    <div className="pb-24">
      {/* 고정 헤더 */}
      <header className="sticky top-0 z-10 bg-surface border-b border-border px-5 py-4">
        <h1 className="text-[20px] font-bold text-ink">채팅</h1>
      </header>

      {allRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sub">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-[16px] font-semibold text-ink mb-2">아직 참여한 모임이 없어요</p>
          <p className="text-[14px] text-sub leading-relaxed">서재에 참여하거나<br />오프라인 행사에 신청하면<br />채팅이 열려요</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {allRooms.map(room => (
            <li key={room.id}>
              <button
                className="w-full flex items-center gap-3 px-5 py-3.5 text-left active:bg-muted/20 transition-colors"
                onClick={() => onSelectRoom(room.id)}
              >
                {/* 아이콘 */}
                {(room.type === 'seojae' || room.type === 'club') ? (
                  <div className="w-12 h-12 rounded-[12px] bg-action/10 flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                ) : room.type === 'highlight_pair' ? (
                  <div className="w-12 h-12 rounded-full bg-muted/30 overflow-hidden flex-shrink-0">
                    {'partnerAvatar' in room && (room as { partnerAvatar?: string }).partnerAvatar ? (
                      <img src={(room as { partnerAvatar: string }).partnerAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[14px]">📖</span>
                      </div>
                    )}
                  </div>
                ) : room.type === 'event' && room.eventType ? (
                  <div
                    className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: EVENT_TYPE_COLORS[room.eventType] + '20' }}
                  >
                    <span className="text-[11px] font-bold" style={{ color: EVENT_TYPE_COLORS[room.eventType] }}>
                      {EVENT_TYPE_LABELS[room.eventType].slice(0, 2)}
                    </span>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-[12px] bg-muted/30 flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sub">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                )}
                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <span className="text-[15px] font-semibold text-ink truncate block">{room.name}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── 채팅방 뷰 ── */
function ChatRoomView({ roomId, onBack }: { roomId: string; onBack: () => void }) {
  const { profile, authUserId } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [memberCount, setMemberCount] = useState(0);
  const [showMembers, setShowMembers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const seojae = MOCK_SEOJAE.find(s => s.chatRoomId === roomId);
  const event = MOCK_OFFLINE_EVENTS.find(e => e.id === roomId);
  const roomName = seojae?.name || event?.title || '채팅';
  const topic = MOCK_BOOK_TOPICS[roomId];

  // 메시지 로드 + Realtime 구독
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function init() {
      try {
        const msgs = await db.fetchChatMessages(roomId);
        setMessages(msgs);
      } catch { /* ignore */ }

      try {
        const count = await db.fetchRoomMemberCount(roomId);
        setMemberCount(count);
      } catch { /* ignore */ }

      // Realtime 구독
      channel = supabase
        .channel(`chat:${roomId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${roomId}`,
          },
          async (payload) => {
            const row = payload.new as {
              id: string;
              room_id: string;
              sender_id: string | null;
              type: string;
              text: string;
              created_at: string;
            };

            // 낙관적으로 추가한 메시지와 중복 방지
            setMessages(prev => {
              if (prev.some(m => m.id === row.id)) return prev;

              const isMe = row.sender_id === authUserId && row.type === 'message';
              const newMsg: ChatMessage = {
                id: row.id,
                roomId: row.room_id,
                senderId: row.sender_id || '',
                senderName: '', // 아래에서 조회
                senderAvatar: '/assets/avatar-me.png',
                type: row.type as 'message' | 'system',
                text: row.text,
                createdAt: db.formatChatTime(row.created_at),
                isMe,
              };
              return [...prev, newMsg];
            });

            // sender 정보 조회해서 업데이트
            if (row.sender_id) {
              try {
                const { data: user } = await supabase
                  .from('users')
                  .select('name, avatar_url')
                  .eq('id', row.sender_id)
                  .single();
                if (user) {
                  setMessages(prev =>
                    prev.map(m =>
                      m.id === row.id
                        ? { ...m, senderName: user.name || '알 수 없음', senderAvatar: user.avatar_url || '/assets/avatar-me.png' }
                        : m
                    )
                  );
                }
              } catch { /* ignore */ }
            }

            // 시스템 메시지(입장/퇴장)면 멤버 수 갱신
            if (row.type === 'system') {
              try {
                const count = await db.fetchRoomMemberCount(roomId);
                setMemberCount(count);
              } catch { /* ignore */ }
            }
          }
        )
        .subscribe();
    }

    init();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [roomId, authUserId]);

  // 메시지가 추가되면 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || !authUserId) return;

    // 낙관적 메시지
    const optimisticId = `opt-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: optimisticId,
      roomId,
      senderId: authUserId,
      senderName: profile.name || '나',
      senderAvatar: profile.avatarUrl,
      type: 'message',
      text,
      createdAt: db.formatChatTime(new Date().toISOString()),
      isMe: true,
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setInput('');

    try {
      const created = await db.sendChatMessage(roomId, authUserId, text);
      // 낙관적 메시지를 실제 ID로 교체
      setMessages(prev =>
        prev.map(m => m.id === optimisticId ? { ...m, id: created.id } : m)
      );
    } catch {
      // 실패 시 낙관적 메시지 제거
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
    }
  }, [input, authUserId, roomId, profile.name, profile.avatarUrl]);

  return (
    <div className="flex flex-col h-dvh bg-canvas">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-surface border-b border-border flex items-center gap-3 px-4 py-3">
        <button onClick={onBack} className="p-1 -ml-1" aria-label="뒤로가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-[16px] font-semibold text-ink truncate">{roomName}</h2>
          {memberCount > 0 && (
            <p className="text-[12px] text-sub">참여자 {memberCount}명</p>
          )}
        </div>
        <button
          onClick={() => setShowMembers(true)}
          className="p-2 -mr-1 rounded-lg active:bg-muted/20"
          aria-label="멤버 목록"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </button>
      </header>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {/* 오늘의 책 이야기 주제 카드 */}
        {topic && (
          <div className="bg-action/5 border border-action/20 rounded-[14px] p-4 mb-4">
            <p className="text-[12px] font-bold text-action mb-2">오늘의 책 이야기 주제</p>
            <p className="text-[14px] font-medium text-ink leading-snug mb-2">{topic.question}</p>
            <p className="text-[12px] text-sub">📖 {topic.bookTitle} · {topic.bookAuthor}</p>
          </div>
        )}

        {/* 메시지 목록 */}
        {messages.map(msg =>
          msg.type === 'system' ? (
            <SystemMessage key={msg.id} text={msg.text} />
          ) : msg.isMe ? (
            <MyMessage key={msg.id} message={msg} />
          ) : (
            <OtherMessage key={msg.id} message={msg} />
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 하단 입력 바 */}
      <div className="sticky bottom-0 bg-surface border-t border-border px-4 py-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSend(); }}
          placeholder="메시지를 입력하세요"
          className="flex-1 bg-muted/30 rounded-full px-4 py-2.5 text-[14px] text-ink placeholder:text-sub outline-none focus:ring-2 focus:ring-action/30"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-9 h-9 rounded-full bg-action flex items-center justify-center disabled:opacity-40 transition-opacity"
          aria-label="전송"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      {/* 멤버 목록 오버레이 */}
      {showMembers && (
        <MemberListOverlay roomId={roomId} onClose={() => setShowMembers(false)} />
      )}
    </div>
  );
}

/* ── 시스템 메시지 ── */
function SystemMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-center py-2">
      <span className="bg-muted/40 text-sub text-[12px] px-3 py-1 rounded-full">
        {text}
      </span>
    </div>
  );
}

/* ── 상대 메시지 ── */
function OtherMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex items-start gap-2 py-1">
      <div className="w-8 h-8 rounded-full bg-muted/30 overflow-hidden flex-shrink-0 mt-0.5">
        <img src={message.senderAvatar} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      </div>
      <div className="max-w-[75%]">
        <p className="text-[12px] text-sub mb-0.5">{message.senderName}</p>
        <div className="bg-surface border border-border rounded-[18px] px-3.5 py-2.5">
          <p className="text-[14px] text-ink leading-snug">{message.text}</p>
        </div>
        <p className="text-[11px] text-sub mt-0.5 ml-1">{message.createdAt}</p>
      </div>
    </div>
  );
}

/* ── 내 메시지 ── */
function MyMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-end py-1">
      <div className="max-w-[75%]">
        <div className="bg-action text-white rounded-[18px] px-3.5 py-2.5">
          <p className="text-[14px] leading-snug">{message.text}</p>
        </div>
        <p className="text-[11px] text-sub mt-0.5 mr-1 text-right">{message.createdAt}</p>
      </div>
    </div>
  );
}

/* ── 멤버 목록 오버레이 ── */
function MemberListOverlay({ roomId, onClose }: { roomId: string; onClose: () => void }) {
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.fetchChatMembers(roomId)
      .then(setMembers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roomId]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* 바텀시트 */}
      <div className="relative bg-surface rounded-t-[20px] max-h-[60vh] flex flex-col">
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-muted/50" />
        </div>

        <div className="px-5 pb-2 flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-ink">참여자 ({members.length})</h3>
          <button onClick={onClose} className="p-1 text-sub" aria-label="닫기">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-8">
          {loading ? (
            <p className="text-[14px] text-sub text-center py-8">불러오는 중...</p>
          ) : members.length === 0 ? (
            <p className="text-[14px] text-sub text-center py-8">참여자가 없습니다</p>
          ) : (
            <ul className="space-y-3">
              {members.map(m => (
                <li key={m.userId} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted/30 overflow-hidden flex-shrink-0">
                    <img src={m.userAvatar} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <span className="text-[15px] text-ink">{m.userName}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
