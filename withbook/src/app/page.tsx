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
import MeetingRetrospective from '../components/MeetingRetrospective';
import ConsentGate from '../components/ConsentGate';
import PrivacySettings from '../components/PrivacySettings';
import PrinciplesView from '../components/PrinciplesView';
import BottomNav from '../components/BottomNav';
import ErrorBoundary from '../components/ErrorBoundary';
import FeedbackButton from '../components/FeedbackButton';
import BetaNotice from '../components/BetaNotice';
import Toast from '../components/ui/Toast';

function AppShell() {
  const { route, tab, subView, authLoading, isTestMode } = useApp();

  // 세션 확인 중 로딩 표시
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-surface">
        <div className="flex flex-col items-center gap-3 animate-fade">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/withbook-icon-192.png" alt="위드북" width={48} height={48} className="w-12 h-12" />
          <span className="text-[14px] text-sub">불러오는 중...</span>
        </div>
      </div>
    );
  }

  // Pre-main routes
  if (route === 'splash') return <Splash />;
  if (route === 'login') return <Login />;
  if (route === 'consent') return <ConsentGate />;
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
      {subView === 'meetingRetrospective' && <MeetingRetrospective />}
      {subView === 'privacySettings' && <PrivacySettings />}
      {subView === 'resourceLibrary' && <ResourceLibrary />}
      {subView === 'principles' && <PrinciplesView />}

      {/* Feedback floating button */}
      <FeedbackButton />

      {/* Beta test notice (shown once) */}
      <BetaNotice />

      {/* Bottom navigation */}
      <BottomNav />

      {/* 저장·완료 알림 */}
      <Toast />
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
