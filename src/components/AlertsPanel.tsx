import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CloudRain, Droplets, Loader2, MapPin, RefreshCw, ShieldCheck, ThermometerSun, Wind } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const FALLBACK_COORDS = { lat: 20.2961, lon: 85.8245 }; // Bhubaneswar, Odisha

const severityColor: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

const formatTemp = (t?: number) => (typeof t === "number" ? `${Math.round(t)}°C` : "--");
const formatPercent = (v?: number) => (typeof v === "number" ? `${Math.round(v)}%` : "--");
const formatNumber = (v?: number, unit = "") => (typeof v === "number" ? `${Math.round(v)}${unit}` : "--");

const formatTime = (ts?: number) => {
  if (!ts) return "--";
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(ts * 1000);
};

async function fetchWeather(lat: number, lon: number) {
  const resp = await fetch(`/api/weather/current?lat=${lat}&lon=${lon}&lang=en`);
  const data = await resp.json();
  if (!resp.ok || !data?.ok) {
    throw new Error(data?.error || "weather_error");
  }
  return data;
}

function mapErrorMessage(msg?: string) {
  switch (msg) {
    case "openweather_unauthorized":
      return "Weather service auth failed (OpenWeather 401). Check or rotate API key.";
    case "openweather_rate_limited":
      return "Weather service rate-limited. Please retry in a bit.";
    case "location_not_supported":
      return "Only Odisha locations are supported right now.";
    case "invalid_coordinates":
      return "Could not read your location. Try again with permissions enabled.";
    default:
      return msg || "Unable to fetch weather data.";
  }
}

type AlertItem = {
  type?: string;
  alertType?: string;
  message?: string;
  severity?: string;
};

