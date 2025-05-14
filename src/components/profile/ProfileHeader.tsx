import { Profile } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext-new";

interface ProfileHeaderProps {
  profile: Profile;
  className?: string;
}

export default function ProfileHeader({ profile, className = "" }: ProfileHeaderProps) {
  const { user } = useAuth();
  const isCurrentUser = user && user.$id === profile.userId;
  
  return (
    <div className={`relative ${className}`}>
      {/* Cover Image */}
      <div className="relative h-48 sm:h-64 bg-gray-300 dark:bg-gray-700">
        {profile.coverImageFileId ? (
          <Image 
            src={`/api/profile/cover/${profile.coverImageFileId}`} 
            alt="Cover" 
            fill 
            className="object-cover" 
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
        )}
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-24">
          {/* Profile Avatar */}
          <div className="relative z-10 h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-600 shadow-md">
            {profile.avatarFileId ? (
              <Image 
                src={`/api/profile/avatar/${profile.avatarFileId}`} 
                alt={profile.displayName} 
                fill 
                className="object-cover" 
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full text-4xl font-bold text-gray-500 dark:text-gray-400">
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            
            {profile.isVerified && (
              <div className="absolute bottom-1 right-1 h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Profile Info */}
          <div className="mt-4 sm:mt-0 sm:ml-6 sm:mb-2 text-center sm:text-left flex-grow">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.displayName}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>
              </div>
              
              <div className="sm:ml-auto">
                {isCurrentUser ? (
                  <Link
                    href="/settings/profile"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit Profile
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                    Connect
                  </button>
                )}
              </div>
            </div>
            
            {profile.tagline && (
              <p className="mt-2 text-gray-700 dark:text-gray-300">{profile.tagline}</p>
            )}
            
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.roles.map((role) => (
                <span 
                  key={role} 
                  className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </span>
              ))}
              <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                Reputation: {profile.reputationScore}
              </span>
              {profile.location && (
                <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {profile.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}