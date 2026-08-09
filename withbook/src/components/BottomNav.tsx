'use client';

import { useApp } from '../context/AppContext';
import type { Tab } from '../lib/types';
import { Newspaper, BookOpen, MapPin, MessageCircle, User } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';

const tabs: { id: Tab; icon: ComponentType<LucideProps>; label: string }[] = [
  { id: 'home', icon: Newspaper, label: '홈' },
  { id: 'seojae', icon: BookOpen, label: '서재' },
  { id: 'participate', icon: MapPin, label: '참가' },
  { id: 'chat', icon: MessageCircle, label: '채팅' },
  { id: 'my', icon: User, label: '마이' },
];

export default function BottomNav() {
  const { tab, setTab, setSubView } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-sm border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-[52px] max-w-[430px] mx-auto">
        {tabs.map(t => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setSubView(null);
              }}
              aria-label={t.label}
              className="press-scale flex items-center justify-center w-[44px] h-[44px] transition-colors"
            >
              <Icon
                size={24}
                color={active ? '#0066cc' : '#999999'}
                strokeWidth={active ? 2.2 : 1.5}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
