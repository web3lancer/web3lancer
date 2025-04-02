'use client';

import dynamic from 'next/dynamic';

// Alternative approach to handle the component correctly
const SignInForm = dynamic(
  () => import('@/components/auth/SignInForm'),
  { ssr: false }
);

export default function SignInPage() {
  return <SignInForm />;
}
