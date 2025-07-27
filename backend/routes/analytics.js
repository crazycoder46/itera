const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Google Analytics 4 Measurement Protocol endpoint
router.post('/track', async (req, res) => {
  try {
    const { client_id, events } = req.body;
    
    if (!client_id || !events || !Array.isArray(events)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid analytics data' 
      });
    }

    // Forward to Google Analytics 4
    const GA_TRACKING_ID = 'G-6957MVS7HL';
    const GA_API_SECRET = 'X1ZQ7NyYQIW5VsKbrex';
    const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';
    
    // Send to Google Analytics 4
    const response = await fetch(`${GA_ENDPOINT}?measurement_id=${GA_TRACKING_ID}&api_secret=${GA_API_SECRET}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      console.warn('Google Analytics forwarding failed:', response.status);
    } else {
      console.log('Analytics Event sent to GA4:', {
        client_id,
        events: events.length,
        timestamp: new Date().toISOString()
      });
    }

    res.json({ 
      success: true, 
      message: 'Analytics event logged successfully' 
    });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Analytics tracking failed' 
    });
  }
});

module.exports = router; 