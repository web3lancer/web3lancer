import { notFound } from 'next/navigation';
import PublicProfileView from '@/components/profile/PublicProfileView';
import ProfileService from '@/services/profileService';
import { AppwriteService } from '@/services/appwriteService';
import { envConfig } from '@/config/environment';
import { Query }from 'appwrite';

const appwriteService = new AppwriteService(envConfig);
const profileService = new ProfileService(appwriteService, envConfig);

interface PublicProfilePageProps {
  params: {
    usernameOrId: string;
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { usernameOrId } = params;

  let profile = null;

  // Check if it's a valid Appwrite ID (20 chars, alphanumeric)
  if (usernameOrId.length === 20 && /^[a-zA-Z0-9]+$/.test(usernameOrId)) {
    profile = await profileService.getProfile(usernameOrId);
  } else {
    // Otherwise, assume it's a username
    const profiles = await profileService.listProfiles([
      Query.equal('username', usernameOrId),
    ]);
    if (profiles.length > 0) {
      profile = profiles[0];
    }
  }

  if (!profile) {
    notFound();
  }

  return <PublicProfileView profile={profile} />;
}