import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PublicRoute = ({ element: Element }) => {
  const user = Cookies.get('user') || sessionStorage.getItem('user');
  const isAuthenticated = user ? true : false;

  return isAuthenticated ? <Navigate to="/account" /> : <Element />;
};

export default PublicRoute;
