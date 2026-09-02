'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[WithBook Error]', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-dvh bg-canvas px-8">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M6 6h8v20H6V6zm12 0h8v20h-8V6z" fill="#1d1d1f" opacity="0.15" />
              <path d="M14 8v16" stroke="#0066cc" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
            </svg>
          </div>
          <h2
            className="text-[19px] font-semibold text-ink text-center mb-2"
            style={{ letterSpacing: '-0.3px' }}
          >
            문제가 생겼어요
          </h2>
          <p className="text-[14px] text-sub text-center leading-[1.6] mb-8">
            일시적인 오류가 발생했어요.<br />
            아래 버튼을 눌러 다시 시도해 주세요.
          </p>
          <div className="flex gap-3 w-full max-w-[280px]">
            <button
              onClick={this.handleRetry}
              className="flex-1 py-3 rounded-full bg-action text-white text-[14px] font-semibold press-scale"
            >
              다시 시도
            </button>
            <button
              onClick={this.handleReload}
              className="flex-1 py-3 rounded-full border border-border text-[14px] font-semibold text-ink press-scale"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
