import { AppBar, Toolbar, Typography, Button, IconButton } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import React from "react";
import Image from 'next/image';

export default function Header() {
  return (
    <AppBar position="static" style={{ backgroundColor: '#1E40AF', fontFamily: 'Roboto' }}>
      <Toolbar>
        <div style={{ position: 'relative', width: 40, height: 40 }}>
          <Image 
            src="/logo/web3lancer.jpg"
            alt="Web3Lancer Logo"
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
        <Typography variant="h6" style={{ flexGrow: 1, marginLeft: '10px' }}>
          Web3Lancer
        </Typography>
        <Button color="inherit">Sign In</Button>
        <IconButton color="inherit">
          <AccountCircle />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}