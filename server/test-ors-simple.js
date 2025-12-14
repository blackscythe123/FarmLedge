// Simple ORS API test
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.ORS_API_KEY;

console.log('API Key present:', !!API_KEY);
console.log('API Key length:', API_KEY?.length);
console.log('API Key preview:', API_KEY?.substring(0, 20) + '...');

const testRoute = async () => {
  // Use coordinates on actual roads in Odisha
  // Bhubaneswar Railway Station to Puri
  const coords = [
    [85.8245, 20.2700], // Bhubaneswar
    [85.8315, 19.8135]  // Puri
  ];
  
  console.log('\nTesting route:');
  console.log('  From: Bhubaneswar [85.8245, 20.2700]');
  console.log('  To: Puri [85.8315, 19.8135]');
  console.log('Format: [longitude, latitude]');
  
  try {
    // ORS v2 endpoint - no format suffix needed
    const url = 'https://api.openrouteservice.org/v2/directions/driving-car';
    
    console.log('URL:', url);
    
    const body = { coordinates: coords };
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response preview:', text.substring(0, 300));
    
    if (res.ok) {
      const data = JSON.parse(text);
      const route = data.routes[0];
      const dist = (route.summary.distance / 1000).toFixed(1);
      const time = Math.round(route.summary.duration / 60);
      console.log('\n✅ SUCCESS!');
      console.log('Distance:', dist, 'km');
      console.log('Time:', time, 'min');
      console.log('Coordinates in route:', route.geometry.coordinates.length);
    } else {
      console.log('\n❌ FAILED');
      try {
        const err = JSON.parse(text);
        console.log('Error details:', JSON.stringify(err, null, 2));
      } catch (e) {
        console.log('Raw error:', text);
      }
    }
  } catch (err) {
    console.error('Exception:', err.message);
  }
};

testRoute();
