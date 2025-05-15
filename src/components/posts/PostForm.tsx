import React, { useState, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Chip, 
  IconButton, 
  Card, 
  CardContent, 
  Avatar, 
  Typography, 
  Divider, 
  CircularProgress, 
  Paper
} from '@mui/material';
import { 
  Image as ImageIcon, 
  AttachFile as AttachFileIcon, 
  Close as CloseIcon, 
  Add as AddIcon 
} from '@mui/icons-material';
import { Post, Profile } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import profileService from '@/services/profileService';

interface PostFormProps {
  onSubmit: (postData: Partial<Post>, files?: File[]) => Promise<void>;
  initialData?: Partial<Post>;
  isSubmitting?: boolean;
  currentUserProfile?: Profile;
  isEditing?: boolean;
}

const PostForm: React.FC<PostFormProps> = ({
  onSubmit,
  initialData,
  isSubmitting = false,
  currentUserProfile,
  isEditing = false
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState(initialData?.content || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get current user avatar URL
  const userAvatarUrl = currentUserProfile?.avatarFileId 
    ? profileService.getProfileAvatarUrl(currentUserProfile.avatarFileId)
    : '/images/default-avatar.png';
  
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    if (error) setError(null);
  };
  
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };
  
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };
  
  const addTag = (tag: string) => {
    // Remove the # if present
    const processedTag = tag.startsWith('#') ? tag.substring(1) : tag;
    
    if (processedTag && !tags.includes(processedTag)) {
      setTags([...tags, processedTag]);
    }
    setTagInput('');
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };
  
  const handleAddTag = () => {
    if (tagInput.trim()) {
      addTag(tagInput.trim());
    }
  };
  
  const handleFileSelection = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...newFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }
    
    try {
      const postData: Partial<Post> = {
        ...initialData,
        content: content.trim(),
        tags: tags,
      };
      
      await onSubmit(postData, selectedFiles.length > 0 ? selectedFiles : undefined);
      
      // Reset form if not editing
      if (!isEditing) {
        setContent('');
        setTags([]);
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      setError('Failed to submit post. Please try again.');
    }
  };
  
  return (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Avatar src={userAvatarUrl} alt={currentUserProfile?.displayName || 'User'} sx={{ mr: 2 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium', alignSelf: 'center' }}>
            {currentUserProfile?.displayName || user?.name || 'User'}
          </Typography>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="What's on your mind?"
            value={content}
            onChange={handleContentChange}
            variant="outlined"
            error={!!error}
            helperText={error}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {tags.map((tag, index) => (
              <Chip
                key={index}
                label={`#${tag}`}
                onDelete={() => removeTag(tag)}
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', mb: 2 }}>
            <TextField
              placeholder="Add tags..."
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              sx={{ mr: 1, flexGrow: 1 }}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 0.5 }}>#</Typography>,
              }}
            />
            <Button 
              variant="outlined" 
              onClick={handleAddTag}
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <AddIcon />
            </Button>
          </Box>
          
          {selectedFiles.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Files:
              </Typography>
              <Paper variant="outlined" sx={{ p: 1 }}>
                {selectedFiles.map((file, index) => (
                  <Box 
                    key={index} 
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1,
                      mb: index < selectedFiles.length - 1 ? 1 : 0,
                      borderRadius: 1,
                      bgcolor: 'rgba(0,0,0,0.03)'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachFileIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {file.name}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => removeFile(index)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Paper>
            </Box>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*,video/*"
              />
              <IconButton onClick={handleFileSelection} color="primary">
                <ImageIcon />
              </IconButton>
            </Box>
            
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || !content.trim()}
              sx={{ 
                borderRadius: 2,
                px: 3,
                background: 'linear-gradient(90deg, #2097ff 0%, #7857ff 100%)',
                boxShadow: '0 4px 12px rgba(32, 151, 255, 0.2)',
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                isEditing ? 'Update' : 'Post'
              )}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PostForm;