import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ShieldCheck, Search, Leaf, Store, Factory, BookOpen } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from 'react-i18next'

function useCropGuides() {
  const { i18n } = useTranslation()
  return useQuery({
    queryKey: ['crop-guides', i18n.language],
    queryFn: async () => {
      const res = await fetch(`/api/crop-guides?lang=${i18n.language}`)
      const data = await res.json()
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'crop_guides_error')
      return Array.isArray(data.guides) ? data.guides : []
    },
    staleTime: 10 * 60 * 1000,
  })
}

const FarmerGuides = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { data: guides = [], isLoading, error } = useCropGuides()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return guides.filter((g: any) => g?.cropName?.toLowerCase().includes(term))
  }, [guides, search])

  const active = useMemo(() => {
    if (!selected && filtered.length) return filtered[0]
    return filtered.find((g: any) => g.cropName === selected) || filtered[0]
  }, [filtered, selected])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-40 pb-24 bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 mb-8">
            <div className="p-6 bg-white/90 rounded-2xl shadow-lg">
              <BookOpen className="h-16 w-16 text-green-600" />
            </div>
            <div>
              <Badge className="mb-3 bg-white/20 text-white border-white/30 text-base px-4 py-2">
                {t('guides.zeroLossPlaybook')}
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">
                {t('guides.title')}
              </h1>
              <p className="text-green-50 text-xl leading-relaxed">
                {t('guides.subtitle')}
              </p>
            </div>
            {user?.role && (
              <Badge className="ml-auto bg-white/20 text-white border-white/30 text-base px-4 py-2">
                {t('guides.signedInAs', { role: user.role })}
              </Badge>
            )}
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 -mt-12 pb-16 space-y-8 relative z-10">

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 border-emerald-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800 text-xl">
                <Search className="w-5 h-5" /> {t('guides.findCrop')}
              </CardTitle>
              <CardDescription className="text-base">{t('guides.chooseCrop')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder={t('guides.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="max-h-[420px] overflow-auto space-y-2 pr-1">
                {isLoading ? (
                  <p className="text-base text-slate-500">{t('guides.loading')}</p>
                ) : error ? (
                  <p className="text-base text-red-600">{t('guides.failed')}</p>
                ) : filtered.length === 0 ? (
                  <p className="text-base text-slate-500">{t('guides.noMatches')}</p>
                ) : (
                  filtered.map((g: any) => (
                    <Button
                      key={g.cropName}
                      variant={active?.cropName === g.cropName ? 'secondary' : 'ghost'}
                      className="w-full justify-start text-left text-base"
                      onClick={() => setSelected(g.cropName)}
                    >
                      <Leaf className="w-5 h-5 mr-2 text-emerald-700" />
                      <span className="font-medium text-slate-800">{t(`crops.${g.cropName}`, g.cropName as string)}</span>
                      {g.category ? (
                        <Badge variant="outline" className="ml-auto text-sm bg-emerald-50 border-emerald-200 text-emerald-700">
                          {g.category}
                        </Badge>
                      ) : null}
                    </Button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-sm border-slate-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 text-2xl">
                <ShieldCheck className="w-6 h-6 text-emerald-700" />
                {active ? t(`crops.${active.cropName}`, active.cropName as string) : t('guides.selectCrop')}
              </CardTitle>
              <CardDescription className="text-base">{t('guides.detailsSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 text-lg text-slate-700">
              {!active ? (
                <p className="text-slate-500">{t('guides.pickCrop')}</p>
              ) : (
                <div className="space-y-4">
                  {active.shelfLife ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                      <p className="font-semibold text-emerald-900">{t('guides.shelfLife')}</p>
                      <p className="text-emerald-800">{active.shelfLife.normal ? `${t('guides.ambient')}: ${active.shelfLife.normal}` : ''} {active.shelfLife.coldStorage ? `| ${t('guides.cold')}: ${active.shelfLife.coldStorage}` : ''}</p>
                    </div>
                  ) : null}

                  {active.zeroLossMeasures?.primary ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">{t('guides.primaryHandling')}</p>
                      <p>{active.zeroLossMeasures.primary}</p>
                    </div>
                  ) : null}

                  {active.zeroLossMeasures?.secondary?.length ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">{t('guides.secondarySteps')}</p>
                      <div className="space-y-1">
                        {active.zeroLossMeasures.secondary.map((s: string, idx: number) => (
                          <p key={idx}>• {s}</p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {active.zeroLossMeasures?.processingOptions?.length ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 flex items-center gap-2"><Factory className="w-5 h-5" /> {t('guides.processingOptions')}</p>
                      <div className="space-y-1">
                        {active.zeroLossMeasures.processingOptions.map((opt: any, idx: number) => (
                          <p key={idx}>• {opt.type}{opt.relatedUnits?.length ? ` — ${opt.relatedUnits.join(', ')}` : ''}</p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {active.alternateMarkets?.length ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 flex items-center gap-2"><Store className="w-5 h-5" /> {t('guides.alternateMarkets')}</p>
                      <div className="space-y-1">
                        {active.alternateMarkets.map((m: any, idx: number) => (
                          <p key={idx}>• {m.marketType}: {m.description} {m.priceRange ? `(${m.priceRange})` : ''}</p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {active.recommendations?.length ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 flex items-center gap-2"><BookOpen className="w-5 h-5" /> {t('guides.recommendations')}</p>
                      <div className="space-y-1">
                        {active.recommendations.map((r: string, idx: number) => (
                          <p key={idx}>• {r}</p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {active.mnregaPotential ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">{t('guides.mnregaPotential')}</p>
                      <p>{t('guides.eligible')}: {active.mnregaPotential.eligible ? t('guides.yes') : t('guides.no')}{active.mnregaPotential.dailyWage ? ` | ${t('guides.dailyWage')} ~₹${active.mnregaPotential.dailyWage}` : ''}</p>
                      {active.mnregaPotential.wasteConversionRate ? <p>{t('guides.wasteConversion')}: {active.mnregaPotential.wasteConversionRate}</p> : null}
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default FarmerGuides
