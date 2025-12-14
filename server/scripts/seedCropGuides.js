// Seed crop zero-loss guides into MongoDB
import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { CropGuide } from '../src/models/cropGuide.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmledge'
const DATA_FILE = process.env.CROP_GUIDE_FILE || path.join(__dirname, '..', 'data', 'crop_guides.json')

const fallbackGuides = [
  {
    cropName: 'Tomato',
    category: 'Vegetable',
    shelfLife: {
      normal: '2-3 days at room temp',
      coldStorage: '7-10 days at 8-10C',
      daysInNumbers: { normal: 3, extended: 10 }
    },
    zeroLossMeasures: {
      primary: 'Shade pre-cooling within 2 hours of harvest; use ventilated crates.',
      secondary: [
        'Sort and grade to remove cracked fruit.',
        'Use perforated liners to reduce condensation.'
      ],
      processingOptions: [
        { type: 'Pulp', relatedUnits: ['Mini pulper', 'Steam blancher'] },
        { type: 'Sun-dried flakes', relatedUnits: ['Solar dryer', 'Tray dryer'] }
      ]
    },
    sellingChannels: {
      direct: ['Local haats', 'RWBCIS-linked FPO stalls'],
      aggregation: ['FPO packhouse', 'APMC collection point'],
      processing: ['Pulping unit', 'Drying unit'],
      government: ['NHB packhouse schemes']
    },
    alternateMarkets: [
      {
        marketType: 'Processing grade',
        description: 'Lower visual grade accepted for pulp.',
        priceRange: '70-80% of table grade',
        processingTime: 'Same day pulping recommended'
      }
    ],
    mnregaPotential: { eligible: true, wasteConversionRate: '10% peel/seed to compost', dailyWage: 250 },
    recommendations: [
      'Harvest at breaker stage for transport >100km.',
      'Use zero-cost bamboo racks for shade curing before dispatch.'
    ],
    ipfsDocHash: ''
  }
]

async function loadGuides() {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(raw)
  }
  console.warn(`Data file not found at ${DATA_FILE}; using fallback sample data.`)
  return fallbackGuides
}

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log(`Connected to ${MONGODB_URI}`)

  const guides = await loadGuides()
  if (!Array.isArray(guides) || guides.length === 0) {
    throw new Error('No guides to seed')
  }

  for (const guide of guides) {
    await CropGuide.findOneAndUpdate(
      { cropName: guide.cropName },
      guide,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  }

  console.log(`Seeded ${guides.length} crop guides`)
  await mongoose.disconnect()
  console.log('Disconnected')
}

seed().catch(async (err) => {
  console.error('Seeding failed', err)
  try { await mongoose.disconnect() } catch (_) { /* ignore */ }
  process.exit(1)
})
