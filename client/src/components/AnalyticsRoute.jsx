import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

const AnalyticsRoute = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Track page view
    trackPageView(location.pathname);
  }, [location.pathname]);

  return children;
};

export default AnalyticsRoute;