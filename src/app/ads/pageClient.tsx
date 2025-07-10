"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Container,
  Tabs,
  Tab,
  TextField,
  Button,
  Divider,
  Grid,
  Chip,
  Avatar,
  IconButton,
  InputAdornment,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CampaignIcon from "@mui/icons-material/Campaign";
import EventNoteIcon from "@mui/icons-material/EventNote";

const mockScheduledAds = [
  {
    id: "ad1",
    title: "Promote your Web3 Project",
    description: "Get your project in front of thousands of freelancers.",
    image: "",
    scheduledFor: "2024-07-01",
    status: "Scheduled",
  },
  {
    id: "ad2",
    title: "Boost your Job Post",
    description: "Feature your job to attract top talent.",
    image: "",
    scheduledFor: "2024-07-05",
    status: "Scheduled",
  },
];

const mockPromotions = [
  {
    id: "promo1",
    title: "Summer Promo",
    description: "20% off on all ad placements this July!",
    image: "",
    active: true,
  },
];

export default function AdsPageClient() {
  const [tab, setTab] = useState(0);
  const [adTitle, setAdTitle] = useState("");
  const [adDescription, setAdDescription] = useState("");
  const [adImage, setAdImage] = useState<File | null>(null);
  const [adImagePreview, setAdImagePreview] = useState<string | null>(null);
  const [adSchedule, setAdSchedule] = useState("");
  const [ads, setAds] = useState(mockScheduledAds);

  const handleTabChange = (_: any, newValue: number) => setTab(newValue);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAdImage(e.target.files[0]);
      setAdImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleRemoveImage = () => {
    setAdImage(null);
    setAdImagePreview(null);
  };

  const handleCreateAd = () => {
    if (!adTitle.trim() || !adDescription.trim() || !adSchedule) return;
    setAds([
      ...ads,
      {
        id: `ad${Date.now()}`,
        title: adTitle,
        description: adDescription,
        image: adImagePreview || "",
        scheduledFor: adSchedule,
        status: "Scheduled",
      },
    ]);
    setAdTitle("");
    setAdDescription("");
    setAdImage(null);
    setAdImagePreview(null);
    setAdSchedule("");
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <Container maxWidth="sm" sx={{ pt: { xs: 4, sm: 6 }, pb: 2 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              mb: 1,
              letterSpacing: "-0.5px",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <CampaignIcon fontSize="large" sx={{ color: "primary.main" }} />
            Ads & Promotions
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.92, fontWeight: 500, mb: 0.5 }}
          >
            Promote your jobs, projects, or services to the Web3Lancer community.
          </Typography>
        </Box>
      </Container>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ pb: 6, px: { xs: 0.5, sm: 2 } }}>
        <Paper
          elevation={3}
          sx={{
            borderRadius: 4,
            boxShadow: 4,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
            mt: 0,
          }}
        >
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": { fontWeight: 600, fontSize: 16 },
            }}
          >
            <Tab icon={<CampaignIcon />} iconPosition="start" label="Create Ad" />
            <Tab icon={<ScheduleIcon />} iconPosition="start" label="Scheduled Ads" />
            <Tab icon={<EventNoteIcon />} iconPosition="start" label="Promotions" />
          </Tabs>

          {/* Create Ad Tab */}
          {tab === 0 && (
            <Box sx={{ p: { xs: 2, sm: 4 } }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Create a New Ad
              </Typography>
              <TextField
                label="Ad Title"
                fullWidth
                value={adTitle}
                onChange={(e) => setAdTitle(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                minRows={3}
                value={adDescription}
                onChange={(e) => setAdDescription(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AddPhotoAlternateIcon />}
                  sx={{ mr: 2 }}
                >
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </Button>
                {adImagePreview && (
                  <Box sx={{ position: "relative", display: "inline-block" }}>
                    <Avatar
                      src={adImagePreview}
                      variant="rounded"
                      sx={{ width: 56, height: 56, mr: 1 }}
                    />
                    <IconButton
                      size="small"
                      onClick={handleRemoveImage}
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        bgcolor: "background.paper",
                        boxShadow: 1,
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
              <TextField
                label="Schedule Date"
                type="date"
                fullWidth
                value={adSchedule}
                onChange={(e) => setAdSchedule(e.target.value)}
                sx={{ mb: 3 }}
                InputLabelProps={{ shrink: true }}
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleCreateAd}
                disabled={!adTitle.trim() || !adDescription.trim() || !adSchedule}
                sx={{ py: 1.2, fontWeight: 700, fontSize: 16, borderRadius: 3 }}
              >
                Create Ad
              </Button>
            </Box>
          )}

          {/* Scheduled Ads Tab */}
          {tab === 1 && (
            <Box sx={{ p: { xs: 2, sm: 4 } }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Scheduled Ads
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {ads.length === 0 ? (
                <Typography color="text.secondary">No scheduled ads yet.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {ads.map((ad) => (
                    <Grid item xs={12} key={ad.id}>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          bgcolor: "background.default",
                        }}
                      >
                        <Avatar
                          variant="rounded"
                          src={ad.image}
                          sx={{ width: 56, height: 56, bgcolor: "grey.200" }}
                        >
                          <CampaignIcon />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {ad.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {ad.description}
                          </Typography>
                          <Chip
                            label={`Scheduled for ${ad.scheduledFor}`}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                        <Chip
                          label={ad.status}
                          color="info"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {/* Promotions Tab */}
          {tab === 2 && (
            <Box sx={{ p: { xs: 2, sm: 4 } }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Promotions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {mockPromotions.length === 0 ? (
                <Typography color="text.secondary">No active promotions.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {mockPromotions.map((promo) => (
                    <Grid item xs={12} key={promo.id}>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          bgcolor: "background.default",
                        }}
                      >
                        <Avatar
                          variant="rounded"
                          src={promo.image}
                          sx={{ width: 56, height: 56, bgcolor: "secondary.light" }}
                        >
                          <EventNoteIcon />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {promo.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {promo.description}
                          </Typography>
                          <Chip
                            label={promo.active ? "Active" : "Inactive"}
                            size="small"
                            color={promo.active ? "success" : "default"}
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
