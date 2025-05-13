"use client";
import React from 'react';
import { Box, Typography, Paper, Card, CardContent, Divider, Link, Chip } from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PublicIcon from '@mui/icons-material/Public';
import CodeIcon from '@mui/icons-material/Code';

interface PublicProfileViewProps {
  profile: any;
  isCurrentUser: boolean;
  onEdit?: () => void;
}

export default function PublicProfileView({ profile, isCurrentUser }: PublicProfileViewProps) {
  if (!profile) return null;

  return (
    <Box sx={{ height: '100%' }}>
      {/* Bio Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight="medium" gutterBottom sx={{ mb: 2 }}>
          About
        </Typography>
        <Typography variant="body1" paragraph>
          {profile.bio || 'No bio provided yet.'}
        </Typography>
      </Paper>

      {/* Projects / Portfolio Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BusinessCenterIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="medium">
            Projects & Portfolio
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {profile.projects && profile.projects.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {profile.projects.map((project: any, index: number) => (
              <Card key={index} variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6">{project.title}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {project.period}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {project.description}
                  </Typography>
                  {project.link && (
                    <Link href={project.link} target="_blank" rel="noopener">
                      View Project
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No projects listed yet.
          </Typography>
        )}
      </Paper>

      {/* Location section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PublicIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="medium">
            Location
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="body1">
          {profile.location || 'Location not specified'}
        </Typography>
      </Paper>

      {/* Skills section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CodeIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="medium">
            Skills & Expertise
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {profile.skills && profile.skills.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {profile.skills.map((skill: string, index: number) => (
              <Chip 
                key={index} 
                label={skill}
                sx={{ 
                  borderRadius: '4px',
                  backgroundColor: 'rgba(120, 87, 255, 0.1)',
                  color: 'primary.main'
                }}
              />
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No skills listed yet.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}