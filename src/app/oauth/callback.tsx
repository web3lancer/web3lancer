"use client";
import React, { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function OAuthCallback() {
  const router = useRouter();
  const { handleGitHubOAuth } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      handleGitHubOAuth(code).then(() => {
        router.push('/dashboard');
      }).catch((error) => {
        console.error("Error handling OAuth callback:", error);
        router.push('/signin');
      });
    } else {
      router.push('/signin');
    }
  }, [handleGitHubOAuth, router]);

  return (
    <div>
      <p>Loading...</p>
    </div>
  );
}
