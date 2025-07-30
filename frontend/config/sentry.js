import * as Sentry from '@sentry/react-native';

// Sentry initialization
export const initSentry = () => {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || null,
    environment: process.env.NODE_ENV || 'development',
    debug: process.env.NODE_ENV === 'development',
    
    // Performance monitoring
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    
    // Error filtering
    beforeSend(event) {
      // Filter out certain errors
      if (event.exception) {
        const exception = event.exception.values[0];
        if (exception.type === 'NetworkError') {
          return null; // Don't send network errors
        }
      }
      return event;
    },
    
    // User context
    beforeBreadcrumb(breadcrumb) {
      // Add user context to breadcrumbs
      return breadcrumb;
    }
  });
};

// Set user context
export const setUserContext = (user) => {
  if (user) {
    Sentry.setUser({
      id: user.id.toString(),
      email: user.email,
      username: `${user.first_name} ${user.last_name}`,
      subscription: user.is_premium ? 'premium' : 'basic'
    });
  } else {
    Sentry.setUser(null);
  }
};

// Set tags for better filtering
export const setTags = (tags) => {
  Sentry.setTags(tags);
};

// Capture custom errors
export const captureError = (error, context = {}) => {
  Sentry.captureException(error, {
    extra: context
  });
};

// Capture custom messages
export const captureMessage = (message, level = 'info') => {
  Sentry.captureMessage(message, level);
};

// Performance monitoring
export const startTransaction = (name, operation) => {
  return Sentry.startTransaction({
    name,
    op: operation
  });
};

// Add breadcrumb for user actions
export const addBreadcrumb = (message, category = 'user', data = {}) => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info'
  });
};

export default Sentry; 