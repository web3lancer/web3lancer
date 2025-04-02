'use client';

import dynamic from 'next/dynamic';

// Import SignInForm with dynamic import to avoid SSR issues with wagmi
const SignInForm = dynamic(
  () => import('@/components/auth/SignInForm'),
  { ssr: false }
);

export default function SignInPage() {
  return <SignInForm />;
}
