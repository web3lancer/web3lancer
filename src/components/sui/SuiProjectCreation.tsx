'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Chip
} from '@mui/material';
import { useSuiWallet } from '@/contexts/SuiWalletContext';
import { suiProjectService } from '@/services/suiServices';

interface Milestone {
  title: string;
  description: string;
  amount: number;
  deadline: string;
}

const SuiProjectCreation: React.FC = () => {
  const { isConnected } = useSuiWallet();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    budget: 0,
  });

  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: '', description: '', amount: 0, deadline: '' }
  ]);

  const steps = ['Project Details', 'Milestones', 'Review & Create'];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const addMilestone = () => {
    setMilestones([...milestones, { title: '', description: '', amount: 0, deadline: '' }]);
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: string | number) => {
    const updated = milestones.map((milestone, i) => 
      i === index ? { ...milestone, [field]: value } : milestone
    );
    setMilestones(updated);
  };

  const handleCreateProject = async () => {
    if (!isConnected) return;
    
    setLoading(true);
    try {
      const milestonesData = milestones.map(m => ({
        title: m.title,
        description: m.description,
        amount: m.amount,
        deadline: new Date(m.deadline).getTime(),
      }));

      await suiProjectService.createProject({
        title: projectData.title,
        description: projectData.description,
        budget: projectData.budget,
        milestones: milestonesData,
      });

      // Reset form
      setProjectData({ title: '', description: '', budget: 0 });
      setMilestones([{ title: '', description: '', amount: 0, deadline: '' }]);
      setActiveStep(0);
    } catch (error) {
      console.error('Error creating project:', error);
    }
    setLoading(false);
  };

  if (!isConnected) {
    return (
      <Alert severity="warning">
        Please connect your Sui wallet to create projects
      </Alert>
    );
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              fullWidth
              label="Project Title"
              value={projectData.title}
              onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Project Description"
              multiline
              rows={4}
              value={projectData.description}
              onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Total Budget (SUI)"
              type="number"
              value={projectData.budget}
              onChange={(e) => setProjectData({ ...projectData, budget: Number(e.target.value) })}
              margin="normal"
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Project Milestones
            </Typography>
            {milestones.map((milestone, index) => (
              <Card key={index} sx={{ mb: 2, p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Milestone Title"
                      value={milestone.title}
                      onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Amount (SUI)"
                      type="number"
                      value={milestone.amount}
                      onChange={(e) => updateMilestone(index, 'amount', Number(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={2}
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Deadline"
                      type="date"
                      value={milestone.deadline}
                      onChange={(e) => updateMilestone(index, 'deadline', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Card>
            ))}
            <Button onClick={addMilestone} variant="outlined">
              Add Milestone
            </Button>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Project
            </Typography>
            <Card sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1">{projectData.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {projectData.description}
              </Typography>
              <Chip label={`${projectData.budget} SUI`} color="primary" />
            </Card>
            <Typography variant="subtitle2" gutterBottom>
              Milestones ({milestones.length})
            </Typography>
            {milestones.map((milestone, index) => (
              <Card key={index} sx={{ p: 1, mb: 1 }}>
                <Typography variant="body2">
                  {milestone.title} - {milestone.amount} SUI
                </Typography>
              </Card>
            ))}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Create Sui Project
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleCreateProject}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                (activeStep === 0 && (!projectData.title || !projectData.description || projectData.budget <= 0)) ||
                (activeStep === 1 && milestones.some(m => !m.title || !m.description || m.amount <= 0))
              }
            >
              Next
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SuiProjectCreation;