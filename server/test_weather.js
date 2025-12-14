import axios from 'axios';

// Test weather API endpoint
const testWeather = async () => {
  try {
    console.log('Testing weather API...');
    
    // Coordinates for Bhubaneswar, Odisha
    const lat = 20.2961;
    const lon = 85.8245;
    
    const response = await axios.get(`http://localhost:3001/api/weather/current`, {
      params: { lat, lon, lang: 'en' }
    });
    
    console.log('\n✅ Weather API Response:');
    console.log('Status:', response.status);
    console.log('OK:', response.data.ok);
    console.log('\nWeather Data Structure:');
    console.log('- Has current:', !!response.data.weather?.current);
    console.log('- Current keys:', Object.keys(response.data.weather?.current || {}));
    
    if (response.data.weather?.current?.main) {
      console.log('\nMain Weather Data:');
      console.log('  - Temperature:', response.data.weather.current.main.temp, '°C');
      console.log('  - Feels Like:', response.data.weather.current.main.feels_like, '°C');
      console.log('  - Humidity:', response.data.weather.current.main.humidity, '%');
      console.log('  - Pressure:', response.data.weather.current.main.pressure, 'hPa');
    }
    
    if (response.data.weather?.current?.wind) {
      console.log('\nWind Data:');
      console.log('  - Speed:', response.data.weather.current.wind.speed, 'm/s');
    }
    
    if (response.data.weather?.current?.visibility) {
      console.log('\nVisibility:', response.data.weather.current.visibility, 'm');
    }
    
    if (response.data.weather?.current?.weather) {
      console.log('\nCondition:', response.data.weather.current.weather[0]?.main);
      console.log('Description:', response.data.weather.current.weather[0]?.description);
    }
    
    console.log('\nAlerts:', response.data.alerts?.length || 0, 'active');
    if (response.data.alerts?.length > 0) {
      response.data.alerts.forEach((alert, i) => {
        console.log(`  ${i+1}. [${alert.severity}] ${alert.alertType}: ${alert.message}`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Error testing weather API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
};

testWeather();
