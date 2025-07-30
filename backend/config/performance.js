const performanceNow = require('performance-now');

// Performance monitoring middleware
const performanceMiddleware = (req, res, next) => {
  const startTime = performanceNow();
  
  // Add performance tracking to response
  res.on('finish', () => {
    const endTime = performanceNow();
    const duration = endTime - startTime;
    
    console.log(`API Performance: ${req.method} ${req.path} took ${duration.toFixed(2)}ms`);
    
    // Add performance header only if headers not sent
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
    }
  });
  
  next();
};

// Database query performance monitoring
const monitorQuery = (query, params = []) => {
  const startTime = performanceNow();
  
  return {
    finish: () => {
      const endTime = performanceNow();
      const duration = endTime - startTime;
      
      console.log(`Database Query: ${query.substring(0, 50)}... took ${duration.toFixed(2)}ms`);
      
      return duration;
    }
  };
};

// API endpoint performance monitoring
const monitorEndpoint = (method, path) => {
  const startTime = performanceNow();
  
  return {
    finish: (success = true) => {
      const endTime = performanceNow();
      const duration = endTime - startTime;
      
      console.log(`Endpoint Performance: ${method} ${path} took ${duration.toFixed(2)}ms (${success ? 'success' : 'error'})`);
      
      return duration;
    }
  };
};

// Memory usage monitoring
const trackMemoryUsage = () => {
  const memUsage = process.memoryUsage();
  
  console.log('Memory Usage:', {
    rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
    external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
  });
  
  return memUsage;
};

// CPU usage monitoring
const trackCPUUsage = () => {
  const startUsage = process.cpuUsage();
  
  return {
    finish: () => {
      const endUsage = process.cpuUsage(startUsage);
      
      console.log('CPU Usage:', {
        user: Math.round(endUsage.user / 1000) + 'ms',
        system: Math.round(endUsage.system / 1000) + 'ms',
        total: Math.round((endUsage.user + endUsage.system) / 1000) + 'ms'
      });
      
      return endUsage;
    }
  };
};

// Response time monitoring
const trackResponseTime = (req, res, next) => {
  const startTime = performanceNow();
  
  res.on('finish', () => {
    const endTime = performanceNow();
    const duration = endTime - startTime;
    
    // Log response time
    console.log(`Response Time: ${req.method} ${req.path} - ${duration.toFixed(2)}ms`);
    
    // Add to response headers only if headers not sent
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
    }
  });
  
  next();
};

// Database connection performance
const monitorDatabaseConnection = () => {
  const startTime = performanceNow();
  
  return {
    finish: (success = true) => {
      const endTime = performanceNow();
      const duration = endTime - startTime;
      
      console.log(`Database Connection: ${success ? 'success' : 'error'} in ${duration.toFixed(2)}ms`);
      
      return duration;
    }
  };
};

// File upload performance
const monitorFileUpload = (fileSize) => {
  const startTime = performanceNow();
  
  return {
    finish: (success = true) => {
      const endTime = performanceNow();
      const duration = endTime - startTime;
      
      const speed = fileSize / (duration / 1000); // bytes per second
      
      console.log(`File Upload: ${(fileSize / 1024 / 1024).toFixed(2)}MB in ${duration.toFixed(2)}ms (${(speed / 1024 / 1024).toFixed(2)}MB/s)`);
      
      return { duration, speed };
    }
  };
};

// Performance metrics collection
const collectMetrics = () => {
  const metrics = {
    timestamp: new Date().toISOString(),
    memory: trackMemoryUsage(),
    uptime: process.uptime(),
    pid: process.pid,
    version: process.version,
    platform: process.platform
  };
  
  return metrics;
};

module.exports = {
  performanceMiddleware,
  monitorQuery,
  monitorEndpoint,
  trackMemoryUsage,
  trackCPUUsage,
  trackResponseTime,
  monitorDatabaseConnection,
  monitorFileUpload,
  collectMetrics
}; 