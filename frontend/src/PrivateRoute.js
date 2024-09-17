import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // Assuming you're using cookies for authentication

const PrivateRoute = ({ element: Element }) => {
  const user = Cookies.get('user') || sessionStorage.getItem('user');
  const isAuthenticated = user ? true : false;

  return isAuthenticated ? <Element /> : <Navigate to="/login" />;
};

export default PrivateRoute;
