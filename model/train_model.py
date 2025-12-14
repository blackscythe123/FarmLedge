import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import joblib
import json
import os
import requests
from datetime import datetime, timedelta

# Load Real Map
script_dir = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(script_dir, 'odisha_soil_district_map.json'), 'r') as f:
    soil_map = json.load(f)

# Enhanced Crop Database with Real Market Data
CROPS = {
    "Rice": {"base": 2200, "soil_pref": ["Deltaic Alluvial", "Mixed Red and Yellow"], "rain_needs": "High", "season": "Kharif"},
    "Moong": {"base": 7500, "soil_pref": ["Red", "Mixed Red and Black"], "rain_needs": "Low", "season": "Rabi"},
    "Brinjal": {"base": 3000, "soil_pref": ["Loamy", "Sandy Loam", "Alluvial", "Red"], "rain_needs": "Medium", "season": "All"},
    "Groundnut": {"base": 6000, "soil_pref": ["Sandy", "Red", "Laterite"], "rain_needs": "Medium", "season": "Kharif"},
    "Cotton": {"base": 6500, "soil_pref": ["Black", "Red"], "rain_needs": "Low", "season": "Kharif"},
    "Sugarcane": {"base": 3500, "soil_pref": ["Black", "Alluvial", "Deltaic Alluvial"], "rain_needs": "High", "season": "All"},
    "Wheat": {"base": 2400, "soil_pref": ["Alluvial", "Black"], "rain_needs": "Medium", "season": "Rabi"},
    "Maize": {"base": 2000, "soil_pref": ["Red", "Mixed Red and Yellow"], "rain_needs": "Medium", "season": "Kharif"},
    "Onion": {"base": 2500, "soil_pref": ["Red", "Black"], "rain_needs": "Medium", "season": "Rabi"},
    "Onion-Bhima Super": {"base": 2600, "soil_pref": ["Red", "Black"], "rain_needs": "Medium", "season": "Rabi"},
    "Onion-bhima shweta": {"base": 2550, "soil_pref": ["Red", "Black"], "rain_needs": "Medium", "season": "Rabi"},
    "Tomato": {"base": 2800, "soil_pref": ["Red", "Laterite"], "rain_needs": "Medium", "season": "All"}
}

# Enhanced Soil Quality Index with pH and nutrient factors
SOIL_SCORES = {
    "Deltaic Alluvial": {"sqi": 0.92, "ph": 6.8, "n": 0.85, "p": 0.80, "k": 0.75},
    "Coastal Saline": {"sqi": 0.45, "ph": 8.2, "n": 0.40, "p": 0.35, "k": 0.50},
    "Black": {"sqi": 0.88, "ph": 7.5, "n": 0.75, "p": 0.85, "k": 0.90},
    "Red": {"sqi": 0.72, "ph": 6.0, "n": 0.60, "p": 0.55, "k": 0.65},
    "Laterite": {"sqi": 0.58, "ph": 5.5, "n": 0.50, "p": 0.45, "k": 0.55},
    "Mixed Red and Yellow": {"sqi": 0.78, "ph": 6.2, "n": 0.70, "p": 0.65, "k": 0.70},
    "Mixed Red and Black": {"sqi": 0.82, "ph": 6.8, "n": 0.75, "p": 0.75, "k": 0.80},
    "Brown Forest": {"sqi": 0.68, "ph": 5.8, "n": 0.65, "p": 0.60, "k": 0.62}
}

def fetch_real_time_prices():
    """Fetch real-time crop prices from Government API"""
    API_KEY = '579b464db66ec23bdd000001e6d6fb1e05a94ea57b21c49b416acd07'
    BASE_URL = 'https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24'
    
    real_prices = {}
    print("Fetching real-time market prices from Government API...")
    
    for crop in CROPS.keys():
        try:
            params = {
                'api-key': API_KEY,
                'format': 'json',
                'limit': '50',
                'filters[Commodity]': crop,
                'filters[State]': 'Odisha',
                'sort[Arrival_Date]': 'desc'
            }
            
            response = requests.get(BASE_URL, params=params, timeout=5)
            data = response.json()
            
            if data.get('records'):
                prices = [float(r['Modal_Price']) for r in data['records'] 
                         if r.get('Modal_Price') and float(r['Modal_Price']) > 0]
                if prices:
                    real_prices[crop] = np.mean(prices[:20])  # Average of recent 20
                    print(f"  ✓ {crop}: ₹{real_prices[crop]:.2f}/quintal (live data)")
        except Exception as e:
            print(f"  ⚠ {crop}: Using base price (API error: {str(e)[:50]})")
            real_prices[crop] = CROPS[crop]['base']
    
    return real_prices

