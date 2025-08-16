import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
// import profileService from '@/services/profileService';
import { Profile } from '@/types';

import {
  updateProfile,
  getProfileByUserId,
} from '@/lib/appwrites/profiles';
import {
  createFile,
  deleteFile,
  getFilePreviewUrl,
} from '@/lib/appwrites/storage';
import { BUCKET_ID } from '@/lib/appwrites/constants';

const ProfileEditForm: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    location: '',
    profileType: 'individual',
    skills: [] as string[],
    newSkill: '',
    roles: [] as string[],
    languages: [] as string[],
    socialLinks: {
      twitter: '',
      github: '',
      linkedin: '',
      website: ''
    }
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        // Assuming getProfile is a function that fetches the profile by user ID
        const userProfile = await getProfileByUserId(user.$id);
        if (userProfile) {
          setProfile(userProfile);
          setFormData({
            displayName: userProfile.name || '',
            username: userProfile.username || '',
            bio: userProfile.bio || '',
            location: userProfile.location || '',
            profileType: userProfile.profileType || 'individual',
            skills: userProfile.skills || [],
            newSkill: '',
            roles: userProfile.roles || [],
            languages: userProfile.languages || [], // Assuming languages is a field
            socialLinks: {
              twitter: userProfile.socialLinks?.twitter || '',
              github: userProfile.socialLinks?.github || '',
              linkedin: userProfile.socialLinks?.linkedin || '',
              website: userProfile.socialLinks?.website || ''
            }
          });
          
          // Set avatar and cover previews if they exist
          if (userProfile.avatarFileId) {
            setAvatarPreview(getFilePreviewUrl(BUCKET_ID.PROFILE_AVATARS, userProfile.avatarFileId));
          }
          
          if (userProfile.coverImageFileId) {
            setCoverPreview(getFilePreviewUrl(BUCKET_ID.COVER_IMAGES, userProfile.coverImageFileId));
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage({ type: 'error', text: 'Failed to load profile. Please try again.' });
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('socialLinks.')) {
      const socialKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleAddSkill = () => {
    if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill.trim()],
        newSkill: ''
      }));
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => {
      if (prev.roles.includes(role)) {
        return {
          ...prev,
          roles: prev.roles.filter(r => r !== role)
        };
      } else {
        return {
          ...prev,
          roles: [...prev.roles, role]
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      let avatarFileId = profile.avatarFileId;
      if (avatarFile) {
        if (profile.avatarFileId) {
          await deleteFile(BUCKET_ID.PROFILE_AVATARS, profile.avatarFileId);
        }
        const newAvatar = await createFile(BUCKET_ID.PROFILE_AVATARS, avatarFile);
        avatarFileId = newAvatar.$id;
      }

      let coverImageFileId = profile.coverImageFileId;
      if (coverFile) {
        if (profile.coverImageFileId) {
          await deleteFile(BUCKET_ID.COVER_IMAGES, profile.coverImageFileId);
        }
        const newCover = await createFile(BUCKET_ID.COVER_IMAGES, coverFile);
        coverImageFileId = newCover.$id;
      }

      const updatedProfileData = {
        name: formData.displayName,
        username: formData.username,
        bio: formData.bio,
        location: formData.location,
        profileType: formData.profileType,
        skills: formData.skills,
        roles: formData.roles,
        languages: formData.languages,
        socialLinks: formData.socialLinks,
        avatarFileId,
        coverImageFileId,
      };

      await updateProfile(profile.$id, updatedProfileData);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      const refreshedProfile = await getProfile(profile.$id);
      if (refreshedProfile) {
        setProfile(refreshedProfile);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className="p-4">Please log in to edit your profile.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
      
      {message.text && (
        <div className={`p-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Pictures Section */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 relative rounded-full overflow-hidden bg-gray-100">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No image</div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <label
                  htmlFor="avatar"
                  className="cursor-pointer inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Choose Image
                </label>
              </div>
            </div>
          </div>
          
          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cover Image
            </label>
            <div className="flex flex-col space-y-2">
              <div className="w-full h-32 relative rounded-md overflow-hidden bg-gray-100">
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No cover image</div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="cover"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
                <label
                  htmlFor="cover"
                  className="cursor-pointer inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Choose Cover
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Basic Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Display Name*
          </label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Username*
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Profile Type
          </label>
          <select
            name="profileType"
            value={formData.profileType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="individual">Individual</option>
            <option value="organization">Organization</option>
          </select>
        </div>
        
        {/* Skills Section */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Skills
          </label>
          <div className="flex">
            <input
              type="text"
              name="newSkill"
              value={formData.newSkill}
              onChange={handleChange}
              placeholder="Add a skill..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full flex items-center text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
        
        {/* Roles Section */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Roles
          </label>
          <div className="flex flex-wrap gap-3">
            {['freelancer', 'client', 'developer', 'designer', 'marketer', 'writer'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleToggle(role)}
                className={`px-4 py-2 rounded-md text-sm ${
                  formData.roles.includes(role)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Social Links */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Twitter
              </label>
              <input
                type="url"
                name="socialLinks.twitter"
                value={formData.socialLinks.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/username"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                GitHub
              </label>
              <input
                type="url"
                name="socialLinks.github"
                value={formData.socialLinks.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                name="socialLinks.linkedin"
                value={formData.socialLinks.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                name="socialLinks.website"
                value={formData.socialLinks.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default ProfileEditForm;