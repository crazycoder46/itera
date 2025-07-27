// Google Analytics 4 for React Native
const GA_TRACKING_ID = 'G-6957MVS7HL';

// Simple analytics implementation for React Native
class Analytics {
  constructor() {
    this.clientId = this.generateClientId();
    this.sessionId = Date.now();
  }

  generateClientId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async sendEvent(eventName, parameters = {}) {
    try {
      const payload = {
        client_id: this.clientId,
        events: [{
          name: eventName,
          params: {
            ...parameters,
            engagement_time_msec: 100,
            session_id: this.sessionId
          }
        }]
      };

      // Send to backend analytics endpoint
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.warn('Analytics event failed to send to backend');
      }
      
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  // Track page views
  async trackPageView(pageName) {
    await this.sendEvent('page_view', {
      page_title: pageName,
      page_location: `https://iterapp.org/${pageName}`,
    });
  }

  // Track custom events
  async trackEvent(eventName, parameters = {}) {
    await this.sendEvent(eventName, parameters);
  }

  // Track user actions
  async trackUserAction(action, category = 'User Action') {
    await this.sendEvent('user_action', {
      action: action,
      category: category,
      timestamp: new Date().toISOString(),
    });
  }

  // Track app features
  async trackFeatureUsage(featureName) {
    await this.sendEvent('feature_usage', {
      feature_name: featureName,
      timestamp: new Date().toISOString(),
    });
  }

  // Track errors
  async trackError(errorMessage, errorCode = null) {
    await this.sendEvent('error', {
      error_message: errorMessage,
      error_code: errorCode,
      timestamp: new Date().toISOString(),
    });
  }
}

// Create singleton instance
const analytics = new Analytics();

// Export functions
export const trackPageView = (pageName) => analytics.trackPageView(pageName);
export const trackEvent = (eventName, parameters = {}) => analytics.trackEvent(eventName, parameters);
export const trackUserAction = (action, category = 'User Action') => analytics.trackUserAction(action, category);
export const trackFeatureUsage = (featureName) => analytics.trackFeatureUsage(featureName);
export const trackError = (errorMessage, errorCode = null) => analytics.trackError(errorMessage, errorCode);

export default analytics; 