"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar,
  CircularProgress, // Added missing import
  Divider 
} from '@mui/material';
import { motion } from 'framer-motion';
import { Work, Payment, Star, History } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// ...existing code...