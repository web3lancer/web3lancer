import { Profile } from "@/types";
import Link from "next/link";
import Image from "next/image";

interface ProfileCardProps {
  profile: Profile;
  className?: string;
}

export default function ProfileCard({ profile, className = "" }: ProfileCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden ${className}`}>
      <div className="relative h-20 bg-gradient-to-r from-blue-500 to-indigo-600">
        {profile.coverImageFileId && (
          <Image 
            src={`/api/profile/cover/${profile.coverImageFileId}`} 
            alt="Cover" 
            fill 
            className="object-cover" 
          />
        )}
      </div>
      
      <div className="relative px-4 pb-4">
        <div className="relative -top-10 flex justify-between items-start">
          <div className="relative h-16 w-16 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-600">
            {profile.avatarFileId ? (
              <Image 
                src={`/api/profile/avatar/${profile.avatarFileId}`} 
                alt={profile.displayName} 
                fill 
                className="object-cover" 
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full text-xl font-bold text-gray-500">
                {profile.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {profile.isVerified && (
            <div className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs px-2 py-1 rounded-full mt-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified
            </div>
          )}
        </div>
        
        <div className="-mt-6">
          <Link href={`/profile/${profile.$id}`} className="hover:underline">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{profile.displayName}</h3>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>
          
          {profile.tagline && (
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{profile.tagline}</p>
          )}
          
          <div className="mt-3 flex flex-wrap gap-1">
            {profile.roles.map((role) => (
              <span 
                key={role} 
                className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            ))}
            <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              {profile.reputationScore} ⭐
            </span>
          </div>
          
          {profile.location && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {profile.location}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
