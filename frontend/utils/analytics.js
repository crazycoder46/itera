import Analytics from 'expo-analytics';

// Google Analytics Measurement ID
const GA_TRACKING_ID = 'G-6957MVS7HL';

// Initialize analytics
const analytics = new Analytics(GA_TRACKING_ID);

// Track page views
export const trackPageView = (pageName) => {
  try {
    analytics.track('page_view', {
      page_title: pageName,
      page_location: `https://iterapp.org/${pageName}`,
    });
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
};

// Track custom events
export const trackEvent = (eventName, parameters = {}) => {
  try {
    analytics.track(eventName, parameters);
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
};

// Track user actions
export const trackUserAction = (action, category = 'User Action') => {
  try {
    analytics.track('user_action', {
      action: action,
      category: category,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
};

// Track app features
export const trackFeatureUsage = (featureName) => {
  try {
    analytics.track('feature_usage', {
      feature_name: featureName,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
};

// Track errors
export const trackError = (errorMessage, errorCode = null) => {
  try {
    analytics.track('error', {
      error_message: errorMessage,
      error_code: errorCode,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
};

export default analytics; 