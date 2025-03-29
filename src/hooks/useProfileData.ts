import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from "@/utils/api";

export function useProfileData(user: any) {
  const [skills, setSkills] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user?.$id) return;
    
    setError(null);
    try {
      let profileData;
      try {
        profileData = await getUserProfile(user.$id);
      } catch (err) {
        console.log('Profile not found, creating new profile');
        profileData = await createNewProfile(user.$id);
      }
      
      if (profileData) {
        setSkills(profileData.skills || []);
        setBio(profileData.bio || "");
        
        if (profileData.profilePicture) {
          try {
            const imageUrl = await getFilePreview('67b889200019e3d3519d', profileData.profilePicture, 200, 200);
            setImagePreview(imageUrl.toString());
          } catch (error) {
            console.error('Error fetching profile image:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error in profile management:', error);
      setError('Could not load profile data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const createNewProfile = async (userId: string) => {
    try {
      const response = await updateUserProfile(userId, {
        userId: userId,
        name: user?.name || "",
        email: user?.email || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        skills: [],
        bio: ""
      });
      return response;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  const handleSaveProfile = async () => {
    if (user) {
      setLoading(true);
      setError(null);
      try {
        await updateUserProfile(user.$id, {
          skills,
          bio,
          updatedAt: new Date().toISOString()
        });
        console.log('Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
        setError('Failed to save profile. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    loading,
    error,
    profileData: {
      skills,
      setSkills,
      bio,
      setBio,
      imagePreview,
      setImagePreview
    },
    handleSaveProfile
  };
}
