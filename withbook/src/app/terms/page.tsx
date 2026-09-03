import type { Metadata } from 'next';
import PolicyDocumentView from '../../components/PolicyDocumentView';
import { TERMS_OF_SERVICE } from '../../lib/policy-docs';

export const metadata: Metadata = {
  title: '서비스 이용약관 — 위드북',
  description: '위드북 이용 조건과 절차, 이용자와 위드북의 권리·의무를 안내합니다.',
};

export default function TermsPage() {
  return <PolicyDocumentView doc={TERMS_OF_SERVICE} />;
}
