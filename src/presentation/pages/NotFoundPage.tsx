// src/presentation/pages/NotFoundPage.tsx
import { Link } from 'react-router';
import { buttonVariants } from '@/presentation/components/Common/Button';
import { PageHeading } from '@/presentation/components/Common/PageHeading';
import { messages } from '@/presentation/i18n/messages';

export default function NotFoundPage() {
  return (
    <>
      <PageHeading title={messages.pages.notFoundTitle} subtitle={messages.pages.notFoundBody} />
      <Link to="/" className={buttonVariants({ variant: 'secondary' })}>
        {messages.pages.backHome}
      </Link>
    </>
  );
}
