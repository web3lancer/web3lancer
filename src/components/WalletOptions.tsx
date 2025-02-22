import * as React from 'react';
import { useConnect } from 'wagmi';
import { Button } from '@mui/material';

export function WalletOptions() {
  const { connectors, connect } = useConnect();

  return (
    <div>
      {connectors.map((connector) => (
        <Button
          key={connector.id}
          onClick={() => connect({ connector })}
          variant="outlined"
          sx={{ mb: 2, width: '100%' }}
        >
          {connector.name}
        </Button>
      ))}
    </div>
  );
}
