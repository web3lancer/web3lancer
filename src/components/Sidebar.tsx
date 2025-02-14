import { Drawer, List, ListItem, ListItemText, ListItemIcon } from "@mui/material";
import { CalendarToday, Dashboard, EventNote, Work } from "@mui/icons-material";
import React from "react";

export default function Sidebar() {
  return (
    <Drawer variant="permanent" style={{ backgroundColor: '#1E40AF', fontFamily: 'Roboto' }}>
      <List>
        <ListItem button>
          <ListItemIcon><Dashboard /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button>
          <ListItemIcon><Work /></ListItemIcon>
          <ListItemText primary="Projects" />
        </ListItem>
        <ListItem button>
          <ListItemIcon><EventNote /></ListItemIcon>
          <ListItemText primary="Planning" />
        </ListItem>
        <ListItem button>
          <ListItemIcon><CalendarToday /></ListItemIcon>
          <ListItemText primary="Calendar" />
        </ListItem>
      </List>
    </Drawer>
  );
}