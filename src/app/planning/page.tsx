"use client";
import React, { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, List, ListItem, ListItemText } from "@mui/material";
import { databases, ID } from "@/utils/api";
import { useAuth } from '@/contexts/AuthContext';

interface Task {
  $id: string;
  content: string;
  completed: boolean;
}

export default function PlanningPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInput, setTaskInput] = useState("");

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const response = await databases.listDocuments('67af3ffe0011106c4575', '67b8f57b006edf4e1b27');
      setTasks(response.documents as Task[]);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleAddTask = async () => {
    if (!taskInput.trim()) return;
    try {
      await databases.createDocument('67af3ffe0011106c4575', '67b8f57b006edf4e1b27', ID.unique(), {
        content: taskInput.trim(),
        completed: false,
        userId: user.$id,
        createdAt: new Date().toISOString(),
      });
      setTaskInput("");
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Planning</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Add new task"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
        />
        <Button variant="contained" onClick={handleAddTask}>Add Task</Button>
      </Box>
      <List>
        {tasks.map((task) => (
          <ListItem key={task.$id}>
            <ListItemText
              primary={task.content}
              secondary={task.completed ? "Completed" : "Pending"}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
