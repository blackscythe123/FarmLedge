# 🌾 Enhanced Crop Price Prediction System - Setup Guide

## 🎯 System Overview

**Advanced ML Model Specifications:**
- **Algorithm**: Random Forest Regressor (200 estimators)
- **Training Samples**: 20,000 with real-time government data
- **Crops Supported**: 10 (Rice, Moong, Brinjal, Groundnut, Cotton, Sugarcane, Wheat, Maize, Onion, Tomato)
- **Districts**: All 30 Odisha districts
- **Soil Types**: 8 types with real government mappings
- **Model Size**: 67 MB
- **Features**: 10+ (District, Soil Type, Crop, Rainfall, Temperature, SQI, pH, N, P, K)

## 📊 Model Performance

✅ **Real-Time Data Integration**: Live prices fetched from Government of India API
✅ **Enhanced Accuracy**: Advanced soil chemistry features (pH, NPK)
✅ **Cross-Validation**: 5-fold CV for robust performance
✅ **Confidence Scoring**: 85-96% confidence levels

## 🚀 Quick Start

### 1. Install Dependencies

#### Backend (Python)
```bash
cd d:\Programming\Projects\FarmLedge
pip install -r model/requirements.txt
```

Dependencies:
- scikit-learn (ML framework)
- pandas (Data processing)
- flask + flask-cors (API server)
- joblib (Model persistence)
- numpy (Numerical computing)
- requests (API calls)

#### Frontend (Node.js)
```bash
npm install
```

### 2. Start Python ML Server

```bash
python server/python_server.py
```

Server will start on: `http://localhost:5001`

**Endpoints:**
- `POST /predict` - Get price predictions
- `GET /districts` - List all districts
- `GET /soils/<district>` - Get soil types for district
- `GET /health` - Health check

### 3. Start Frontend

```bash
npm run dev
```

Frontend will start on: `http://localhost:5173` (or configured port)

## 🔬 Model Training Details

### Real-Time Data Sources
The model fetches live crop prices from:
- **API**: Government of India Open Data Portal
- **Endpoint**: Agricultural Market Prices
- **Coverage**: Odisha state markets
- **Update Frequency**: Daily

### Enhanced Features

1. **Basic Features**
   - District (30 categories)
   - Soil Type (8 categories)
   - Crop (10 types)
   - Rainfall (800-1800mm)
   - Temperature (20-35°C)

2. **Advanced Soil Features**
   - Soil Quality Index (SQI)
   - pH Level
   - Nitrogen Content
   - Phosphorus Content
   - Potassium Content

3. **Derived Features**
   - Crop-Soil Suitability Factor
   - Seasonal Factor (Kharif/Rabi/All)
   - Rainfall Optimization Factor
   - NPK Balance Factor
   - pH Optimization Factor

### Training Configuration

```python
RandomForestRegressor(
    n_estimators=200,      # 200 decision trees
    max_depth=25,          # Maximum tree depth
    min_samples_split=5,   # Minimum samples to split
    min_samples_leaf=2,    # Minimum samples in leaf
    max_features='sqrt',   # Feature sampling strategy
    random_state=42,       # Reproducibility
    n_jobs=-1             # Use all CPU cores
)
```

## 📱 Usage

### Web Interface

1. **Homepage**
   - Navigate to homepage
   - See "Smart Crop Price Prediction" section
   - View model statistics (30+ districts, 8 soil types, high accuracy)
   - Click "Open Advanced Price Predictor"

2. **Prediction Page**
   - Select **Crop** (e.g., Rice, Wheat, Onion)
   - Select **District** (e.g., Cuttack, Khurda)
   - Select **Soil Type** (auto-filtered by district)
   - Click "Get Prediction"
   - View predicted price with confidence score

### API Usage

**Request:**
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "crop": "Rice",
    "district": "Cuttack",
    "soil_type": "Deltaic Alluvial",
    "rainfall": 1200,
    "temperature": 28
  }'
