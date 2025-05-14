import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Profile } from '@/types';
import profileService from '@/services/profileService';

interface ProfileHeaderProps {
  profile: Profile;
  isCurrentUser?: boolean;
  className?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  profile, 
  isCurrentUser = false,
  className = ''
}) => {
  // Default images if none exist
  const avatarUrl = profile.avatarFileId 
    ? profileService.getProfileAvatarUrl(profile.avatarFileId)
    : '/images/default-avatar.png';
  
  const coverUrl = profile.coverImageFileId
    ? profileService.getProfileCoverUrl(profile.coverImageFileId)
    : '/images/default-cover.jpg';

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Cover Image */}
      <div className="relative h-32 md:h-48 lg:h-64 w-full">
        <Image
          src={coverUrl}
          alt="Profile Cover"
          layout="fill"
          objectFit="cover"
          priority
        />
      </div>
      
      {/* Profile Info */}
      <div className="relative px-4 sm:px-6 pb-5">
        {/* Avatar - positioned to overlap the cover */}
        <div className="absolute -top-16 left-4 sm:left-6">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-slate-800 overflow-hidden">
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
                  width="16" 
                  height="16" 
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
        </div>
        
        {/* Edit Profile Button for current user */}
        {isCurrentUser && (
          <div className="absolute top-4 right-4">
            <Link href="/settings/profile" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Edit Profile
            </Link>
          </div>
        )}
        
        {/* Profile Info */}
        <div className="mt-16 md:mt-20 pt-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{profile.displayName}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>
              
              <div className="flex flex-wrap items-center mt-2 text-sm text-gray-600 dark:text-gray-300">
                {profile.profileType === 'organization' && (
                  <span className="mr-4 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 px-2 py-1 rounded-full text-xs">
                    Organization
                  </span>
                )}
                
                {profile.roles && profile.roles.length > 0 && (
                  <span className="mr-4">{profile.roles.join(' • ')}</span>
                )}
                
                {profile.location && (
                  <span className="mr-4 flex items-center">
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
                      className="mr-1"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {profile.location}
                  </span>
                )}
                
                {profile.reputationScore > 0 && (
                  <span className="flex items-center mr-4">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span>{profile.reputationScore.toFixed(1)} rating</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Bio */}
          {profile.bio && (
            <div className="mt-4">
              <p className="text-gray-600 dark:text-gray-300">{profile.bio}</p>
            </div>
          )}
          
          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Social Links */}
          {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
            <div className="mt-4 flex space-x-3">
              {Object.entries(profile.socialLinks).map(([platform, url]) => (
                <a 
                  key={platform} 
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {/* Add social icons based on platform */}
                  <span>{platform}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;