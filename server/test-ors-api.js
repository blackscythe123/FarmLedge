// Test script for OpenRouteService API
// Run with: node test-ors-api.js

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

const API_KEY = process.env.ORS_API_KEY || '';

async function testORS() {
  console.log('Testing OpenRouteService API...\n');
  console.log('Loading .env from:', path.resolve(__dirname, '.env'));
  
  if (!API_KEY || API_KEY.trim() === '') {
    console.error('❌ ERROR: ORS_API_KEY not set in .env file!');
    console.log('\nTo fix:');
    console.log('1. Sign up at https://openrouteservice.org/');
    console.log('2. Get your free API key');
    console.log('3. Add to server/.env: ORS_API_KEY=your_key_here');
    console.log('4. Run this test again: node test-ors-api.js');
    process.exit(1);
  }
  
  // Test coordinates: Bhubaneswar to Puri (on actual roads)
  const start = [85.8245, 20.2700]; // Bhubaneswar Railway Station area
  const end = [85.8315, 19.8135];   // Puri
  
  console.log('Test route:');
  console.log('  Start: Bhubaneswar', start);
  console.log('  End: Puri', end);
  console.log('  API Key:', API_KEY.substring(0, 10) + '...\n');
  
  try {
    const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        coordinates: [start, end]
      })
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      
      if (response.status === 401) {
        console.log('\n⚠️  Authentication failed - check your API key');
      } else if (response.status === 403) {
        console.log('\n⚠️  Access forbidden - check API key permissions');
      } else if (response.status === 429) {
        console.log('\n⚠️  Rate limit exceeded - wait a moment and try again');
      }
      
      process.exit(1);
    }
    
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distance = (route.summary.distance / 1000).toFixed(1);
      const duration = Math.round(route.summary.duration / 60);
      
      console.log('✅ SUCCESS!');
      console.log('\nRoute details:');
      console.log('  Distance:', distance, 'km');
      console.log('  Duration:', duration, 'minutes');
      
      // Geometry might be encoded polyline or coordinates array
      if (route.geometry) {
        if (Array.isArray(route.geometry.coordinates)) {
          console.log('  Coordinates:', route.geometry.coordinates.length, 'points');
        } else if (typeof route.geometry === 'string') {
          console.log('  Geometry: Encoded polyline');
        }
      }
      
      console.log('\n✅ ORS API is working correctly!');
    } else {
      console.error('❌ No routes found in response');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nPossible issues:');
    console.log('- Network connection');
    console.log('- Invalid API key');
    console.log('- API service down');
  }
}

testORS();
