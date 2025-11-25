import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Validate API key on startup
if (!GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY is not set in .env file');
    process.exit(1);
}

// ---------------------------
// API ENDPOINT FOR GEMINI
// ---------------------------
app.post('/api/generateHealth', async (req, res) => {
    try {
        const { userData } = req.body;

        if (!userData) {
            return res.status(400).json({ error: 'Missing userData' });
        }

        const prompt = `You are a friendly health and wellness advisor (NOT a medical doctor). Based on the following user information, provide personalized, non-medical but science-based health and wellness suggestions.

User Health Information:
- Full Name: ${userData.name}
- Age: ${userData.age}
- Weight: ${userData.weight}
- Height: ${userData.height}
- Existing Conditions: ${userData.conditions.length > 0 ? userData.conditions.join(", ") : "None selected"}
${userData.otherCondition ? "- Other Condition: " + userData.otherCondition : ""}
${userData.additionalInfo ? "- Additional Notes: " + userData.additionalInfo : ""}

Please provide friendly wellness suggestions in these areas:
1. **General Wellness Overview** - What positive health habits to focus on
2. **Lifestyle Recommendations** - Daily habits and activities to consider
3. **Nutrition Tips** - Simple, general dietary guidance (not medical advice)
4. **Physical Activity Suggestions** - Exercise ideas suited to the person's profile
5. **Stress Management** - Relaxation and mindfulness tips
6. **When to Consult a Professional** - General guidance on seeing a healthcare provider

Keep the tone friendly, encouraging, and supportive. Focus on general wellness, not medical diagnosis or treatment.`;

        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Gemini API error:", errorData);
            return res.status(response.status).json({ 
                error: `API Error: ${response.status} - ${response.statusText}` 
            });
        }

        const data = await response.json();

        if (data.candidates && data.candidates.length > 0) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            return res.json({ success: true, response: aiResponse });
        } else {
            return res.status(400).json({ error: 'No response generated from API' });
        }
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: `Server error: ${err.message}` });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Salud+ server running on http://localhost:${PORT}`);
    console.log(`📝 Make sure your .env file has GEMINI_API_KEY set`);
});
