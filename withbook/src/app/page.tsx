'use client';

import { AppProvider, useApp } from '../context/AppContext';
import Splash from '../components/Splash';
import Login from '../components/Login';
import OnboardingSlides from '../components/OnboardingSlides';
import BookProfileSetup from '../components/BookProfileSetup';
import HomeFeed from '../components/HomeFeed';
import ComposePost from '../components/ComposePost';
import SeojaeDashboard from '../components/SeojaeDashboard';
import SeojaeDetail from '../components/SeojaeDetail';
import HighlightPairView from '../components/HighlightPairView';
import OfflineEvents from '../components/OfflineEvents';
import MyLibrary from '../components/MyLibrary';
import GroupChat from '../components/GroupChat';
import GateCelebration from '../components/GateCelebration';
import ResourceLibrary from '../components/ResourceLibrary';
import LibrarianConsole from '../components/LibrarianConsole';
import CoAttendeeProfile from '../components/CoAttendeeProfile';
import BottomNav from '../components/BottomNav';
import ErrorBoundary from '../components/ErrorBoundary';
import FeedbackButton from '../components/FeedbackButton';
import BetaNotice from '../components/BetaNotice';

function AppShell() {
  const { route, tab, subView, authLoading, isTestMode } = useApp();

  // 세션 확인 중 로딩 표시
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-surface">
        <div className="flex flex-col items-center gap-3 animate-fade">
          <div className="w-12 h-12 rounded-[14px] bg-ink flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path d="M6 6h8v20H6V6zm12 0h8v20h-8V6z" fill="white" opacity="0.9" />
              <path d="M14 8v16" stroke="#0066cc" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[14px] text-sub">불러오는 중...</span>
        </div>
      </div>
    );
  }

  // Pre-main routes — 자료실은 어디서든 접근 가능
  if (subView === 'resourceLibrary') return <ResourceLibrary />;
  if (route === 'splash') return <Splash />;
  if (route === 'login') return <Login />;
  if (route === 'onboarding') return <OnboardingSlides />;
  if (route === 'booksetup') return <BookProfileSetup />;

  // Main app with tabs
  return (
    <div className="relative min-h-dvh bg-canvas">
      {/* Test mode badge */}
      {isTestMode && (
        <div className="fixed top-[calc(env(safe-area-inset-top,0px)+6px)] right-3 z-50 px-2 py-0.5 bg-yellow-400/90 text-yellow-900 text-[10px] font-semibold rounded-full">
          테스트 모드
        </div>
      )}

      {/* Tab content */}
      <div className="animate-fade" key={tab}>
        {tab === 'home' && <HomeFeed />}
        {tab === 'seojae' && <SeojaeDashboard />}
        {tab === 'participate' && <OfflineEvents />}
        {tab === 'chat' && <GroupChat />}
        {tab === 'my' && <MyLibrary />}
      </div>

      {/* Sub views (overlays) */}
      {subView === 'compose' && <ComposePost />}
      {subView === 'bookEdit' && <BookProfileSetup />}
      {subView === 'gate1Celebration' && <GateCelebration />}
      {subView === 'seojaeDetail' && <SeojaeDetail />}
      {subView === 'highlightPairView' && <HighlightPairView />}
      {subView === 'librarianConsole' && <LibrarianConsole />}
      {subView === 'coAttendeeProfile' && <CoAttendeeProfile />}

      {/* Feedback floating button */}
      <FeedbackButton />

      {/* Beta test notice (shown once) */}
      <BetaNotice />

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}

export default function Page() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="max-w-[430px] mx-auto w-full min-h-dvh bg-canvas">
          <AppShell />
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}
