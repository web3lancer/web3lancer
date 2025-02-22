import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi';
import { Button, Box, Typography, Avatar } from '@mui/material';

export function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {ensAvatar && <Avatar alt="ENS Avatar" src={ensAvatar} />}
      <Typography variant="body1">
        {ensName ? `${ensName} (${address})` : address}
      </Typography>
      <Button variant="outlined" onClick={() => disconnect()}>
        Disconnect
      </Button>
    </Box>
  );
}
