import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Performance metrics tracking
export const initPerformanceMonitoring = () => {
  // Core Web Vitals tracking
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
};

// Custom performance monitoring
export const measurePerformance = (name, callback) => {
  const startTime = performance.now();
  
  return new Promise((resolve) => {
    const result = callback();
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Log performance metric
    console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    
    // Send to analytics if available
    if (window.gtag) {
      window.gtag('event', 'performance', {
        event_category: 'performance',
        event_label: name,
        value: Math.round(duration)
      });
    }
    
    resolve(result);
  });
};

// Page load performance
export const trackPageLoad = (pageName) => {
  const loadTime = performance.now();
  
  // Track page load time
  console.log(`Page Load: ${pageName} loaded in ${loadTime.toFixed(2)}ms`);
  
  // Send to analytics
  if (window.gtag) {
    window.gtag('event', 'page_load', {
      event_category: 'performance',
      event_label: pageName,
      value: Math.round(loadTime)
    });
  }
};

// Component render performance
export const trackComponentRender = (componentName) => {
  const startTime = performance.now();
  
  return {
    finish: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`Component Render: ${componentName} rendered in ${duration.toFixed(2)}ms`);
      
      if (window.gtag) {
        window.gtag('event', 'component_render', {
          event_category: 'performance',
          event_label: componentName,
          value: Math.round(duration)
        });
      }
    }
  };
};

// API call performance
export const trackAPICall = (endpoint) => {
  const startTime = performance.now();
  
  return {
    finish: (success = true) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`API Call: ${endpoint} took ${duration.toFixed(2)}ms (${success ? 'success' : 'error'})`);
      
      if (window.gtag) {
        window.gtag('event', 'api_call', {
          event_category: 'performance',
          event_label: endpoint,
          value: Math.round(duration),
          success: success
        });
      }
    }
  };
};

// Memory usage monitoring
export const trackMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = performance.memory;
    console.log('Memory Usage:', {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
    });
  }
};

// Bundle size monitoring
export const trackBundleSize = () => {
  // Track initial bundle load time
  const navigationStart = performance.getEntriesByType('navigation')[0];
  if (navigationStart) {
    const bundleLoadTime = navigationStart.loadEventEnd - navigationStart.loadEventStart;
    console.log(`Bundle Load Time: ${bundleLoadTime.toFixed(2)}ms`);
  }
};

// User interaction performance
export const trackUserInteraction = (action, element) => {
  const startTime = performance.now();
  
  return {
    finish: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`User Interaction: ${action} took ${duration.toFixed(2)}ms`);
      
      if (window.gtag) {
        window.gtag('event', 'user_interaction', {
          event_category: 'performance',
          event_label: action,
          value: Math.round(duration)
        });
      }
    }
  };
};

export default {
  initPerformanceMonitoring,
  measurePerformance,
  trackPageLoad,
  trackComponentRender,
  trackAPICall,
  trackMemoryUsage,
  trackBundleSize,
  trackUserInteraction
}; 