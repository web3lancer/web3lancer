'use client';

import dynamic from 'next/dynamic';

// Import SigninForm with dynamic import to avoid SSR issues with wagmi
const SignInForm = dynamic(
  () => import('@/components/auth/SignInForm'),
  { ssr: false }
);

export default function SignInPage() {
  return <SignInForm />;
}
          </Box>
        )}
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account? <Link href="/signup">Sign up</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
