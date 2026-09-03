import type { Metadata } from 'next';
import PolicyDocumentView from '../../components/PolicyDocumentView';
import { PRIVACY_POLICY } from '../../lib/policy-docs';

export const metadata: Metadata = {
  title: '개인정보처리방침 — 위드북',
  description: '위드북이 수집하는 개인정보와 이용 목적, 보유 기간, 국외 이전, 이용자의 권리를 안내합니다.',
};

export default function PrivacyPage() {
  return <PolicyDocumentView doc={PRIVACY_POLICY} />;
}
