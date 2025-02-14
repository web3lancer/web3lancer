import { AppBar, Toolbar, Typography, Button, IconButton } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import React from "react";

export default function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
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