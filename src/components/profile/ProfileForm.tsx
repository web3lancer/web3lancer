import React from 'react';
import { Box, Typography, TextField, Button, Chip, CircularProgress, Paper } from "@mui/material";
import { motion } from "framer-motion";

const MotionPaper = motion(Paper);

interface ProfileFormProps {
  profileData: {
    skills: string[];
    setSkills: (skills: string[]) => void;
    bio: string;
    setBio: (bio: string) => void;
  };
  onSave: () => Promise<void>;
  loading: boolean;
}

export default function ProfileForm({ profileData, onSave, loading }: ProfileFormProps) {
  const { skills, setSkills, bio, setBio } = profileData;
  const [skillInput, setSkillInput] = React.useState("");

  const handleAddSkill = () => {
    if (skillInput.trim() !== "" && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleDeleteSkill = (skillToDelete: string) => {
    setSkills(skills.filter(skill => skill !== skillToDelete));
  };

  return (
    <MotionPaper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      sx={{ p: 3, borderRadius: 2 }}
    >
      <Typography variant="h6" sx={{ mb: 3 }}>
        Profile Information
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
          Bio
        </Typography>
        <TextField
          label="Tell us about yourself"
          fullWidth
          multiline
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          sx={{ mb: 2 }}
        />
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
          Skills
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            label="Add Skill"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddSkill();
                e.preventDefault();
              }
            }}
            sx={{ mr: 2, flexGrow: 1 }}
          />
          <Button variant="contained" onClick={handleAddSkill}>
            Add
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {skills.map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              onDelete={() => handleDeleteSkill(skill)}
              sx={{ background: 'rgba(30, 64, 175, 0.1)', color: '#1E40AF' }}
            />
          ))}
        </Box>
      </Box>
      
      <Button 
        variant="contained" 
        onClick={onSave}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Save Profile'}
      </Button>
    </MotionPaper>
  );
}
