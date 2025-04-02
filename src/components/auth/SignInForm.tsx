'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';
// ...other imports...

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address } = useAccount(); // Now this is safely within WagmiProvider
  const { user, setUser, isMfaRequired, setIsMfaRequired } = useAuth();
  // ...rest of your signin page code...
}
