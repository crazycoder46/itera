const Sentry = require('@sentry/node');

// Sentry initialization
const initSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || 'https://your-sentry-dsn@sentry.io/project-id',
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
        if (exception.type === 'NetworkError' || exception.type === 'TimeoutError') {
          return null; // Don't send network/timeout errors
        }
      }
      return event;
    },
    
    // Integrations
    integrations: [
      new Sentry.Integrations.Express()
    ]
  });
};

// Set user context
const setUserContext = (user) => {
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
const setTags = (tags) => {
  Sentry.setTags(tags);
};

// Capture custom errors
const captureError = (error, context = {}) => {
  Sentry.captureException(error, {
    extra: context
  });
};

// Capture custom messages
const captureMessage = (message, level = 'info') => {
  Sentry.captureMessage(message, level);
};

// Performance monitoring
const startTransaction = (name, operation) => {
  return Sentry.startTransaction({
    name,
    op: operation
  });
};

// Add breadcrumb for API calls
const addBreadcrumb = (message, category = 'api', data = {}) => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info'
  });
};

// Database query monitoring
const monitorQuery = (query, params = []) => {
  const transaction = startTransaction('Database Query', 'db');
  const span = transaction.startChild({
    op: 'db.query',
    description: query.substring(0, 100)
  });
  
  return {
    finish: () => {
      span.finish();
      transaction.finish();
    },
    setTag: (key, value) => span.setTag(key, value)
  };
};

// API endpoint monitoring
const monitorEndpoint = (method, path) => {
  const transaction = startTransaction(`${method} ${path}`, 'http');
  
  return {
    finish: () => transaction.finish(),
    setTag: (key, value) => transaction.setTag(key, value),
    setData: (key, value) => transaction.setData(key, value)
  };
};

module.exports = {
  initSentry,
  setUserContext,
  setTags,
  captureError,
  captureMessage,
  startTransaction,
  addBreadcrumb,
  monitorQuery,
  monitorEndpoint,
  Sentry
}; 