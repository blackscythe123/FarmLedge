import axios from 'axios'
import { WeatherAlert } from '../models/weatherAlert.js'

const API_BASE = 'https://api.openweathermap.org/data/2.5'
const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

// Simple bounding box for Odisha to avoid off-target requests
function isInOdisha(lat, lon) {
  if (lat == null || lon == null) return false
  return lat >= 17.8 && lat <= 23.6 && lon >= 81.4 && lon <= 87.6
}

// Light in-memory quota to stay under free tier (resets daily)
const QUOTA_MAX = 900 // keep headroom under 1000 free calls
const quota = { count: 0, resetAt: 0 }
function ensureQuota() {
  const now = Date.now()
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0)
  if (now >= quota.resetAt) {
    quota.count = 0
    quota.resetAt = midnight.getTime()
  }
  if (quota.count >= QUOTA_MAX) throw new Error('weather_quota_exceeded')
  quota.count += 1
}

function analyzeConditions({ current, forecastList = [] }) {
  const alerts = []
  const temp = current?.main?.temp
  const humidity = current?.main?.humidity
  const rainNow = current?.rain?.['1h'] || 0
  const snowNow = current?.snow?.['1h'] || 0

  // Forecast aggregates (3h steps). We'll look at next 24h and 72h windows.
  const next24 = forecastList.slice(0, 8) // 8 * 3h = 24h
  const next72 = forecastList.slice(0, 24) // 24 * 3h = 72h

  const precipNext24 = next24.reduce((sum, f) => sum + (f?.rain?.['3h'] || 0) + (f?.snow?.['3h'] || 0), 0)
  const precipNext72 = next72.reduce((sum, f) => sum + (f?.rain?.['3h'] || 0) + (f?.snow?.['3h'] || 0), 0)

  const minTempNext24 = Math.min(...next24.map(f => f?.main?.temp_min).filter(Number.isFinite), temp ?? Infinity)
  const maxTempNext24 = Math.max(...next24.map(f => f?.main?.temp_max).filter(Number.isFinite), temp ?? -Infinity)

  if (temp != null && temp <= 5) {
    alerts.push({ type: 'frost', severity: 'high', message: 'Frost risk: protect crops tonight.' })
  } else if (Number.isFinite(minTempNext24) && minTempNext24 <= 5) {
    alerts.push({ type: 'frost', severity: 'medium', message: 'Frost risk in the next day. Prepare covers/irrigation.' })
  }

  if ((rainNow + snowNow) < 0.5 && humidity != null && humidity < 40 && precipNext24 < 2) {
    alerts.push({ type: 'irrigation', severity: 'medium', message: 'Dry conditions: plan irrigation soon.' })
  }

  if (precipNext72 >= 20) {
    alerts.push({ type: 'monsoon', severity: 'medium', message: 'Heavy rain expected within 3 days. Secure storage and drainage.' })
  }

  if ((temp != null && temp >= 35) || (Number.isFinite(maxTempNext24) && maxTempNext24 >= 38)) {
    alerts.push({ type: 'heat', severity: 'medium', message: 'High heat: consider shade/irrigation to reduce stress.' })
  }

  const lowRainWindow = precipNext72 < 5 && humidity != null && humidity >= 40 && humidity <= 75
  if (lowRainWindow) {
    alerts.push({ type: 'harvest', severity: 'low', message: 'Good harvest window (low rain, moderate humidity) in coming days.' })
  }

  return alerts
}

export async function fetchWeatherAndAlerts({ lat, lon, lang = 'en', farmerId, batchId }) {
  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey) throw new Error('OPENWEATHER_API_KEY missing')
  const latNum = toNum(lat)
  const lonNum = toNum(lon)
  if (latNum == null || lonNum == null) throw new Error('invalid_coordinates')
  if (!isInOdisha(latNum, lonNum)) throw new Error('location_not_supported')

  ensureQuota()

  const baseParams = {
    lat: latNum,
    lon: lonNum,
    units: process.env.OPENWEATHER_UNITS || 'metric',
    appid: apiKey,
  }

  let currentResp
  let forecastResp
  try {
    // Free plan: use /weather (current) and /forecast (3h, up to 5 days)
    currentResp = await axios.get(`${API_BASE}/weather`, { params: baseParams })
    // Free plan: up to 5 days in 3h steps. Request 40 entries (~5 days) but keep alert logic focused on near-term windows.
    forecastResp = await axios.get(`${API_BASE}/forecast`, { params: { ...baseParams, cnt: 40 } })
  } catch (err) {
    const status = err?.response?.status
    const body = err?.response?.data
    console.warn('[weather] openweather error', { status, body })
    if (status === 401) throw new Error('openweather_unauthorized')
    if (status === 429) throw new Error('openweather_rate_limited')
    throw err
  }

  const current = currentResp?.data || {}
  const forecastList = forecastResp?.data?.list || []
  const timezone = forecastResp?.data?.city?.timezone || 0
  const alerts = analyzeConditions({ current, forecastList })

  if (alerts.length) {
    const slimSnapshot = {
      temp: current?.main?.temp,
      humidity: current?.main?.humidity,
      rain1h: current?.rain?.['1h'] || 0,
      snow1h: current?.snow?.['1h'] || 0,
      forecast: forecastList.slice(0, 8).map((f) => ({
        dt: f?.dt,
        temp: f?.main?.temp,
        humidity: f?.main?.humidity,
        rain3h: f?.rain?.['3h'] || 0,
        snow3h: f?.snow?.['3h'] || 0,
      })),
    }

    const docs = alerts.map((a) => ({
      farmerId,
      batchId,
      alertType: a.type,
      message: a.message,
      severity: a.severity,
      lang,
      location: { lat: latNum, lon: lonNum },
      weatherSnapshot: slimSnapshot
    }))
    await WeatherAlert.insertMany(docs)
  }

  return { weather: { current, forecast: forecastList, timezone }, alerts }
}

export async function getAlertHistory({ farmerId, limit = 20 }) {
  const q = farmerId ? { farmerId } : {}
  return WeatherAlert.find(q).sort({ createdAt: -1 }).limit(Number(limit) || 20)
}
