"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext-new";
import useProfile from "@/hooks/useProfile";
import { Profile } from "@/types";
import Image from "next/image";

export default function ProfilePage() {
  const { user, customUser } = useAuth();
  const { profile, loading, error, updateProfile } = useProfile();
  
  if (loading) {
    return <div className="p-4">Loading profile...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }
  
  if (!profile) {
    return <div className="p-4">No profile found</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-48 bg-gray-300 dark:bg-gray-700">
          {profile.coverImageFileId && (
            <Image 
              src={`/api/profile/cover/${profile.coverImageFileId}`} 
              alt="Cover" 
              fill 
              className="object-cover" 
            />
          )}
        </div>
        
        {/* Profile Header */}
        <div className="relative px-4 py-5 sm:px-6 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
          <div className="relative -top-16 sm:-top-20 mb-0 sm:-mb-16">
            <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-600">
              {profile.avatarFileId ? (
                <Image 
                  src={`/api/profile/avatar/${profile.avatarFileId}`} 
                  alt={profile.displayName} 
                  fill 
                  className="object-cover" 
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full text-3xl font-bold text-gray-500">
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {profile.isVerified && (
              <div className="absolute bottom-0 right-0 h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="text-center sm:text-left pt-0 sm:pt-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.displayName}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.username}</p>
            
            {profile.tagline && (
              <p className="mt-2 text-gray-700 dark:text-gray-300">{profile.tagline}</p>
            )}
            
            <div className="flex flex-wrap gap-2 mt-3">
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
            </div>
          </div>
        </div>
        
        {/* Profile Details */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            {profile.location && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{profile.location}</dd>
              </div>
            )}
            
            {profile.timezone && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Timezone</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{profile.timezone}</dd>
              </div>
            )}
            
            {profile.bio && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-line">{profile.bio}</dd>
              </div>
            )}
            
            {profile.skills.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Skills</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span 
                      key={skill} 
                      className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                    >
                      {skill}
                    </span>
                  ))}
                </dd>
              </div>
            )}
            
            {profile.portfolioLink && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Portfolio</dt>
                <dd className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                  <a href={profile.portfolioLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {profile.portfolioLink}
                  </a>
                </dd>
              </div>
            )}
            
            {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Social Links</dt>
                <dd className="mt-1 flex gap-4">
                  {Object.entries(profile.socialLinks).map(([platform, url]) => (
                    <a 
                      key={platform} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      {/* Simple placeholder icons, replace with real social icons */}
                      <span className="sr-only">{platform}</span>
                      <div className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {platform.charAt(0).toUpperCase()}
                      </div>
                    </a>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}