const AlertsPanel = () => {
  const [coords, setCoords] = useState(FALLBACK_COORDS);
  const [coordsReady, setCoordsReady] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setCoordsReady(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });
        setCoordsReady(true);
      },
      () => {
        setCoords(FALLBACK_COORDS);
        setCoordsReady(true);
      },
      { enableHighAccuracy: false, timeout: 6000 }
    );
  }, []);

  const query = useQuery({
    queryKey: ["weather-alerts", coords.lat, coords.lon],
    queryFn: () => fetchWeather(coords.lat, coords.lon),
    enabled: coordsReady,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const alerts: AlertItem[] = useMemo(() => query.data?.alerts || [], [query.data]);
  const current = query.data?.weather?.current || {};
  const fullForecast = query.data?.weather?.forecast || [];
  const timezoneOffsetSeconds = query.data?.weather?.timezone ?? 0;
  const forecast24 = useMemo(() => fullForecast.slice(0, 8), [fullForecast]); // next 24h (3h steps)

  const dailyForecast = useMemo(() => {
    const byDay = new Map<string, { min: number; max: number; precip: number; humidSum: number; humidCount: number; date: Date }>();
    for (const f of fullForecast) {
      const dt = f?.dt ? new Date((f.dt + timezoneOffsetSeconds) * 1000) : null;
      if (!dt) continue;
      const key = dt.toISOString().slice(0, 10);
      const entry = byDay.get(key) || { min: Infinity, max: -Infinity, precip: 0, humidSum: 0, humidCount: 0, date: dt };
      const tMin = Number(f?.main?.temp_min);
      const tMax = Number(f?.main?.temp_max ?? f?.main?.temp);
      if (Number.isFinite(tMin)) entry.min = Math.min(entry.min, tMin);
      if (Number.isFinite(tMax)) entry.max = Math.max(entry.max, tMax);
      entry.precip += (f?.rain?.["3h"] || 0) + (f?.snow?.["3h"] || 0);
      const h = Number(f?.main?.humidity);
      if (Number.isFinite(h)) {
        entry.humidSum += h;
        entry.humidCount += 1;
      }
      byDay.set(key, entry);
    }
    return Array.from(byDay.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5)
      .map((d) => ({
        label: new Intl.DateTimeFormat("en-IN", { weekday: "short", month: "short", day: "numeric" }).format(d.date),
        min: Number.isFinite(d.min) ? d.min : undefined,
        max: Number.isFinite(d.max) ? d.max : undefined,
        precip: d.precip,
        humidity: d.humidCount ? d.humidSum / d.humidCount : undefined,
      }));
  }, [fullForecast]);

  const rainNext24 = useMemo(
    () => forecast24.reduce((sum: number, f: any) => sum + (f?.rain?.["3h"] || 0) + (f?.snow?.["3h"] || 0), 0),
    [forecast24]
  );

  const locationLabel = useMemo(
    () => `Lat ${coords.lat.toFixed(2)}, Lon ${coords.lon.toFixed(2)}`,
    [coords.lat, coords.lon]
  );

  const errorMessage = query.error instanceof Error ? mapErrorMessage(query.error.message) : null;
  const isBusy = query.isLoading || query.isFetching;

  return (
    <div className="space-y-6">
      <Card className="p-4 md:p-6 bg-white/70 border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-100 border border-blue-50">
              <ShieldCheck className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-blue-700/70 font-semibold">Weather Guard</p>
              <h2 className="text-xl font-bold text-slate-900">Live alerts tuned for Odisha</h2>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                {locationLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
              {query.isFetching ? "Updating..." : "Synced"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => query.refetch()}
              disabled={isBusy}
              className="gap-2"
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
        ) : null}
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 via-white to-cyan-50 border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Current</p>
            <Badge className="bg-blue-600 text-white">
              {current?.weather?.[0]?.main || "Weather"}
            </Badge>
          </div>
          <div className="flex items-end gap-3">
            <ThermometerSun className="h-10 w-10 text-blue-700" />
            <div>
              <p className="text-4xl font-bold text-slate-900">
                {isBusy ? <Skeleton className="h-10 w-20" /> : formatTemp(current?.main?.temp)}
              </p>
              <p className="text-sm text-slate-600">Feels like {formatTemp(current?.main?.feels_like)}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-600" />
              <span>Humidity {isBusy ? <Skeleton className="inline-block h-4 w-10" /> : formatPercent(current?.main?.humidity)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-blue-600" />
              <span>Wind {isBusy ? <Skeleton className="inline-block h-4 w-12" /> : formatNumber(current?.wind?.speed, " m/s")}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-amber-100 bg-gradient-to-br from-amber-50 via-white to-amber-50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Moisture</p>
            <Badge className="bg-amber-500 text-white">Next 24h</Badge>
          </div>
          <div className="flex items-end gap-3">
            <CloudRain className="h-10 w-10 text-amber-600" />
            <div>
              <p className="text-3xl font-bold text-slate-900">
                {isBusy ? <Skeleton className="h-8 w-16" /> : `${rainNext24.toFixed(1)} mm`}
              </p>
              <p className="text-sm text-slate-600">Accumulated rainfall forecast</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-600 space-y-1">
            <p>
              {forecast24[0]?.weather?.[0]?.description
                ? forecast24[0].weather[0].description
                : "Stable conditions expected"}
            </p>
            <p className="text-amber-700 font-semibold">Irrigation & drying windows auto-detected.</p>
          </div>
        </Card>

        <Card className="p-4 border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-green-50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Outlook</p>
            <Badge className="bg-emerald-600 text-white">Advisory</Badge>
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            {alerts.slice(0, 2).map((a, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-emerald-700 font-semibold">•</span>
                <span>{a.message}</span>
              </div>
            ))}
            {alerts.length === 0 ? <p>No alerts right now. Good window for field work.</p> : null}
          </div>
        </Card>
      </div>

      <Card className="p-4 md:p-6 border-slate-100 bg-white/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Alert Center</p>
            <h3 className="text-xl font-bold text-slate-900">Actionable notifications</h3>
          </div>
          <Badge variant="outline" className="border-slate-200 text-slate-700">
            {alerts.length} active
          </Badge>
        </div>

        {isBusy && !alerts.length ? (
          <div className="space-y-3">
            {[1, 2, 3].map((k) => (
              <Skeleton key={k} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : alerts.length ? (
          <div className="space-y-3">
            {alerts.map((a, idx) => (
              <div
                key={`${a.alertType || a.type}-${idx}`}
                className="flex flex-col md:flex-row md:items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3"
              >
                <Badge className={severityColor[a.severity || "low"] || severityColor.low}>
                  {a.alertType || a.type || "Alert"}
                </Badge>
                <p className="text-sm text-slate-800 leading-relaxed">{a.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-3 text-emerald-700 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Fields are safe. We will notify you if conditions change.</span>
          </div>
        )}
      </Card>

      <Card className="p-4 md:p-6 border-slate-100 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Next 24 hours</p>
            <h3 className="text-xl font-bold text-slate-900">Hourly forecast</h3>
          </div>
          <Badge variant="outline" className="border-slate-200 text-slate-700">
            Updated {current?.dt ? formatTime(current.dt) : "just now"}
          </Badge>
        </div>
        <div className="grid md:grid-cols-4 gap-3">
          {forecast24.length ? (
            forecast24.map((f: any, idx: number) => (
              <div
                key={`${f?.dt || idx}`}
                className="rounded-xl border border-slate-100 bg-white/70 p-3 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>{formatTime(f?.dt)}</span>
                  <span className="capitalize">{f?.weather?.[0]?.main || "--"}</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1">{formatTemp(f?.main?.temp)}</p>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Droplets className="h-4 w-4 text-blue-600" />
                  {formatPercent(f?.main?.humidity)}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                  <CloudRain className="h-4 w-4 text-blue-600" />
                  {(f?.rain?.["3h"] || f?.snow?.["3h"]) ? `${((f?.rain?.["3h"] || 0) + (f?.snow?.["3h"] || 0)).toFixed(1)} mm` : "Low rain"}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-sm text-slate-600">No forecast data available.</div>
          )}
        </div>
      </Card>

      <Card className="p-4 md:p-6 border-slate-100 bg-white/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">5-day outlook</p>
            <h3 className="text-xl font-bold text-slate-900">Daily summary</h3>
          </div>
          <Badge variant="outline" className="border-slate-200 text-slate-700">5-day</Badge>
        </div>
        <div className="grid md:grid-cols-5 gap-3">
          {dailyForecast.length ? (
            dailyForecast.map((d, idx) => (
              <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-3 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase">{d.label}</p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {formatTemp(d.max)} / {formatTemp(d.min)}
                </p>
                <div className="text-sm text-slate-600 mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-600" />
                    Humidity {formatPercent(d.humidity)}
                  </div>
                  <div className="flex items-center gap-2">
                    <CloudRain className="h-4 w-4 text-blue-600" />
                    {d.precip ? `${d.precip.toFixed(1)} mm` : "Low rain"}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-5 text-sm text-slate-600">5-day forecast not available yet.</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export { AlertsPanel };
export default AlertsPanel;
