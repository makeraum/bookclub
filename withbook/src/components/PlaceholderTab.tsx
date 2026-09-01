'use client';

interface PlaceholderTabProps {
  title: string;
  icon: string;
  description: string;
}

export default function PlaceholderTab({ title, icon, description }: PlaceholderTabProps) {
  return (
    <div className="flex flex-col min-h-dvh bg-canvas">
      <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-sm px-5 pt-[58px] pb-3 border-b border-border">
        <h1 className="text-[20px] font-semibold text-ink" style={{ letterSpacing: '-0.3px' }}>
          {title}
        </h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-24">
        <span className="text-[48px] mb-4">{icon}</span>
        <p className="text-[15px] font-medium text-ink mb-1">준비 중입니다</p>
        <p className="text-[13px] text-sub text-center">{description}</p>
      </div>
    </div>
  );
}