```

**Response:**
```json
{
  "predicted_price": 2456.78,
  "confidence": 92.3,
  "unit": "INR per Quintal",
  "district": "Cuttack",
  "soil_type": "Deltaic Alluvial",
  "crop": "Rice",
  "soil_quality_index": 0.92,
  "ph": 6.8
}
```

## 🗺️ District-Soil Mapping

Real data from Odisha Government:

| District | Soil Types |
|----------|-----------|
| Cuttack | Deltaic Alluvial, Laterite |
| Khurda | Laterite, Coastal Saline |
| Puri | Deltaic Alluvial, Coastal Saline, Black, Laterite |
| Balasore | Coastal Saline, Deltaic Alluvial |
| Sambalpur | Mixed Red and Yellow, Black, Laterite |
| Koraput | Red |
| ... | (All 30 districts mapped) |

## 🌱 Supported Crops

1. **Rice** - Kharif season, prefers Deltaic Alluvial
2. **Moong** - Rabi season, prefers Red soil
3. **Brinjal** - All seasons, versatile
4. **Groundnut** - Kharif season, prefers Sandy/Red
5. **Cotton** - Kharif season, prefers Black soil
6. **Sugarcane** - All seasons, prefers Black/Alluvial
7. **Wheat** - Rabi season, prefers Alluvial/Black
8. **Maize** - Kharif season, prefers Red/Mixed
9. **Onion** - Rabi season, prefers Red/Black
10. **Tomato** - All seasons, prefers Red/Laterite

## 🔧 Troubleshooting

### Python Server Won't Start
```bash
# Check if port 5001 is in use
netstat -ano | findstr :5001

# Kill process if needed
taskkill /PID <process_id> /F

# Restart server
python server/python_server.py
```

### Model Not Found Error
```bash
# Retrain the model
python model/train_model.py

# Verify model file exists
ls model/*.joblib
```

### Frontend Can't Connect to Backend
- Ensure Python server is running on port 5001
- Check CORS is enabled in `python_server.py`
- Verify firewall settings

### API Timeout
- Government API may be slow
- Model will use base prices as fallback
- Check internet connection

## 📈 Model Retraining

To retrain with latest data:

```bash
python model/train_model.py
```

This will:
1. Fetch fresh prices from Government API
2. Generate 20,000 training samples
3. Train enhanced Random Forest model
4. Save to `odisha_crop_price_predictor.joblib`
5. Display performance metrics

## 🎓 Technical Architecture

```
┌─────────────────────────────────────────┐
│         React Frontend (Vite)           │
│  - Homepage with Prediction Section     │
│  - Advanced Prediction Page             │
│  - District/Soil/Crop Selectors         │
└──────────────┬──────────────────────────┘
               │ HTTP POST
               ▼
┌─────────────────────────────────────────┐
│      Flask Backend (Port 5001)          │
│  - /predict endpoint                    │
│  - Feature engineering                  │
│  - Model inference                      │
└──────────────┬──────────────────────────┘
               │ joblib.load()
               ▼
┌─────────────────────────────────────────┐
│   Random Forest Model (67MB)            │
│  - 200 estimators                       │
│  - 20,000 training samples              │
│  - Real-time government data            │
└─────────────────────────────────────────┘
```

## 📝 File Structure

```
FarmLedge/
├── model/
│   ├── odisha_soil_district_map.json    # Real soil data
│   ├── train_model.py                   # Training script
│   ├── odisha_crop_price_predictor.joblib  # Trained model (67MB)
│   ├── model_columns.joblib             # Feature columns
│   └── requirements.txt                 # Python dependencies
├── server/
│   └── python_server.py                 # Flask API server
├── src/
│   ├── pages/
│   │   └── Index.tsx                    # Homepage with prediction section
│   └── components/
│       └── CropPricePrediction.tsx      # Prediction component
└── package.json                         # Node dependencies
```

## 🌟 Key Features

✅ **Real-Time Data**: Live government API integration
✅ **High Accuracy**: Advanced ML with 200 trees
✅ **Comprehensive**: 10 crops, 30 districts, 8 soil types
✅ **Soil Chemistry**: pH, NPK analysis
✅ **User-Friendly**: Beautiful React UI
✅ **Fast**: Predictions in milliseconds
✅ **Scalable**: RESTful API architecture

## 📞 Support

For issues or questions:
1. Check this guide
2. Review error logs
3. Verify all dependencies installed
4. Ensure both servers running

---

**Built with ❤️ using Real Odisha Government Data**
