const express = require('express');
const router = express.Router();

// OpenRouteService API configuration
const ORS_API_KEY = process.env.ORS_API_KEY || '';
const ORS_BASE_URL = 'https://api.openrouteservice.org/v2/directions/driving-car';

/**
 * POST /api/get-route
 * Secure proxy endpoint for OpenRouteService routing API
 * Hides API key from client-side code
 */
router.post('/get-route', async (req, res) => {
    try {
        const { start, end } = req.body;

        // Validate input
        if (!start || !end || !Array.isArray(start) || !Array.isArray(end)) {
            return res.status(400).json({ 
                error: 'Invalid request. Please provide start and end coordinates as [lng, lat] arrays.' 
            });
        }

        if (!ORS_API_KEY) {
            return res.status(500).json({ 
                error: 'ORS API key not configured. Please set ORS_API_KEY in environment variables.' 
            });
        }

        // Prepare request to OpenRouteService
        const orsRequest = {
            coordinates: [start, end]
        };

        // Call OpenRouteService API
        const response = await fetch(ORS_BASE_URL, {
            method: 'POST',
            headers: {
                'Authorization': ORS_API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
            },
            body: JSON.stringify(orsRequest)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('ORS API Error:', errorData);
            return res.status(response.status).json({ 
                error: errorData.error || 'Failed to calculate route from OpenRouteService',
                details: errorData
            });
        }

        const data = await response.json();

        // Return the route data to client
        res.json({
            routes: data.routes,
            metadata: data.metadata
        });

    } catch (error) {
        console.error('Route calculation error:', error);
        res.status(500).json({ 
            error: 'Internal server error while calculating route',
            message: error.message 
        });
    }
});

module.exports = router;
