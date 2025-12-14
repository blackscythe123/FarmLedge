import { AwarenessResource } from '../models/awarenessResource.js'

const fallbackResources = [
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

export async function listResources({ crop, scope, scheme, limit = 20 } = {}) {
  const query = {}
  if (crop) query.cropTypes = { $in: [new RegExp(`^${crop}$`, 'i')] }
  if (scope) query.scope = scope
  if (scheme) query.linkedSchemes = { $in: [scheme] }
  const docs = await AwarenessResource.find(query).limit(limit).lean()
  if (docs.length) return docs

  // Fallback to static resources if DB is empty
  const filtered = fallbackResources.filter((r) => {
    const matchesCrop = crop ? r.cropTypes?.some((c) => c.toLowerCase() === String(crop).toLowerCase()) : true
    const matchesScope = scope ? r.scope === scope : true
    const matchesScheme = scheme ? r.linkedSchemes?.includes(scheme) : true
    return matchesCrop && matchesScope && matchesScheme
  })

  // Upsert asynchronously (best-effort) so future calls hit Mongo
  upsertResources(fallbackResources).catch((e) => console.warn('[awareness] upsert fallback failed', e?.message || e))
  return filtered.slice(0, limit)
}

export async function upsertResources(resources) {
  if (!Array.isArray(resources)) throw new Error('resources must be an array')
  const ops = resources.map((r) => ({
    updateOne: {
      filter: { title: r.title },
      update: r,
      upsert: true,
      setDefaultsOnInsert: true
    }
  }))
  if (ops.length === 0) return { matched: 0, upserted: 0 }
  const res = await AwarenessResource.bulkWrite(ops)
  return { matched: res.nMatched, upserted: res.nUpserted }
}
