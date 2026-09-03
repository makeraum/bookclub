import Link from 'next/link';
import { OPERATOR_INFO, type PolicyDocument } from '../lib/policy-docs';

/** /privacy, /terms 공용 렌더러 — 로그인 없이 볼 수 있는 정적 문서 */
export default function PolicyDocumentView({ doc }: { doc: PolicyDocument }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <div className="max-w-[680px] mx-auto px-5 py-12">
        <Link href="/" className="text-[13px] text-action font-medium">
          ‹ 위드북으로 돌아가기
        </Link>

        <h1
          className="text-[26px] font-semibold text-ink mt-6 mb-2"
          style={{ letterSpacing: '-0.5px' }}
        >
          {doc.title}
        </h1>
        <p className="text-[12.5px] text-sub mb-6">
          버전 {doc.version} · 시행일 {doc.effectiveDate}
        </p>
        <p className="text-[14px] text-ink leading-[1.8] mb-10">{doc.intro}</p>

        <div className="space-y-9">
          {doc.sections.map(section => (
            <section key={section.heading}>
              <h2
                className="text-[16px] font-semibold text-ink mb-3"
                style={{ letterSpacing: '-0.3px' }}
              >
                {section.heading}
              </h2>

              {section.paragraphs?.map((p, i) => (
                <p key={i} className="text-[13.5px] text-ink/85 leading-[1.85] mb-2.5">
                  {p}
                </p>
              ))}

              {section.bullets && (
                <ul className="space-y-1.5 mt-2">
                  {section.bullets.map((b, i) => (
                    <li key={i} className="text-[13.5px] text-ink/85 leading-[1.8] flex gap-2">
                      <span className="text-sub flex-shrink-0">·</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.rows && (
                <div className="space-y-3 mt-4">
                  {section.rows.map((row, i) => (
                    <div key={i} className="bg-surface rounded-[16px] border border-border p-4">
                      <dl className="space-y-1.5">
                        {row.map(cell => (
                          <div key={cell.label} className="flex gap-3">
                            <dt
                              className="text-[12.5px] flex-shrink-0"
                              style={{ color: '#86868b', width: 82 }}
                            >
                              {cell.label}
                            </dt>
                            <dd className="text-[12.5px] text-ink leading-[1.7] flex-1">
                              {cell.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        <footer className="mt-14 pt-6 border-t border-border">
          <div className="flex gap-4">
            <Link href="/privacy" className="text-[13px] text-sub underline">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="text-[13px] text-sub underline">
              서비스 이용약관
            </Link>
          </div>
          <p className="text-[12.5px] text-sub mt-4 leading-[1.8]">
            최종 개정일 {OPERATOR_INFO.lastUpdated}
            <br />
            문의{' '}
            <a href={`mailto:${OPERATOR_INFO.contactEmail}`} className="underline">
              {OPERATOR_INFO.contactEmail}
            </a>
          </p>
          <p className="text-[11.5px] text-caption mt-2 leading-[1.7]">
            {OPERATOR_INFO.operator} ({OPERATOR_INFO.operatorType} 운영) · {OPERATOR_INFO.address}
          </p>
        </footer>
      </div>
    </div>
  );
}
