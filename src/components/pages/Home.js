import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Home = () => (
  <Container maxWidth="md">
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h2" component="h1" gutterBottom color="primary">
        Welcome to Noteflow
      </Typography>
      <Typography variant="h6" color="text.secondary">
        Organize your tasks and notes efficiently. Create, update, and manage your daily activities and important notes all in one place.
      </Typography>
    </Box>
  </Container>
);

export default Home; 