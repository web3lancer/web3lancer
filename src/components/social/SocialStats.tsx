import { useEffect, useState } from 'react';
import { Box, Typography, Skeleton, Stack, Chip } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import LinkIcon from '@mui/icons-material/Link';
import { getFollowersCount, getFollowingCount, getConnectionsCount } from '@/utils/api';

interface SocialStatsProps {
  userId: string;
}

const SocialStats = ({ userId }: SocialStatsProps) => {
  const [followers, setFollowers] = useState<number | null>(null);
  const [following, setFollowing] = useState<number | null>(null);
  const [connections, setConnections] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const [followersCount, followingCount, connectionsCount] = await Promise.all([
          getFollowersCount(userId),
          getFollowingCount(userId),
          getConnectionsCount(userId)
        ]);
        
        setFollowers(followersCount);
        setFollowing(followingCount);
        setConnections(connectionsCount);
      } catch (error) {
        console.error('Error fetching social stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', flexWrap: 'wrap', my: 2 }}>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} width={80} height={30} />
        ))}
      </Stack>
    );
  }

  return (
    <Stack 
      direction="row" 
      spacing={2} 
      sx={{ 
        justifyContent: 'center', 
        flexWrap: 'wrap', 
        my: 2 
      }}
    >
      <Chip
        icon={<PersonIcon fontSize="small" />}
        label={
          <Typography variant="body2">
            <Box component="span" fontWeight="bold">{followers}</Box> Followers
          </Typography>
        }
        variant="outlined"
        sx={{ borderRadius: 1 }}
      />
      
      <Chip
        icon={<PeopleIcon fontSize="small" />}
        label={
          <Typography variant="body2">
            <Box component="span" fontWeight="bold">{following}</Box> Following
          </Typography>
        }
        variant="outlined"
        sx={{ borderRadius: 1 }}
      />
      
      <Chip
        icon={<LinkIcon fontSize="small" />}
        label={
          <Typography variant="body2">
            <Box component="span" fontWeight="bold">{connections}</Box> Connections
          </Typography>
        }
        variant="outlined"
        sx={{ borderRadius: 1 }}
      />
    </Stack>
  );
};

export default SocialStats;