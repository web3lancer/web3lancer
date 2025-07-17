import { Box } from '@mui/material';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import SignInPrompt from '@/components/auth/SignInPrompt';
import { useAuth } from '@/contexts/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAnonymous } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, py: 2, px: { xs: 2, md: 4 } }}>
        {/* Show sign-in prompt for anonymous users */}
        {isAnonymous && (
          <Box sx={{ mb: 3, maxWidth: 'xl', mx: 'auto' }}>
            <SignInPrompt 
              variant="alert"
              message="You're browsing as a guest. Sign in to save your progress and access all features."
            />
          </Box>
        )}
        {children}
      </Box>
      <Footer />
    </Box>
  );
}