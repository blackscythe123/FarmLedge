# React Frontend Integration Guide

## 🚀 Quick Setup

### 1. Copy Files to Your React Project

```bash
# Copy these files to your React src folder:
- CropPricePrediction.jsx  → src/components/
- CropPricePrediction.css  → src/components/
- seasonality_database.json → src/data/
```

### 2. Install Dependencies (if needed)

```bash
# No extra dependencies needed! Uses native fetch API
```

### 3. Use the Component

```jsx
// App.jsx
import CropPricePrediction from './components/CropPricePrediction';
import './components/CropPricePrediction.css';

function App() {
  return (
    <div className="App">
      <CropPricePrediction />
    </div>
  );
}

export default App;
```

---

## 📦 How It Works

### Frontend-Only Architecture

```
User selects crop
    ↓
Load seasonality from JSON (imported)
    ↓
Get today's date → Calculate seasonal factor
    ↓
Fetch recent prices from Gov API (client-side)
    ↓
Calculate: prediction = recent_price × seasonal_factor
    ↓
Display result
```

### Advantages:
✅ **No backend needed** - Pure React  
✅ **Fast** - JSON loaded once, calculations instant  
✅ **Simple** - Just import and use  
✅ **Cheap** - Deploy as static site (Netlify/Vercel)  

---

## 🔧 Customization

### Change API Key Location
If you want to hide the API key, create `.env`:

```env
# .env
REACT_APP_GOV_API_KEY=579b464db66ec23bdd000001e6d6fb1e05a94ea57b21c49b416acd07
```

Then in component:
```jsx
const API_KEY = process.env.REACT_APP_GOV_API_KEY;
```

### Add More States
Currently hardcoded to "Odisha". To add more:

1. Run `precompute_seasonality.py` for each state
2. Merge JSON files or create separate files
3. Add state selector in component

### Customize Styling
Edit `CropPricePrediction.css` to match your design system.

---

## 🎨 Component Features

- ✅ Auto-prediction on crop change
- ✅ Loading states
- ✅ Error handling
- ✅ Beautiful gradient card design
- ✅ Responsive (mobile-friendly)
- ✅ Shows price change percentage
- ✅ Displays seasonal factor
- ✅ Shows data source info

---

## 📊 Data Flow

```javascript
// 1. Import JSON (build time)
import seasonalityData from './seasonality_database.json';

// 2. Get seasonal factor (instant)
const factor = getSeasonalityFactor('Onion'); // 0.990

// 3. Fetch recent price (async, ~500ms)
const recentPrice = await fetchRecentPrice('Onion'); // ₹2162

// 4. Calculate (instant)
const prediction = recentPrice * factor; // ₹2140
```

---

## ⚠️ Important Notes

### API Key Exposure
The government API key is visible in frontend code. This is **acceptable** because:
- It's a public government API
- No sensitive data
- Rate limits are per-key (not per-user)

If you're concerned, use **Option 2** (Node.js backend).

### JSON Size
- File size: 112 KB
- Gzipped: ~20 KB
- Load time: < 100ms on 3G

This is **very small** and won't impact performance.

### Browser Compatibility
Uses modern JavaScript:
- `fetch` API
- ES6 syntax
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)

---

## 🚀 Deployment

### Netlify/Vercel (Recommended)
```bash
# Build your React app
npm run build

# Deploy (auto-detects React)
netlify deploy --prod
# or
vercel --prod
```

### GitHub Pages
```bash
# Add to package.json
"homepage": "https://yourusername.github.io/crop-prediction"

# Deploy
npm run build
npm run deploy
```

---

## 🔄 Updating Data

When you get new crop data:

```bash
# 1. Update CSV files
# 2. Re-run precompute script
python precompute_seasonality.py

# 3. Copy new JSON to React
cp seasonality_database.json your-react-app/src/data/

# 4. Rebuild and redeploy
npm run build
```

---

## 💡 Alternative: Node.js Backend

If you prefer a backend (to hide API key):

```javascript
// server.js (Node.js + Express)
const express = require('express');
const seasonalityData = require('./seasonality_database.json');

const app = express();

app.get('/api/predict', async (req, res) => {
  const { crop } = req.query;
  // Same logic as React component
  // But API key is hidden server-side
});

app.listen(3001);
```

Then in React:
```javascript
// Just call your backend
const response = await fetch('/api/predict?crop=Onion');
```

---

## 📝 Summary

**Recommendation: Use Frontend-Only**
- Simpler
- Faster
- Cheaper
- No backend maintenance

The calculation is trivial (just multiplication), so there's no benefit to doing it server-side!
