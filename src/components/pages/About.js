import React from 'react';
import { Box, Typography, Container, List, ListItem, ListItemText } from '@mui/material';

const About = () => (
  <Container maxWidth="md">
    <Box sx={{ py: 8, mx: 'auto', textAlign: 'center' }}>
      <Typography variant="h3" component="h1" gutterBottom color="primary">
        About Noteflow
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
        Noteflow is a productivity web application designed to help you keep track of your daily tasks and important notes. Built with React and Firebase, it offers a seamless experience for managing your personal and professional life.
      </Typography>
      <List sx={{ display: 'inline-block', mb: 3 }}>
        <ListItem><ListItemText primary="Create, update, and delete tasks" /></ListItem>
        <ListItem><ListItemText primary="Organize your notes" /></ListItem>
        <ListItem><ListItemText primary="Secure and fast with Firebase backend" /></ListItem>
        <ListItem><ListItemText primary="Easy-to-use interface" /></ListItem>
      </List>
      <Typography variant="body1" color="text.secondary">
        This project is open source and continually improved. Thank you for using Noteflow!
      </Typography>
    </Box>
  </Container>
);

export default About; 