// filepath: /home/nathfavour/Documents/code/web3lancer/web3lancer/src/utils/themeUtils.ts
import { SxProps, Theme } from '@mui/material';

/**
 * Helper function to create theme-aware text field styles
 * This ensures consistent styling with proper contrast in both light and dark themes
 */
export const getThemeAwareTextFieldStyles = (): SxProps<Theme> => ({
  '& .MuiInputBase-input': {
    color: theme => theme.palette.text.primary,
  },
  '& .MuiInputLabel-root': {
    color: theme => theme.palette.text.secondary,
  },
  '& .MuiFormHelperText-root': {
    color: theme => theme.palette.text.secondary,
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme => theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.23)' 
        : 'rgba(0, 0, 0, 0.23)',
    },
    '&:hover fieldset': {
      borderColor: theme => theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.5)' 
        : 'rgba(0, 0, 0, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
    },
  },
});

/**
 * Helper function to create theme-aware button styles
 */
export const getThemeAwareButtonStyles = (): SxProps<Theme> => ({
  borderColor: theme => theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(0, 0, 0, 0.2)',
  color: theme => theme.palette.mode === 'dark' 
    ? theme.palette.common.white 
    : '#333',
  '&:hover': {
    borderColor: theme => theme.palette.mode === 'dark' 
      ? theme.palette.common.white 
      : '#333',
    background: theme => theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.05)',
  }
});