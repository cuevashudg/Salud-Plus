import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// ---------------------------
// API ENDPOINT - PROXY TO AIREP
// ---------------------------
const AIREP_BASE_URL = process.env.AIREP_URL || 'http://localhost:3001';

// Health Guidance - Forward to AIrep
app.post('/api/generateHealth', async (req, res) => {
    try {
        const { userData } = req.body;

        if (!userData) {
            return res.status(400).json({ success: false, error: 'Missing userData' });
        }

        console.log('Forwarding health request to AIrep...');

        const response = await fetch(`${AIREP_BASE_URL}/api/generateHealth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userData })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('AIrep error:', errorData);
            return res.status(response.status).json({ 
                success: false,
                error: errorData.error || `AIrep Error: ${response.status}` 
            });
        }

        const data = await response.json();
        res.json(data);

    } catch (err) {
        console.error("Proxy error:", err);
        res.status(503).json({ 
            success: false,
            error: `Service unavailable: ${err.message}. Make sure AIrep is running on ${AIREP_BASE_URL}` 
        });
    }
});

// Workout Recommendations - Forward to AIrep
app.post('/api/generateWorkout', async (req, res) => {
    try {
        const { userData } = req.body;

        if (!userData) {
            return res.status(400).json({ success: false, error: 'Missing userData' });
        }

        console.log('Forwarding workout request to AIrep...');

        const response = await fetch(`${AIREP_BASE_URL}/api/generateWorkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userData })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('AIrep error:', errorData);
            return res.status(response.status).json({ 
                success: false,
                error: errorData.error || `AIrep Error: ${response.status}` 
            });
        }

        const data = await response.json();
        res.json(data);

    } catch (err) {
        console.error("Proxy error:", err);
        res.status(503).json({ 
            success: false,
            error: `Service unavailable: ${err.message}. Make sure AIrep is running on ${AIREP_BASE_URL}` 
        });
    }
});

// Nutrition Advice - Forward to AIrep
app.post('/api/generateNutrition', async (req, res) => {
    try {
        const { userData } = req.body;

        if (!userData) {
            return res.status(400).json({ success: false, error: 'Missing userData' });
        }

        console.log('Forwarding nutrition request to AIrep...');

        const response = await fetch(`${AIREP_BASE_URL}/api/generateNutrition`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userData })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('AIrep error:', errorData);
            return res.status(response.status).json({ 
                success: false,
                error: errorData.error || `AIrep Error: ${response.status}` 
            });
        }

        const data = await response.json();
        res.json(data);

    } catch (err) {
        console.error("Proxy error:", err);
        res.status(503).json({ 
            success: false,
            error: `Service unavailable: ${err.message}. Make sure AIrep is running on ${AIREP_BASE_URL}` 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Salud+ server running on http://localhost:${PORT}`);
    console.log(`📝 Make sure your .env file has GEMINI_API_KEY set`);
});
