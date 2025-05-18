import { Metadata } from 'next';
import UserProfilePageClient from './UserProfileClient';
import { getUserProfileByUsername, getUserProfile, getProfilePictureUrl } from '@/utils/api';

export async function generateMetadata({ params }: { params: { usernameOrId: string } }): Promise<Metadata> {
  const username = params.usernameOrId;
  const title = `${username} | Web3Lancer Profile`;
  const description = `View ${username}'s profile, portfolio, and activity on Web3Lancer.`;
  let image = '/logo/web3lancer.jpg';
  try {
    let profile = await getUserProfileByUsername(username);
    if (!profile) {
      profile = await getUserProfile(username);
    }
    if (profile && profile.profilePicture) {
      image = getProfilePictureUrl(profile.profilePicture);
    }
  } catch (e) {}
  const url = `https://www.web3lancer.website/u/${username}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: [image],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default function UserProfilePage() {
  return <UserProfilePageClient />;
}