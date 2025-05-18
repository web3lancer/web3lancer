import { Metadata } from 'next';
import UserProfilePageClient from './UserProfileClient';

export async function generateMetadata({ params }: { params: { usernameOrId: string } }): Promise<Metadata> {
  // You can fetch user profile data here for dynamic meta
  const username = params.usernameOrId;
  const title = `${username} | Web3Lancer Profile`;
  const description = `View ${username}'s profile, portfolio, and activity on Web3Lancer.`;
  const image = '/logo/web3lancer.jpg';
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