def generate_enhanced_data(n_samples=15000, use_real_prices=True):
    """Generate enhanced training data with real-time prices and advanced features"""
    data = []
    districts = list(soil_map.keys())
    
    # Fetch real-time prices
    real_prices = fetch_real_time_prices() if use_real_prices else {}
    
    # Current season
    month = datetime.now().month
    if month in [6, 7, 8, 9, 10]:
        current_season = "Kharif"
    elif month in [11, 12, 1, 2, 3]:
        current_season = "Rabi"
    else:
        current_season = "All"
    
    for _ in range(n_samples):
        district = np.random.choice(districts)
        soil_type = np.random.choice(soil_map[district])
        crop = np.random.choice(list(CROPS.keys()))
        
        # Enhanced Features
        rainfall = np.random.uniform(800, 1800)  # mm
        temperature = np.random.uniform(20, 35)  # Celsius
        
        # Soil properties
        soil_props = SOIL_SCORES.get(soil_type, {"sqi": 0.7, "ph": 6.5, "n": 0.6, "p": 0.6, "k": 0.6})
        sqi = soil_props["sqi"]
        ph = soil_props["ph"]
        nitrogen = soil_props["n"]
        phosphorus = soil_props["p"]
        potassium = soil_props["k"]
        
        # Crop-Soil Suitability
        pref_soils = CROPS[crop]["soil_pref"]
        is_suitable = any(s in soil_type for s in pref_soils) or soil_type in pref_soils
        suitability_factor = 1.25 if is_suitable else 0.85
        
        # Season factor
        crop_season = CROPS[crop]["season"]
        season_factor = 1.15 if (crop_season == current_season or crop_season == "All") else 0.90
        
        # Base price (use real-time if available)
        base_price = real_prices.get(crop, CROPS[crop]["base"])
        
        # Advanced Price Calculation
        # Price = Base × SQI × Suitability × Season × Rainfall_Factor × NPK_Factor + Market_Noise
        rainfall_factor = 1.0 + (rainfall - 1200) / 5000  # Optimal around 1200mm
        npk_factor = (nitrogen + phosphorus + potassium) / 3
        ph_factor = 1.0 - abs(ph - 6.5) / 10  # Optimal pH around 6.5
        
        market_volatility = np.random.normal(0, base_price * 0.08)  # 8% volatility
        
        price = (base_price * sqi * suitability_factor * season_factor * 
                rainfall_factor * npk_factor * ph_factor) + market_volatility
        
        # Ensure positive price
        price = max(price, base_price * 0.5)
        
        data.append({
            "District": district,
            "Soil_Type": soil_type,
            "Crop": crop,
            "Rainfall": rainfall,
            "Temperature": temperature,
            "Soil_Quality_Index": sqi,
            "pH": ph,
            "Nitrogen": nitrogen,
            "Phosphorus": phosphorus,
            "Potassium": potassium,
            "Price": round(price, 2)
        })
    
    return pd.DataFrame(data)

if __name__ == "__main__":
    print("=" * 70)
    print("ENHANCED CROP PRICE PREDICTION MODEL TRAINING")
    print("=" * 70)
    print("\nGenerating enhanced dataset with real-time government data...")
    
    df = generate_enhanced_data(20000, use_real_prices=True)
    
    print(f"\n✓ Generated {len(df)} training samples")
    print(f"✓ Features: {df.columns.tolist()}")
    
    # Preprocessing
    feature_cols = ["District", "Soil_Type", "Crop", "Rainfall", "Temperature", 
                   "Soil_Quality_Index", "pH", "Nitrogen", "Phosphorus", "Potassium"]
    X = df[feature_cols]
    Y = df["Price"]
    
    # One-Hot Encoding
    X_encoded = pd.get_dummies(X)
    
    # Save column names
    model_columns = list(X_encoded.columns)
    joblib.dump(model_columns, os.path.join(script_dir, 'model_columns.joblib'))
    
    # Train-Test Split
    X_train, X_test, Y_train, Y_test = train_test_split(X_encoded, Y, test_size=0.15, random_state=42)
    
    print("\n" + "=" * 70)
    print("TRAINING ADVANCED RANDOM FOREST MODEL")
    print("=" * 70)
    
    # Enhanced Random Forest with optimized parameters
    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=25,
        min_samples_split=5,
        min_samples_leaf=2,
        max_features='sqrt',
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, Y_train)
    
    # Evaluation
    predictions = model.predict(X_test)
    r2 = r2_score(Y_test, predictions)
    mae = mean_absolute_error(Y_test, predictions)
    rmse = np.sqrt(mean_squared_error(Y_test, predictions))
    
    # Cross-validation
    cv_scores = cross_val_score(model, X_encoded, Y, cv=5, scoring='r2')
    
    print(f"\n{'PERFORMANCE METRICS':^70}")
    print("=" * 70)
    print(f"  R² Score:              {r2:.4f} ({r2*100:.2f}% accuracy)")
    print(f"  Mean Absolute Error:   ₹{mae:.2f}")
    print(f"  Root Mean Squared Error: ₹{rmse:.2f}")
    print(f"  Cross-Validation R²:   {cv_scores.mean():.4f} (±{cv_scores.std():.4f})")
    print("=" * 70)
    
    # Feature Importance
    feature_importance = pd.DataFrame({
        'feature': X_encoded.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print(f"\n{'TOP 10 IMPORTANT FEATURES':^70}")
    print("=" * 70)
    for idx, row in feature_importance.head(10).iterrows():
        print(f"  {row['feature']:<50} {row['importance']:.4f}")
    print("=" * 70)
    
    # Save model
    joblib.dump(model, os.path.join(script_dir, 'odisha_crop_price_predictor.joblib'))
    
    print(f"\n✓ Model saved to 'odisha_crop_price_predictor.joblib'")
    print(f"✓ Ready for deployment!")
    print("=" * 70)

