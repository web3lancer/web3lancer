"use client";

import { Profile } from '@/types';
import { Avatar, Box, Typography, Paper, Chip, Link, Grid } from '@mui/material';
import { Business, Person, Code, LocationOn, Schedule } from '@mui/icons-material';

interface PublicProfileViewProps {
  profile: Profile;
}

export default function PublicProfileView({ profile }: PublicProfileViewProps) {

  const getAvatarUrl = (fileId: string) => `/api/profile/avatar/${fileId}`;
  const getCoverUrl = (fileId: string) => `/api/profile/cover/${fileId}`;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Box
          sx={{
            height: 250,
            bgcolor: 'grey.300',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundImage: profile.coverImageFileId ? `url(${getCoverUrl(profile.coverImageFileId)})` : 'none',
          }}
        />
        <Box sx={{ p: 3, position: 'relative' }}>
          <Avatar
            src={profile.avatarFileId ? getAvatarUrl(profile.avatarFileId) : undefined}
            sx={{
              width: 150,
              height: 150,
              border: '4px solid white',
              position: 'absolute',
              top: -75,
              left: 24,
              fontSize: '4rem',
            }}
          >
            {profile.displayName?.[0].toUpperCase()}
          </Avatar>
          <Box sx={{ mt: 8 }}>
            <Typography variant="h4" fontWeight="bold">
              {profile.displayName}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              @{profile.username}
            </Typography>
            {profile.tagline && (
              <Typography variant="subtitle1" fontStyle="italic" color="text.secondary" sx={{ mb: 2 }}>
                "{profile.tagline}"
              </Typography>
            )}
            <Chip
              icon={profile.profileType === 'company' ? <Business /> : <Person />}
              label={profile.profileType.charAt(0).toUpperCase() + profile.profileType.slice(1)}
              color="primary"
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Box>
          <Box sx={{ my: 3 }}>
            <Typography variant="body1">{profile.bio}</Typography>
          </Box>

          <Grid container spacing={2}>
            {profile.location && (
              <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography>{profile.location}</Typography>
              </Grid>
            )}
            {profile.timezone && (
              <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography>{profile.timezone}</Typography>
              </Grid>
            )}
            {profile.portfolioLink && (
              <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <Code sx={{ mr: 1, color: 'text.secondary' }} />
                <Link href={profile.portfolioLink} target="_blank" rel="noopener noreferrer">
                  Portfolio
                </Link>
              </Grid>
            )}
          </Grid>

          {profile.skills && profile.skills.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Skills</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profile.skills.map((skill) => (
                  <Chip key={skill} label={skill} />
                ))}
              </Box>
            </Box>
          )}

          {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Socials</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(profile.socialLinks).map(([platform, url]) => (
                  url && <Link key={platform} href={url} target="_blank" rel="noopener noreferrer" sx={{ textTransform: 'capitalize' }}>{platform}</Link>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}