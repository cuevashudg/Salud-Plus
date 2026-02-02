import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SALUD_PLUS_API_URL = process.env.AIREP_URL || 'http://localhost:3001';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validate environment on startup
function validateEnvironment() {
    if (isNaN(parseInt(PORT))) {
        console.error(`ERROR: Invalid PORT: ${PORT}`);
        process.exit(1);
    }
    try {
        new URL(SALUD_PLUS_API_URL);
    } catch (err) {
        console.error(`ERROR: Invalid AIREP_URL: ${SALUD_PLUS_API_URL}`);
        process.exit(1);
    }
    console.log(`✅ Environment validated (${NODE_ENV})`);
}

validateEnvironment();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// ---------------------------
// PROXY UTILITY FUNCTION
// ---------------------------
async function proxyToSaludPlusAPI(req, res, endpoint) {
    try {
        const { userData } = req.body;

        if (!userData) {
            return res.status(400).json({ success: false, error: 'Missing userData' });
        }

        console.log(`Forwarding ${endpoint} request to SaludPlusAPI...`);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 35000); // 35 second timeout (give SaludPlusAPI buffer)

        try {
            const response = await fetch(`${SALUD_PLUS_API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userData }),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('SaludPlusAPI error:', errorData);
                return res.status(response.status).json({ 
                    success: false,
                    error: errorData.error || `SaludPlusAPI Error: ${response.status}` 
                });
            }

            const data = await response.json();
            res.json(data);

        } catch (err) {
            clearTimeout(timeout);
            if (err.name === 'AbortError') {
                console.error("Backend request timeout");
                return res.status(503).json({ 
                    success: false,
                    error: 'Backend request timeout. Service is taking too long to respond.'
                });
            }
            throw err;
        }

    } catch (err) {
        console.error("Proxy error:", err);
        res.status(503).json({ 
            success: false,
            error: `Service unavailable: ${err.message}. Make sure SaludPlusAPI is running on ${SALUD_PLUS_API_URL}` 
        });
    }
}

// ---------------------------
// API ENDPOINTS - PROXY TO SALUDPLUSAPI
// ---------------------------
app.post('/api/generateHealth', (req, res) => proxyToSaludPlusAPI(req, res, '/api/generateHealth'));
app.post('/api/generateWorkout', (req, res) => proxyToSaludPlusAPI(req, res, '/api/generateWorkout'));
app.post('/api/generateNutrition', (req, res) => proxyToSaludPlusAPI(req, res, '/api/generateNutrition'));

// ---------------------------
// HEALTH CHECK PASS-THROUGH
// ---------------------------
app.get('/health', async (req, res) => {
    try {
        const response = await fetch(`${SALUD_PLUS_API_URL}/health`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(503).json({ 
            status: 'error',
            service: 'Salud-Plus Proxy',
            error: 'SaludPlusAPI is unavailable'
        });
    }
});

// ---------------------------
// START SERVER
// ---------------------------
app.listen(PORT, () => {
    console.log(`✅ Salud+ server running on http://localhost:${PORT}`);
    console.log(`📝 Configured to forward requests to SaludPlusAPI at ${SALUD_PLUS_API_URL}`);
});
