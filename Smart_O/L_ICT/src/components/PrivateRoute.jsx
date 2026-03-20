import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem('token');

  if (!token) {
    // Redirect to login if no token
    return <Navigate to="/login" replace />;
  }

  // Optionally, you can verify the token here or in a useEffect
  // For now, just check if token exists

  return children;
};

export default PrivateRoute;