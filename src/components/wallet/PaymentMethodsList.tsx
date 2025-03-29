import React from 'react';
import { Box, Typography, Button, Chip, Divider } from '@mui/material';

interface PaymentMethodsListProps {
  paymentMethods: any[];
}

export function PaymentMethodsList({ paymentMethods }: PaymentMethodsListProps) {
  return (
    <>
      {paymentMethods.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          No payment methods found. Add one below.
        </Typography>
      ) : (
        <Box sx={{ mb: 3 }}>
          {paymentMethods.map((method) => (
            <Box 
              key={method.$id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1.5,
                mb: 1,
                borderRadius: 1,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box>
                <Typography variant="body1">
                  {method.type.replace('_', ' ').toUpperCase()}
                  {method.isDefault && (
                    <Chip 
                      label="DEFAULT" 
                      size="small" 
                      sx={{ ml: 1, bgcolor: 'success.light', color: 'success.contrastText' }} 
                    />
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Added: {new Date(method.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              <Button size="small" color="primary">
                Edit
              </Button>
            </Box>
          ))}
        </Box>
      )}
      
      <Divider sx={{ my: 3 }} />
    </>
  );
}
