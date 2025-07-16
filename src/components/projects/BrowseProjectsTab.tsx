import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  useTheme,
  Paper,
  TextField,
  InputAdornment
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';
import { listProfiles } from "@/lib/appwrite";
import type { Profiles } from "@/types/appwrite.d";

export default function BrowseProjectsTab() {
  const theme = useTheme();
  const [projects, setProjects] = useState<Profiles[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        // Only fetch profiles with profileType "company" or "dao"
        const res = await listProfiles();
        const filtered = res.documents.filter(
          (p: Profiles) => p.profileType === "company" || p.profileType === "dao"
        );
        setProjects(filtered);
      } catch (e) {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    const q = searchQuery.toLowerCase();
    return (
      (project.name?.toLowerCase().includes(q) ?? false) ||
      (project.bio?.toLowerCase().includes(q) ?? false) ||
      (project.skills?.some(skill => skill.toLowerCase().includes(q)) ?? false)
    );
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: theme => `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <TextField
          fullWidth
          placeholder="Search projects by name, bio, or skill..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
            sx: { borderRadius: 3 }
          }}
          variant="outlined"
        />
      </Paper>

      {filteredProjects.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No projects found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your search.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map(project => (
            <Grid item xs={12} md={6} key={project.$id}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={project.avatarFileId || undefined}
                      sx={{ width: 48, height: 48, mr: 2 }}
                    >
                      {project.name?.[0] || ''}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        {project.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {project.profileType?.toUpperCase() || 'PROJECT'}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {project.bio}
                  </Typography>
                  {project.skills && project.skills.length > 0 && (
                    <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {project.skills.slice(0, 6).map((skill, idx) => (
                        <Chip
                          key={idx}
                          label={skill}
                          size="small"
                          sx={{
                            bgcolor: theme.palette.grey[100],
                            color: theme.palette.text.primary,
                            fontWeight: 500,
                          }}
                        />
                      ))}
                      {project.skills.length > 6 && (
                        <Chip
                          label={`+${project.skills.length - 6}`}
                          size="small"
                          sx={{
                            bgcolor: theme.palette.grey[100],
                            color: theme.palette.text.primary,
                          }}
                        />
                      )}
                    </Box>
                  )}
                  <Button
                    component={Link}
                    href={`/projects/${project.$id}`}
                    variant="contained"
                    color="primary"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      mt: 1
                    }}
                  >
                    View Project
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
                