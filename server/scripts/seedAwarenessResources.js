// Seed awareness resources (CSIR/CFTRI style) into MongoDB
import mongoose from 'mongoose'
import { AwarenessResource } from '../src/models/awarenessResource.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmledge'

const sampleResources = [
  {
    title: 'Tomato handling and cold chain (CFTRI)',
    cropTypes: ['Tomato'],
    scope: 'storage',
    resourceType: 'cftri-guide',
    summary: 'Shade pre-cooling, ventilated crates, cold chain at 10-12C to slow ripening.',
    link: 'https://cftri.res.in/services',
    language: 'en',
    zeroLossMeasures: [
      'Pre-cool within 2 hours; avoid water sprays that cause decay.',
      'Use perforated liners to keep RH high without condensation.'
    ],
    processorContacts: [
      { type: 'pulping-unit', nearbyFacilities: ['Local FPO pulper'], averagePrice: 10 }
    ],
    shelfLifeChart: { normal: 3, coldStorage: 10, recommendations: 'Hold at 10-12C, 90-95% RH' },
    linkedSchemes: ['PMFBY']
  },
  {
    title: 'Mango pulp hygiene (CFTRI)',
    cropTypes: ['Mango'],
    scope: 'processing',
    resourceType: 'cftri-guide',
    summary: 'Hygienic pulp extraction and hot-fill guidance.',
    link: 'https://cftri.res.in/services',
    language: 'en',
    zeroLossMeasures: [
      'Hot water dip 52C for 5 minutes to reduce spoilage.',
      'Use food-grade bins; avoid latex contamination.'
    ],
    processorContacts: [
      { type: 'pulp-unit', nearbyFacilities: ['Regional pulp unit'], averagePrice: 25 }
    ],
    shelfLifeChart: { normal: 7, coldStorage: 24, recommendations: 'Ripen at 12-14C controlled rooms' },
    linkedSchemes: ['MIDH']
  },
  {
    title: 'Onion dehydration basics (CFTRI)',
    cropTypes: ['Onion'],
    scope: 'processing',
    resourceType: 'cftri-guide',
    summary: 'Tray drying and powder processing steps.',
    link: 'https://cftri.res.in/services',
    language: 'en',
    zeroLossMeasures: [
      'Cure bulbs 10-15 days; maintain airflow before dehydration.',
      'Use mesh bags to reduce moisture pockets.'
    ],
    processorContacts: [
      { type: 'dehydration-unit', nearbyFacilities: ['Local dehydrator'], averagePrice: 18 }
    ],
    shelfLifeChart: { normal: 25, coldStorage: 135, recommendations: 'Dehydrate over-mature bulbs within 5 days' },
    linkedSchemes: ['NHB']
  }
]

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log(`Connected to ${MONGODB_URI}`)
  await AwarenessResource.deleteMany({})
  await AwarenessResource.insertMany(sampleResources)
  console.log(`Seeded ${sampleResources.length} awareness resources`)
  await mongoose.disconnect()
  console.log('Disconnected')
}

seed().catch(async (err) => {
  console.error('Seeding failed', err)
  try { await mongoose.disconnect() } catch (_) { /* ignore */ }
  process.exit(1)
})
