"use client";
import { Box, Grid, Card, CardContent, Typography, IconButton, LinearProgress, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowUpward, MoreVert, Assessment, AccountBalance, WorkOutline, TrendingUp } from '@mui/icons-material';

const MotionCard = motion(Card);

const statsData = [
  { title: 'Total Earnings', value: '$12,350', icon: AccountBalance, increase: '+15%', color: '#1E40AF' },
  { title: 'Active Projects', value: '8', icon: WorkOutline, increase: '+5%', color: '#3B82F6' },
  { title: 'Completion Rate', value: '94%', icon: Assessment, increase: '+2%', color: '#60A5FA' },
  { title: 'Client Rating', value: '4.9/5', icon: TrendingUp, increase: '+0.3', color: '#93C5FD' },
];

const activities = [
  { title: 'Project Completed', description: 'Blockchain Integration', time: '2 hours ago' },
  { title: 'New Project', description: 'Smart Contract Development', time: '5 hours ago' },
  { title: 'Payment Received', description: 'DApp Development', time: '1 day ago' },
];

export default function DashboardPage() {
  const theme = useTheme();

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
          Dashboard
        </Typography>

        <Grid container spacing={3}>
          {statsData.map((stat, index) => (
            <Grid item xs={12} sm={6} lg={3} key={stat.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MotionCard
                  whileHover={{ y: -5, boxShadow: theme.shadows[8] }}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          background: `${stat.color}20`,
                        }}
                      >
                        <stat.icon sx={{ color: stat.color }} />
                      </Box>
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </Box>
                    <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                      {stat.value}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary" variant="body2">
                        {stat.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                        <ArrowUpward sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {stat.increase}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </MotionCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={8}>
            <MotionCard
              whileHover={{ boxShadow: theme.shadows[8] }}
              sx={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                height: '100%',
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Recent Activity</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {activities.map((activity, index) => (
                    <motion.div
                      key={activity.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {activity.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {activity.description}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {activity.time}
                        </Typography>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <MotionCard
              whileHover={{ boxShadow: theme.shadows[8] }}
              sx={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                height: '100%',
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Project Progress</Typography>
                {['DApp Development', 'Smart Contract', 'Blockchain Integration'].map((project, index) => (
                  <Box key={project} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{project}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {[75, 45, 90][index]}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={[75, 45, 90][index]}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'rgba(0,0,0,0.05)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                        },
                      }}
                    />
                  </Box>
                ))}
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
}