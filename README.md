# Salud-Plus

A web application that provides personalized, AI-generated health and wellness guidance. Built with a modern microservices architecture, Salud-Plus separates the frontend/backend proxy layer from the AI service layer for better scalability and maintainability.

## 🎯 Features

- **AI-Powered Health Plans** - Get personalized wellness guidance using Google's Gemini API
- **Responsive Design** - Mobile-friendly interface for easy access
- **Plan History** - Track your wellness plans and progress over time
- **Multiple Health Metrics** - Support for weight, height, age, health conditions, and more
- **Microservices Architecture** - Separate frontend and AI service for flexibility
- **Results Page** - Clean dedicated page for displaying AI-generated recommendations

## 📋 Prerequisites

- Node.js v14 or higher
- npm or yarn
- [SaludPlusAPI](https://github.com/cuevashudg/SaludPlusAPI) running on port 3001

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/cuevashudg/Salud-Plus.git
cd Salud-Plus
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
AIREP_URL=http://localhost:3001
```

### 4. Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

You should see:
```
✅ Salud+ server running on http://localhost:3000
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📚 Project Structure

```
Salud-Plus/
├── index.html          # Home page
├── index.js            # Home page logic
├── index.css           # Home page styles
├── LoggedIn.html       # Health plan creation form
├── loggedIn.js         # Form logic and API calls
├── loggedIn.css        # Form styles
├── results.html        # Results display page
├── results.js          # Results page logic
├── server.js           # Express backend & proxy
├── package.json        # Dependencies and scripts
├── .env                # Environment configuration
└── README.md           # This file
```

## 🏗️ Architecture

```
┌─────────────────────────┐
│   Browser (Frontend)    │
└───────────┬─────────────┘
            │
            ▼
┌──────────────────────────────┐
│ Salud-Plus Backend (3000)    │
│ - Static file serving        │
│ - Request proxy              │
│ - Request validation         │
└───────────┬──────────────────┘
            │
            ▼
┌──────────────────────────────┐
│ SaludPlusAPI Service (3001)  │
│ - Health guidance            │
│ - Workout recommendations    │
│ - Nutrition advice           │
└───────────┬──────────────────┘
            │
            ▼
┌──────────────────────────────┐
│    Google Gemini API         │
└──────────────────────────────┘
```

## 🔄 Application Flow

1. **Home Page** (`index.html`) - Landing page with features overview
2. **Create Plan** (`LoggedIn.html`) - User enters health information:
   - Name, age, weight, height
   - Existing health conditions
   - Additional health notes
3. **API Call** - Form data sent to `/api/generateHealth` endpoint
4. **Results** (`results.html`) - AI-generated personalized wellness plan displayed

## 📡 API Endpoints (Proxy)

All endpoints forward requests to SaludPlusAPI running on port 3001.

### Health Guidance
**Endpoint:** `POST /api/generateHealth`

Creates a personalized wellness plan based on user health profile.

**Request:**
```json
{
  "userData": {
    "name": "John Doe",
    "age": 30,
    "weight": "180",
    "height": "5'10\"",
    "conditions": ["diabetes", "hypertension"],
    "otherCondition": "",
    "additionalInfo": "Sedentary lifestyle"
  }
}
```

**Response:**
```json
{
  "success": true,
  "response": "Personalized health guidance..."
}
```

### Workout Recommendations
**Endpoint:** `POST /api/generateWorkout`

**Request:**
```json
{
  "userData": {
    "name": "Jane Smith",
    "age": 28,
    "weight": "130",
    "height": "5'6\"",
    "fitnessLevel": "beginner",
    "goals": "weight loss",
    "limitations": "knee pain"
  }
}
```

### Nutrition Advice
**Endpoint:** `POST /api/generateNutrition`

**Request:**
```json
{
  "userData": {
    "name": "Alex Johnson",
    "age": 35,
    "weight": "200",
    "height": "6'0\"",
    "dietaryPreferences": "vegetarian",
    "conditions": ["high cholesterol"],
    "nutritionGoals": "heart health"
  }
}
```

## 🛠️ Development

### Running Both Services

**Terminal 1 - Start SaludPlusAPI (AI Service):**
```bash
cd ../SaludPlusAPI
npm run dev
```

**Terminal 2 - Start Salud-Plus (Backend & Frontend):**
```bash
npm run dev
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Port for Salud-Plus server |
| `AIREP_URL` | http://localhost:3001 | URL of SaludPlusAPI service |

### Debugging

Check browser console for frontend errors:
- Press `F12` to open Developer Tools
- Check **Console** tab for JavaScript errors
- Check **Network** tab to inspect API calls

Check server logs in terminal for backend errors.

## 🔗 Dependencies

- **express** - Web framework for Node.js
- **cors** - Enable Cross-Origin Resource Sharing
- **dotenv** - Load environment variables from .env file

## 📦 SaludPlusAPI Integration

This project requires [SaludPlusAPI](https://github.com/cuevashudg/SaludPlusAPI) to be running.

**Key points:**
- SaludPlusAPI must be running on port 3001 (configurable via `.env`)
- SaludPlusAPI requires a valid `GEMINI_API_KEY` in its `.env` file
- Salud-Plus acts as a proxy, forwarding requests to SaludPlusAPI

## 🚨 Troubleshooting

### "Service unavailable" error
**Problem:** Salud-Plus can't connect to SaludPlusAPI

**Solutions:**
1. Make sure SaludPlusAPI is running on port 3001
2. Check `AIREP_URL` in `.env` file
3. Verify both services are in the same directory structure

### "GEMINI_API_KEY not set" error
**Problem:** SaludPlusAPI can't connect to Google Gemini API

**Solutions:**
1. Check SaludPlusAPI's `.env` file has valid `GEMINI_API_KEY`
2. Get API key from [Google AI Studio](https://aistudio.google.com)
3. Restart SaludPlusAPI after adding key

### Port already in use
**Problem:** Port 3000 or 3001 is already in use

**Solutions:**
1. Change `PORT` in `.env` file
2. Or kill the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

### CORS errors
**Problem:** Browser blocks requests due to CORS policy

**Solution:** This should be handled by the CORS middleware in both services. If issues persist:
1. Check both services have `cors()` enabled
2. Verify `AIREP_URL` matches actual service URL

## 🔮 Future Enhancements

- User account creation and authentication
- Persistent user profiles and plan history
- Database integration for saving plans
- Advanced health metrics tracking
- Integration with fitness tracking devices
- Meal planning with recipes
- Integrating a photo input option

## 📝 Notes

- Currently designed for demonstration purposes
- AI guidance is **not a substitute for professional medical advice**
- User data is stored in browser localStorage (not persistent)

## 📄 License

Private - Salud+ Project

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code follows existing style conventions
- All API endpoints work correctly
- Frontend remains responsive and accessible

---

**Need help?** Check the [SaludPlusAPI documentation](https://github.com/cuevashudg/SaludPlusAPI) or create an issue on GitHub.
