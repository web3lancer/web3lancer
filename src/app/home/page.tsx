"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import useProfile from "@/hooks/useProfile";
import ProfileCard from "@/components/profile/ProfileCard";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { user, customUser } = useAuth();
  const { profile, loading, error } = useProfile();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Welcome to Web3Lancer</h1>
        <p>Please sign in to view your dashboard.</p>
        <div className="mt-4">
          <Link 
            href="/signin" 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Section */}
        <div className="md:col-span-1">
          <div className="space-y-6">
            {profile ? (
              <ProfileCard profile={profile} />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Profile information not available. Please complete your profile setup.
                </p>
                <div className="mt-4">
                  <Link 
                    href="/settings/profile" 
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    Set Up Profile
                  </Link>
                </div>
              </div>
            )}
            
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="font-bold text-lg mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <Link 
                  href="/settings/profile" 
                  className="block px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Edit Profile
                </Link>
                {profile && !profile.isVerified && (
                  <Link 
                    href="/settings/verification" 
                    className="block px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    Get Verified
                  </Link>
                )}
                <Link 
                  href="/jobs/create" 
                  className="block px-3 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-md hover:bg-green-200 dark:hover:bg-green-800"
                >
                  Post a Job
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Stats Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="font-bold text-lg mb-4">Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Jobs</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Contracts</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <p className="text-sm text-gray-500 dark:text-gray-400">Proposals Sent</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <p className="text-sm text-gray-500 dark:text-gray-400">Reputation</p>
                <p className="text-2xl font-bold">{profile?.reputationScore || 0}</p>
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="font-bold text-lg mb-4">Recent Activity</h2>
            {/* Placeholder for recent activity */}
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No recent activity to display.</p>
            </div>
          </div>
          
          {/* Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="font-bold text-lg mb-4">Recommended for You</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 p-3 rounded-md">
                <h3 className="font-medium">Complete Your Profile</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Add more details to your profile to increase your visibility and attract more opportunities.
                </p>
                <div className="mt-2">
                  <Link 
                    href="/settings/profile" 
                    className="text-sm text-primary hover:underline"
                  >
                    Complete Profile →
                  </Link>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 p-3 rounded-md">
                <h3 className="font-medium">Explore Open Jobs</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Browse available jobs that match your skills and interests.
                </p>
                <div className="mt-2">
                  <Link 
                    href="/jobs" 
                    className="text-sm text-primary hover:underline"
                  >
                    Browse Jobs →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}