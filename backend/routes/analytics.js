const express = require('express');
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
    const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';
    
    // For now, we'll just log the events
    // In production, you would need an API secret from Google Analytics
    console.log('Analytics Event:', {
      client_id,
      events,
      timestamp: new Date().toISOString()
    });

    // TODO: Implement actual GA4 forwarding with API secret
    // const response = await fetch(`${GA_ENDPOINT}?measurement_id=${GA_TRACKING_ID}&api_secret=YOUR_API_SECRET`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(req.body)
    // });

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