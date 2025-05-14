"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useAuth } from "@/contexts/AuthContext-new";
import useProfile from "@/hooks/useProfile";
import { Profile, ProfileType, SocialLinks } from "@/types";
import { Loader2 } from "lucide-react";

export default function ProfileEditForm() {
  const { user } = useAuth();
  const { profile, loading, error, updateProfile, updateAvatar, updateCoverImage } = useProfile();
  
  const [formData, setFormData] = useState<Partial<Profile>>({
    displayName: "",
    username: "",
    profileType: "individual" as ProfileType,
    bio: "",
    tagline: "",
    location: "",
    timezone: "",
    portfolioLink: "",
    socialLinks: {} as SocialLinks,
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Load profile data into form when available
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || "",
        username: profile.username || "",
        profileType: profile.profileType || "individual",
        bio: profile.bio || "",
        tagline: profile.tagline || "",
        location: profile.location || "",
        timezone: profile.timezone || "",
        portfolioLink: profile.portfolioLink || "",
        socialLinks: profile.socialLinks || {},
      });
    }
  }, [profile]);
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };
  
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCoverImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      setSaveError("No profile found to update");
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      // Update profile data
      await updateProfile(formData);
      
      // Upload avatar if changed
      if (avatarFile) {
        await updateAvatar(avatarFile);
      }
      
      // Upload cover image if changed
      if (coverImageFile) {
        await updateCoverImage(coverImageFile);
      }
      
      setSaveSuccess(true);
      
      // Reset file inputs
      setAvatarFile(null);
      setCoverImageFile(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveError("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }
  
  if (!user) {
    return <div className="p-4">Please log in to edit your profile</div>;
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Edit Profile</h2>
        
        {saveSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            Profile updated successfully!
          </div>
        )}
        
        {saveError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {saveError}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-1">Profile Type</label>
          <select
            name="profileType"
            value={formData.profileType}
            onChange={handleInputChange}
            className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
          >
            <option value="individual">Individual</option>
            <option value="company">Company</option>
            <option value="dao">DAO</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Display Name</label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleInputChange}
            className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Tagline</label>
          <input
            type="text"
            name="tagline"
            value={formData.tagline}
            onChange={handleInputChange}
            placeholder="A short catchy phrase about you"
            className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows={4}
            placeholder="Tell us about yourself"
            className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="City, Country"
              className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Timezone</label>
            <input
              type="text"
              name="timezone"
              value={formData.timezone}
              onChange={handleInputChange}
              placeholder="e.g. UTC+1, America/New_York"
              className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Portfolio Link</label>
          <input
            type="url"
            name="portfolioLink"
            value={formData.portfolioLink}
            onChange={handleInputChange}
            placeholder="https://your-portfolio.com"
            className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Social Links</label>
          
          <div className="space-y-3">
            {['twitter', 'linkedin', 'github', 'instagram'].map((platform) => (
              <div key={platform} className="flex items-center">
                <span className="w-24 capitalize">{platform}:</span>
                <input
                  type="url"
                  value={formData.socialLinks?.[platform] || ''}
                  onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                  placeholder={`https://${platform}.com/your-username`}
                  className="flex-1 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                />
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Profile Picture</label>
          <div className="flex items-center space-x-4">
            <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-200">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
              ) : profile?.avatarFileId ? (
                <img src={`/api/profile/avatar/${profile.avatarFileId}`} alt="Current avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-500">
                  {formData.displayName?.charAt(0).toUpperCase() || user.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div>
              <input
                type="file"
                id="avatar"
                onChange={handleAvatarChange}
                className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                accept="image/*"
              />
              <p className="mt-1 text-xs text-gray-500">
                Recommended: 400x400px or larger, square image
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Cover Image</label>
          <div className="space-y-2">
            <div className="relative h-32 w-full rounded-md overflow-hidden bg-gray-200">
              {coverPreview ? (
                <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" />
              ) : profile?.coverImageFileId ? (
                <img src={`/api/profile/cover/${profile.coverImageFileId}`} alt="Current cover" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-500">
                  No cover image
                </div>
              )}
            </div>
            
            <input
              type="file"
              id="coverImage"
              onChange={handleCoverImageChange}
              className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              accept="image/*"
            />
            <p className="text-xs text-gray-500">
              Recommended: 1500x500px, landscape orientation
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-primary py-2 px-4 text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 flex items-center"
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSaving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}