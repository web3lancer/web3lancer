import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Profile } from '@/types';
import profileService from '@/services/profileService';

interface ProfileCardProps {
  profile: Profile;
  showDetails?: boolean;
  className?: string;
  onClickProfile?: (profile: Profile) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  profile, 
  showDetails = true,
  className = '',
  onClickProfile
}) => {
  if (!profile) return null;
  // Default avatar if none exists
  const avatarUrl = profile.avatarFileId 
    ? `/api/profile/avatar/${profile.avatarFileId}` // fallback URL pattern
    : '/images/default-avatar.png';
  
  const handleProfileClick = () => {
    if (onClickProfile) {
      onClickProfile(profile);
    }
  };

  return (
    <div 
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden ${className}`}
      onClick={handleProfileClick}
    >
      <div className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden">
            <Image
              src={avatarUrl}
              alt={profile.displayName}
              layout="fill"
              objectFit="cover"
              className="rounded-full"
            />
            {profile.isVerified && (
              <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1" title="Verified Profile">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-white"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            )}
          </div>
          <div>
            <Link href={`/profile/${profile.username}`} className="hover:underline">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{profile.displayName}</h3>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>
            {profile.roles && profile.roles.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {profile.roles.join(' • ')}
              </p>
            )}
            {profile.reputationScore > 0 && (
              <div className="flex items-center mt-1">
                <span className="text-yellow-500">★</span>
                <span className="text-sm ml-1">{profile.reputationScore.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {showDetails && (
          <div className="mt-4">
            {profile.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                {profile.bio}
              </p>
            )}
            
            {profile.skills && profile.skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {profile.skills.slice(0, 3).map((skill: any, idx: any) => (
                  <span 
                    key={idx} 
                    className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {profile.skills.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full">
                    +{profile.skills.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// NOTE: If you see errors about JSX types, ensure your tsconfig.json has "jsx": "react-jsx" and you have @types/react installed.

export default ProfileCard;
