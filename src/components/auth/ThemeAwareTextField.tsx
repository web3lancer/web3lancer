// filepath: /home/nathfavour/Documents/code/web3lancer/web3lancer/src/components/auth/ThemeAwareTextField.tsx
import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export const ThemeAwareTextField = (props: TextFieldProps) => {
  return (
    <TextField
      {...props}
      sx={{
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
        ...(props.sx || {})
      }}
    />
  );
};