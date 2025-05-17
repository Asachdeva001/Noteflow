import React from 'react';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: { xs: 1, sm: 3 } }}>
        {children}
      </Container>
      <Footer />
    </Box>
  );
};

export default Layout; 